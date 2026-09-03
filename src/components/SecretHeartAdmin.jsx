import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  Eye,
  Heart,
  LogOut,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle
} from 'lucide-react';
import { getTrackingBaseUrl, subscribeLocalSecretStatus } from '../services/secretHeartTracker';
import '../secret-heart-admin.css';

const TOKEN_KEY = 'agnes_secret_admin_token_v1';

const SCENES = [
  ['cinematic-intro', 'Opening cinematic'],
  ['opening', 'Our unwritten chapter'],
  ['identity', 'Every name leads back to you'],
  ['memories', 'Memories we already have'],
  ['future', 'Future memories'],
  ['little-world', 'Our little world'],
  ['last-breath', 'The deepest wish'],
  ['choice', 'One important truth'],
  ['question', 'The question'],
  ['yes-quiet', 'She chose yes'],
  ['promises', 'Promises'],
  ['keepsake', 'Keepsake'],
  ['time', 'She chose no']
];

const SCENE_LABEL = Object.fromEntries(SCENES);
const SCENE_INDEX = Object.fromEntries(SCENES.map(([key], index) => [key, index]));

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function ChoiceBadge({ choice }) {
  if (choice === 'yes') {
    return <div className="sha-choice is-yes"><CheckCircle2 /><div><small>HER ANSWER</small><strong>YES</strong></div></div>;
  }
  if (choice === 'no') {
    return <div className="sha-choice is-no"><XCircle /><div><small>HER ANSWER</small><strong>NO</strong></div></div>;
  }
  return <div className="sha-choice is-pending"><Heart /><div><small>HER ANSWER</small><strong>Waiting…</strong></div></div>;
}

export default function SecretHeartAdmin() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [status, setStatus] = useState(null);
  const [connection, setConnection] = useState('connecting');
  const [mode, setMode] = useState('remote');
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [now, setNow] = useState(Date.now());
  const eventSourceRef = useRef(null);

  const baseUrl = getTrackingBaseUrl();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    let disposed = false;
    let unsubscribeLocal = () => {};
    const controller = new AbortController();

    const useLocalPreview = () => {
      if (disposed) return;
      setMode('local');
      setConnection('local');
      unsubscribeLocal = subscribeLocalSecretStatus((next) => {
        if (next) setStatus(next);
      });
    };

    const connect = async () => {
      setConnection('connecting');
      try {
        const response = await fetch(`${baseUrl}/api/secret-heart/status`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        if (response.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken('');
          setError('Admin session expired. Please sign in again.');
          return;
        }
        if (!response.ok) throw new Error('status unavailable');

        const body = await response.json();
        if (!disposed) setStatus(body.status || null);

        const stream = new EventSource(`${baseUrl}/api/secret-heart/stream?token=${encodeURIComponent(token)}`);
        eventSourceRef.current = stream;
        stream.onopen = () => {
          setMode('remote');
          setConnection('live');
        };
        stream.onmessage = (event) => {
          try {
            const next = JSON.parse(event.data);
            setStatus(next);
          } catch {
            // ignore malformed event
          }
        };
        stream.onerror = () => setConnection('reconnecting');
      } catch (fetchError) {
        if (fetchError?.name !== 'AbortError') useLocalPreview();
      }
    };

    connect();

    return () => {
      disposed = true;
      controller.abort();
      unsubscribeLocal();
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [baseUrl, token]);

  const login = async (event) => {
    event.preventDefault();
    if (!password.trim()) return;
    setLoggingIn(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Wrong admin password.');
        throw new Error('Realtime server is not reachable.');
      }
      const body = await response.json();
      sessionStorage.setItem(TOKEN_KEY, body.token);
      setToken(body.token);
      setPassword('');
    } catch (loginError) {
      const localPassword = import.meta.env.VITE_SECRET_ADMIN_PREVIEW_PASSWORD;
      if (localPassword && password === localPassword) {
        const previewToken = 'local-preview';
        sessionStorage.setItem(TOKEN_KEY, previewToken);
        setToken(previewToken);
        setMode('local');
        setPassword('');
      } else {
        setError(loginError.message || 'Unable to sign in.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    eventSourceRef.current?.close();
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setStatus(null);
    setError('');
  };

  const lastSeenMs = status?.lastSeenAt ? new Date(status.lastSeenAt).getTime() : null;
  const isOnline = Boolean(status?.online && (!lastSeenMs || now - lastSeenMs < 35000));
  const enteredAtMs = status?.enteredAt ? new Date(status.enteredAt).getTime() : null;
  const endAtMs = isOnline ? now : status?.leftAt ? new Date(status.leftAt).getTime() : lastSeenMs || now;
  const duration = enteredAtMs ? Math.max(0, endAtMs - enteredAtMs) : 0;
  const currentSceneAtMs = status?.currentSceneEnteredAt ? new Date(status.currentSceneEnteredAt).getTime() : null;
  const currentSceneDuration = currentSceneAtMs ? Math.max(0, (isOnline ? now : endAtMs) - currentSceneAtMs) : 0;
  const sceneLabel = SCENE_LABEL[status?.currentScene] || (status?.currentScene ? status.currentScene : 'Not entered yet');
  const sceneNumber = status?.currentScene in SCENE_INDEX ? SCENE_INDEX[status.currentScene] + 1 : 0;
  const progress = sceneNumber ? Math.round((sceneNumber / SCENES.length) * 100) : 0;

  const history = useMemo(() => {
    if (!Array.isArray(status?.sceneHistory)) return [];
    return [...status.sceneHistory].slice(-10).reverse();
  }, [status?.sceneHistory]);

  if (!token) {
    return (
      <main className="sha-login-shell">
        <div className="sha-login-glow" />
        <form className="sha-login-card" onSubmit={login}>
          <div className="sha-login-icon"><Heart fill="currentColor" /></div>
          <span className="sha-eyebrow">PRIVATE VIEW</span>
          <h1>Secret Heart<br/><em>Live Dashboard</em></h1>
          <p>See when she enters, where she is in the journey, how long she stays, and the answer she chooses.</p>
          <label>
            <span>Admin password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" autoFocus />
          </label>
          {error && <div className="sha-login-error">{error}</div>}
          <button type="submit" disabled={loggingIn}>{loggingIn ? 'Connecting…' : 'Open live dashboard'}</button>
          <small><ShieldCheck /> Private admin page · /secret-admin</small>
        </form>
      </main>
    );
  }

  return (
    <main className="sha-dashboard">
      <div className="sha-background-orb orb-one" />
      <div className="sha-background-orb orb-two" />

      <header className="sha-header">
        <div className="sha-brand">
          <span className="sha-brand-heart"><Heart fill="currentColor" /></span>
          <div><small>AGNES · SECRET HEART</small><strong>Live Journey</strong></div>
        </div>
        <div className="sha-header-actions">
          <div className={`sha-connection is-${connection}`}><Radio /><span>{connection === 'live' ? 'REALTIME' : connection === 'local' ? 'LOCAL PREVIEW' : connection === 'reconnecting' ? 'RECONNECTING' : 'CONNECTING'}</span></div>
          <button type="button" onClick={() => window.location.reload()} aria-label="Refresh"><RefreshCw /></button>
          <button type="button" onClick={logout}><LogOut /><span>Logout</span></button>
        </div>
      </header>

      {mode === 'local' && (
        <div className="sha-local-warning">
          <Activity />
          <span><strong>Local preview mode.</strong> This can show activity from this browser. Start the included realtime server for cross-device live tracking.</span>
        </div>
      )}

      <section className="sha-hero-status">
        <div className="sha-presence-card">
          <div className={`sha-presence-icon ${isOnline ? 'is-online' : ''}`}><Eye /></div>
          <div>
            <small>SECRET HEART STATUS</small>
            <h2>{isOnline ? 'She is inside Secret Heart.' : status?.enteredAt ? 'She is not inside right now.' : 'Waiting for her to enter.'}</h2>
            <p>{isOnline ? `Currently viewing “${sceneLabel}”` : status?.lastSeenAt ? `Last activity ${formatTime(status.lastSeenAt)}` : 'The dashboard will update automatically when the password is accepted.'}</p>
          </div>
          <div className={`sha-live-dot ${isOnline ? 'is-online' : ''}`}><i /><span>{isOnline ? 'LIVE NOW' : 'OFFLINE'}</span></div>
        </div>
      </section>

      <section className="sha-stat-grid">
        <article className="sha-stat-card">
          <span className="sha-stat-icon"><Sparkles /></span>
          <small>CURRENT SECTION</small>
          <strong>{sceneLabel}</strong>
          <p>{sceneNumber ? `${isOnline ? `Viewing for ${formatDuration(currentSceneDuration)} · ` : ''}Section ${sceneNumber} of ${SCENES.length}` : 'Not started'}</p>
        </article>

        <article className="sha-stat-card">
          <span className="sha-stat-icon"><Clock3 /></span>
          <small>TIME INSIDE</small>
          <strong className="sha-timer">{status?.enteredAt ? formatDuration(duration) : '00:00'}</strong>
          <p>{isOnline ? 'Counting live' : status?.enteredAt ? 'Session duration' : 'Starts after entry'}</p>
        </article>

        <article className="sha-stat-card sha-answer-stat">
          <ChoiceBadge choice={status?.choice} />
          <p>{status?.choiceAt ? `Selected ${formatTime(status.choiceAt)}` : 'Updates the moment she chooses.'}</p>
        </article>

        <article className="sha-stat-card">
          <span className="sha-stat-icon"><Activity /></span>
          <small>LAST ACTIVITY</small>
          <strong>{status?.lastSeenAt ? formatTime(status.lastSeenAt) : '—'}</strong>
          <p>{isOnline ? 'Heartbeat connected' : 'No active heartbeat'}</p>
        </article>
      </section>

      <section className="sha-main-grid">
        <article className="sha-panel sha-progress-panel">
          <div className="sha-panel-title"><div><small>JOURNEY PROGRESS</small><h3>Where she is right now</h3></div><span>{progress}%</span></div>
          <div className="sha-progress-track"><i style={{ width: `${progress}%` }} /></div>
          <div className="sha-steps">
            {SCENES.map(([key, label], index) => {
              const currentIndex = status?.currentScene in SCENE_INDEX ? SCENE_INDEX[status.currentScene] : -1;
              const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'future';
              return (
                <div key={key} className={`sha-step is-${state}`}>
                  <span>{index + 1}</span>
                  <div><strong>{label}</strong><small>{state === 'current' ? 'Viewing now' : state === 'done' ? 'Visited' : 'Waiting'}</small></div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="sha-panel sha-timeline-panel">
          <div className="sha-panel-title"><div><small>LIVE TIMELINE</small><h3>Her Secret Heart journey</h3></div><Radio /></div>
          {history.length ? (
            <div className="sha-timeline">
              {history.map((item, index) => (
                <div className="sha-timeline-item" key={`${item.scene}-${item.at}-${index}`}>
                  <i />
                  <div><strong>{SCENE_LABEL[item.scene] || item.scene}</strong><span>{formatTime(item.at)}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sha-empty"><Heart /><strong>No journey yet.</strong><p>When she enters Secret Heart, every section will appear here in realtime.</p></div>
          )}
        </article>
      </section>

      <footer className="sha-footer">
        <span><ShieldCheck /> Private dashboard</span>
        <span>Entered: {formatTime(status?.enteredAt)}</span>
        <span>Session: {status?.sessionId ? status.sessionId.slice(0, 8) : '—'}</span>
      </footer>
    </main>
  );
}
