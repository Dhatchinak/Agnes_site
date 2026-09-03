const LOCAL_STATUS_KEY = 'agnes_secret_heart_live_status_v1';
const LOCAL_CHANNEL = 'agnes_secret_heart_live_channel_v1';
const SESSION_KEY = 'agnes_secret_heart_active_session_v1';

let activeSessionId = null;
let channel = null;

const getChannel = () => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
  if (!channel) channel = new BroadcastChannel(LOCAL_CHANNEL);
  return channel;
};

export const getTrackingBaseUrl = () => {
  const configured = import.meta.env.VITE_SECRET_TRACKING_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:5050';
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
};

const nowIso = () => new Date().toISOString();

const makeSessionId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `secret-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const readLocalStatus = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STATUS_KEY) || 'null');
  } catch {
    return null;
  }
};

const writeLocalStatus = (patch) => {
  const previous = readLocalStatus() || {};
  const next = { ...previous, ...patch, lastSeenAt: nowIso() };
  try {
    localStorage.setItem(LOCAL_STATUS_KEY, JSON.stringify(next));
    getChannel()?.postMessage(next);
  } catch {
    // local storage can be unavailable in private mode
  }
  return next;
};

const emitRemote = (eventName, payload, keepalive = false) => {
  const baseUrl = getTrackingBaseUrl();
  if (!baseUrl) return;
  try {
    fetch(`${baseUrl}/api/secret-heart/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, payload }),
      keepalive
    }).catch(() => {});
  } catch {
    // Same-browser local preview still works without the realtime server.
  }
};

export function beginSecretHeartSession(initialScene = 'cinematic-intro') {
  activeSessionId = makeSessionId();
  const enteredAt = nowIso();
  try { sessionStorage.setItem(SESSION_KEY, activeSessionId); } catch { /* ignore */ }

  writeLocalStatus({
    sessionId: activeSessionId,
    online: true,
    enteredAt,
    leftAt: null,
    exitReason: null,
    currentScene: initialScene,
    currentSceneEnteredAt: enteredAt,
    choice: null,
    choiceAt: null,
    sceneHistory: [{ scene: initialScene, at: enteredAt }]
  });

  emitRemote('entered', { sessionId: activeSessionId, scene: initialScene, at: enteredAt });
  return activeSessionId;
}

const currentSessionId = () => {
  if (activeSessionId) return activeSessionId;
  try {
    activeSessionId = sessionStorage.getItem(SESSION_KEY);
  } catch {
    activeSessionId = null;
  }
  return activeSessionId;
};

export function trackSecretScene(scene) {
  const sessionId = currentSessionId();
  if (!sessionId || !scene || scene === 'password') return;
  const at = nowIso();
  const previous = readLocalStatus() || {};
  const history = Array.isArray(previous.sceneHistory) ? [...previous.sceneHistory] : [];
  if (history.at(-1)?.scene !== scene) history.push({ scene, at });

  writeLocalStatus({
    sessionId,
    online: true,
    currentScene: scene,
    currentSceneEnteredAt: at,
    sceneHistory: history.slice(-40)
  });
  emitRemote('scene', { sessionId, scene, at });
}

export function trackSecretChoice(choice) {
  const sessionId = currentSessionId();
  if (!sessionId) return;
  const at = nowIso();
  writeLocalStatus({ sessionId, online: true, choice, choiceAt: at });
  emitRemote('choice', { sessionId, choice, at });
}

export function sendSecretHeartbeat() {
  const sessionId = currentSessionId();
  if (!sessionId) return;
  const at = nowIso();
  writeLocalStatus({ sessionId, online: true });
  emitRemote('heartbeat', { sessionId, at });
}

export function endSecretHeartSession(reason = 'closed') {
  const sessionId = currentSessionId();
  if (!sessionId) return;
  const at = nowIso();
  writeLocalStatus({ sessionId, online: false, leftAt: at, exitReason: reason });
  emitRemote('left', { sessionId, at, reason }, true);
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  activeSessionId = null;
}

export function subscribeLocalSecretStatus(callback) {
  if (typeof window === 'undefined') return () => {};
  callback(readLocalStatus());

  const storageListener = (event) => {
    if (event.key !== LOCAL_STATUS_KEY) return;
    try { callback(event.newValue ? JSON.parse(event.newValue) : null); } catch { /* ignore */ }
  };
  window.addEventListener('storage', storageListener);

  const localChannel = getChannel();
  const channelListener = (event) => callback(event.data);
  localChannel?.addEventListener('message', channelListener);

  return () => {
    window.removeEventListener('storage', storageListener);
    localChannel?.removeEventListener('message', channelListener);
  };
}
