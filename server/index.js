import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const STATUS_FILE = path.join(DATA_DIR, 'secret-heart-status.json');
const ENV_FILE = path.join(__dirname, '.env');

function loadEnvFile() {
  try {
    const lines = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index < 1) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // server/.env is optional
  }
}

loadEnvFile();
fs.mkdirSync(DATA_DIR, { recursive: true });

const PORT = Number(process.env.PORT || 5050);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-admin-password';
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const emptyStatus = () => ({
  sessionId: null,
  online: false,
  enteredAt: null,
  leftAt: null,
  lastSeenAt: null,
  currentScene: null,
  currentSceneEnteredAt: null,
  choice: null,
  choiceAt: null,
  exitReason: null,
  sceneHistory: []
});

function loadStatus() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    return { ...emptyStatus(), ...parsed, online: false };
  } catch {
    return emptyStatus();
  }
}

let status = loadStatus();
const adminTokens = new Map();
const sseClients = new Set();
const TOKEN_TTL = 12 * 60 * 60 * 1000;

function persist() {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (CLIENT_ORIGINS.includes('*')) return true;
  return CLIENT_ORIGINS.includes(origin);
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function createToken() {
  const token = crypto.randomBytes(32).toString('hex');
  adminTokens.set(token, Date.now() + TOKEN_TTL);
  return token;
}

function validToken(token) {
  const expiresAt = adminTokens.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    adminTokens.delete(token);
    return false;
  }
  return true;
}

function bearer(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

function readBody(req, limit = 100_000) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > limit) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function pushStatus() {
  const payload = `data: ${JSON.stringify(status)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch { sseClients.delete(res); }
  }
}

function touch(at = new Date().toISOString()) {
  status.lastSeenAt = at;
  status.online = true;
}

function updateScene(scene, at) {
  if (!scene) return;
  const timestamp = at || new Date().toISOString();
  status.currentScene = scene;
  status.currentSceneEnteredAt = timestamp;
  const history = Array.isArray(status.sceneHistory) ? status.sceneHistory : [];
  if (history.at(-1)?.scene !== scene) history.push({ scene, at: timestamp });
  status.sceneHistory = history.slice(-60);
  touch(timestamp);
}

function handleEvent(event, payload = {}) {
  if (event === 'entered') {
    const at = payload.at || new Date().toISOString();
    status = {
      ...emptyStatus(),
      sessionId: payload.sessionId || crypto.randomUUID(),
      online: true,
      enteredAt: at,
      lastSeenAt: at,
      currentScene: payload.scene || 'cinematic-intro',
      currentSceneEnteredAt: at,
      sceneHistory: [{ scene: payload.scene || 'cinematic-intro', at }]
    };
    persist();
    pushStatus();
    return;
  }

  if (!status.sessionId || (payload.sessionId && payload.sessionId !== status.sessionId)) return;

  if (event === 'scene') {
    updateScene(payload.scene, payload.at);
  } else if (event === 'choice') {
    const at = payload.at || new Date().toISOString();
    status.choice = payload.choice === 'yes' ? 'yes' : payload.choice === 'no' ? 'no' : null;
    status.choiceAt = at;
    touch(at);
  } else if (event === 'heartbeat') {
    touch(payload.at || new Date().toISOString());
  } else if (event === 'left') {
    const at = payload.at || new Date().toISOString();
    status.online = false;
    status.leftAt = at;
    status.lastSeenAt = at;
    status.exitReason = payload.reason || 'closed';
  }

  persist();
  pushStatus();
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) return json(res, 403, { error: 'Origin not allowed' });

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
    return json(res, 200, { ok: true, service: 'agnes-secret-heart-live' });
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/admin/login') {
    try {
      const body = await readBody(req);
      const password = String(body.password || '');
      if (!password || password !== ADMIN_PASSWORD) return json(res, 401, { error: 'Wrong password' });
      return json(res, 200, { token: createToken(), expiresIn: TOKEN_TTL });
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/secret-heart/status') {
    if (!validToken(bearer(req))) return json(res, 401, { error: 'Unauthorized' });
    return json(res, 200, { status });
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/secret-heart/stream') {
    const token = requestUrl.searchParams.get('token') || '';
    if (!validToken(token)) return json(res, 401, { error: 'Unauthorized' });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    res.write(`data: ${JSON.stringify(status)}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/secret-heart/event') {
    try {
      const body = await readBody(req);
      handleEvent(body.event, body.payload || {});
      return json(res, 200, { ok: true });
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/secret-heart/reset') {
    if (!validToken(bearer(req))) return json(res, 401, { error: 'Unauthorized' });
    status = emptyStatus();
    persist();
    pushStatus();
    return json(res, 200, { ok: true, status });
  }

  return json(res, 404, { error: 'Not found' });
});

setInterval(() => {
  for (const res of sseClients) {
    try { res.write(': keepalive\n\n'); } catch { sseClients.delete(res); }
  }
}, 20_000).unref();

setInterval(() => {
  if (!status.online || !status.lastSeenAt) return;
  const staleFor = Date.now() - new Date(status.lastSeenAt).getTime();
  if (staleFor > 35_000) {
    status.online = false;
    status.leftAt = status.leftAt || new Date().toISOString();
    status.exitReason = status.exitReason || 'heartbeat-timeout';
    persist();
    pushStatus();
  }
}, 5_000).unref();

server.listen(PORT, () => {
  console.log(`Secret Heart realtime server listening on http://localhost:${PORT}`);
});
