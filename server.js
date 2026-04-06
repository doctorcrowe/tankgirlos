const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = 3001;
const HOST = '127.0.0.1';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.dirname(__filename)));

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, cwd: process.cwd() });
});

// Persist config to disk so keys survive origin/browser changes
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

// Read a file
app.get('/api/read', (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'path required' });
    const resolved = path.resolve(filePath);
    const content = fs.readFileSync(resolved, 'utf8');
    res.json({ content, path: resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Write a file
app.post('/api/write', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ error: 'path required' });
    const resolved = path.resolve(filePath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, 'utf8');
    res.json({ ok: true, path: resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List a directory
app.get('/api/ls', (req, res) => {
  try {
    const dirPath = req.query.path || process.cwd();
    const resolved = path.resolve(dirPath);
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    const files = entries.map(e => ({
      name: e.name,
      type: e.isDirectory() ? 'dir' : 'file',
    }));
    res.json({ path: resolved, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run a shell command
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
    res.json({
      output: (err.stdout || '') + (err.stderr || err.message || ''),
      exitCode: err.status || 1,
    });
  }
});

// Fetch a URL and return readable text
app.get('/api/fetch', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url required' });
    const r = await fetch(url, {
      headers: { 'User-Agent': 'TankGirlOS/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    const contentType = r.headers.get('content-type') || '';
    let text = await r.text();
    // Strip HTML tags to plain text so the model gets something readable
    if (contentType.includes('html')) {
      text = text
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s{3,}/g, '\n\n')
        .trim()
        .slice(0, 20000); // cap at 20k chars
    }
    res.json({ text, status: r.status, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Slack API proxy — keeps your token server-side
app.post('/api/slack', async (req, res) => {
  try {
    const { token, method, params = {} } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });
    if (!method) return res.status(400).json({ error: 'method required' });
    const url = `https://slack.com/api/${method}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Linear GraphQL proxy
app.post('/api/linear', async (req, res) => {
  try {
    const { key, query, variables = {} } = req.body;
    if (!key) return res.status(400).json({ error: 'key required' });
    if (!query) return res.status(400).json({ error: 'query required' });
    const r = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Tank Girl OS server running at http://${HOST}:${PORT}`);
  console.log(`Serving files from: ${process.cwd()}`);
});
