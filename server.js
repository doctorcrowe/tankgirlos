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

app.listen(PORT, HOST, () => {
  console.log(`Tank Girl OS server running at http://${HOST}:${PORT}`);
  console.log(`Serving files from: ${process.cwd()}`);
});
