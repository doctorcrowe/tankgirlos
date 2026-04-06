const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');
const os       = require('os');
const { execSync } = require('child_process');

const app  = express();
const PORT = 3001;
const HOST = '127.0.0.1';

// ── Secret token ─────────────────────────────────────────────────────────────
// Generated once, saved to .tgos-secret. Every API request must include it
// as X-TGOS-Token. Injected into index.html at serve time so the app has it.
const SECRET_FILE = path.join(__dirname, '.tgos-secret');
let TOKEN;
if (fs.existsSync(SECRET_FILE)) {
  TOKEN = fs.readFileSync(SECRET_FILE, 'utf8').trim();
} else {
  TOKEN = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_FILE, TOKEN, 'utf8');
}

// ── CORS — only allow the app itself and file:// ──────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin === 'null' || origin === `http://${HOST}:${PORT}`) {
      cb(null, true);
    } else {
      cb(new Error('CORS: origin not allowed'));
    }
  },
}));

app.use(express.json({ limit: '10mb' }));

// ── Serve index.html with token injected ──────────────────────────────────────
app.get('/', (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  html = html.replace('</head>', `<script>window.TGOS_TOKEN="${TOKEN}";</script>\n</head>`);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Static assets (CSS, images, etc.) — but not index.html (handled above)
app.use(express.static(path.join(__dirname), { index: false }));

// ── Auth middleware — all /api/* routes require the token ─────────────────────
app.use('/api', (req, res, next) => {
  if (req.headers['x-tgos-token'] !== TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ── Path sandbox — restrict file ops to home dir + tmp ───────────────────────
const ALLOWED_ROOTS = [os.homedir(), os.tmpdir()];
function assertPathAllowed(filePath) {
  const resolved = path.resolve(filePath);
  const ok = ALLOWED_ROOTS.some(root => resolved.startsWith(root + path.sep) || resolved === root);
  if (!ok) throw new Error(`Path not allowed: ${resolved} (must be within ${ALLOWED_ROOTS.join(' or ')})`);
  return resolved;
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, cwd: process.cwd() });
});

// ── Config persistence ────────────────────────────────────────────────────────
const CONFIG_FILE = path.join(__dirname, '.tgos-config.json');

app.get('/api/config', (req, res) => {
  try {
    const data = fs.existsSync(CONFIG_FILE)
      ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      : {};
    res.json(data);
  } catch { res.json({}); }
});

app.post('/api/config', (req, res) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Read a file ───────────────────────────────────────────────────────────────
app.get('/api/read', (req, res) => {
  try {
    const resolved = assertPathAllowed(req.query.path || '');
    res.json({ content: fs.readFileSync(resolved, 'utf8'), path: resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Write a file ──────────────────────────────────────────────────────────────
app.post('/api/write', (req, res) => {
  try {
    const resolved = assertPathAllowed(req.body.path || '');
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, req.body.content, 'utf8');
    res.json({ ok: true, path: resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── List a directory ──────────────────────────────────────────────────────────
app.get('/api/ls', (req, res) => {
  try {
    const resolved = assertPathAllowed(req.query.path || os.homedir());
    const entries  = fs.readdirSync(resolved, { withFileTypes: true });
    res.json({ path: resolved, files: entries.map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Run a shell command ───────────────────────────────────────────────────────
app.post('/api/run', (req, res) => {
  try {
    const { command, cwd } = req.body;
    if (!command) return res.status(400).json({ error: 'command required' });
    const output = execSync(command, {
      cwd: cwd ? path.resolve(cwd) : process.cwd(),
      timeout: 30000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    res.json({ output, exitCode: 0 });
  } catch (err) {
    res.json({ output: (err.stdout || '') + (err.stderr || err.message || ''), exitCode: err.status || 1 });
  }
});

// ── Fetch a URL ───────────────────────────────────────────────────────────────
app.get('/api/fetch', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url required' });
    const r    = await fetch(url, { headers: { 'User-Agent': 'TankGirlOS/1.0' }, signal: AbortSignal.timeout(15000) });
    const ct   = r.headers.get('content-type') || '';
    let text   = await r.text();
    if (ct.includes('html')) {
      text = text
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/\s{3,}/g, '\n\n').trim().slice(0, 20000);
    }
    res.json({ text, status: r.status, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Slack proxy ───────────────────────────────────────────────────────────────
app.post('/api/slack', async (req, res) => {
  try {
    const { token, method, params = {} } = req.body;
    if (!token || !method) return res.status(400).json({ error: 'token and method required' });
    const r = await fetch(`https://slack.com/api/${method}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
    });
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Linear proxy ──────────────────────────────────────────────────────────────
app.post('/api/linear', async (req, res) => {
  try {
    const { key, query, variables = {} } = req.body;
    if (!key || !query) return res.status(400).json({ error: 'key and query required' });
    const r = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Authorization': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15000),
    });
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Tank Girl OS server → http://${HOST}:${PORT}`);
  console.log(`Token: ${TOKEN.slice(0, 8)}... (full token in .tgos-secret)`);
});
