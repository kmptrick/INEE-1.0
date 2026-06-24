// ============================================================
// Appli Claude — backend multi-utilisateurs
// Express + PostgreSQL. Clé API Claude partagée côté serveur.
// ============================================================
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3007;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '180d';      // session longue (rester connecté)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_CONTEXT_CHARS = 180000;  // garde-fou sur le texte injecté

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ---------- DB init + seed admin ----------
async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const pass = process.env.ADMIN_PASSWORD || '';
  if (email && pass) {
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(pass, 10);
      await pool.query(
        "INSERT INTO users(email,name,password_hash,role) VALUES($1,$2,$3,'admin')",
        [email, process.env.ADMIN_NAME || 'Admin', hash]
      );
      console.log('[init] Compte admin créé :', email);
    }
  }
  console.log('[init] Base prête.');
}

// ---------- Helpers ----------
function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch (e) { return res.status(401).json({ error: 'Session invalide' }); }
}
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Réservé à l\'administrateur' });
  next();
}
const pub = u => ({ id: u.id, email: u.email, name: u.name, role: u.role, created_at: u.created_at });

// owner access : propriétaire OU admin
async function ownsConversation(user, convId) {
  const { rows } = await pool.query('SELECT * FROM conversations WHERE id=$1', [convId]);
  if (!rows.length) return null;
  const c = rows[0];
  if (c.user_id !== user.id && user.role !== 'admin') return false;
  return c;
}
async function ownsProject(user, projId) {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id=$1', [projId]);
  if (!rows.length) return null;
  const p = rows[0];
  if (p.user_id !== user.id && user.role !== 'admin') return false;
  return p;
}

// ============================================================
// AUTH
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const password = req.body.password || '';
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (!rows.length) return res.status(401).json({ error: 'Identifiants incorrects' });
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Identifiants incorrects' });
  res.json({ token: sign(rows[0]), user: pub(rows[0]) });
});

app.get('/api/auth/me', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  if (!rows.length) return res.status(401).json({ error: 'Compte introuvable' });
  res.json({ user: pub(rows[0]) });
});

app.post('/api/auth/password', auth, async (req, res) => {
  const { current, next } = req.body;
  if (!next || next.length < 6) return res.status(400).json({ error: 'Nouveau mot de passe trop court (min 6)' });
  const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  const ok = await bcrypt.compare(current || '', rows[0].password_hash);
  if (!ok) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  const hash = await bcrypt.hash(next, 10);
  await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
  res.json({ ok: true });
});

// ============================================================
// ADMIN — gestion des comptes + accès à tous les comptes
// ============================================================
app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT u.*,
      (SELECT count(*) FROM conversations c WHERE c.user_id=u.id) AS conversations
    FROM users u ORDER BY u.created_at DESC`);
  res.json(rows.map(u => ({ ...pub(u), conversations: Number(u.conversations) })));
});

app.post('/api/admin/users', auth, adminOnly, async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const { name, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (min 6)' });
  const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (exists.rows.length) return res.status(409).json({ error: 'Cet email existe déjà' });
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users(email,name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING *',
    [email, name || '', hash, role === 'admin' ? 'admin' : 'user']);
  res.json(pub(rows[0]));
});

app.patch('/api/admin/users/:id', auth, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { name, password, role } = req.body;
  const fields = [], vals = []; let i = 1;
  if (name !== undefined) { fields.push(`name=$${i++}`); vals.push(name); }
  if (role !== undefined) { fields.push(`role=$${i++}`); vals.push(role === 'admin' ? 'admin' : 'user'); }
  if (password) { fields.push(`password_hash=$${i++}`); vals.push(await bcrypt.hash(password, 10)); }
  if (!fields.length) return res.status(400).json({ error: 'Rien à modifier' });
  vals.push(id);
  const { rows } = await pool.query(`UPDATE users SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) return res.status(404).json({ error: 'Introuvable' });
  res.json(pub(rows[0]));
});

app.delete('/api/admin/users/:id', auth, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'Tu ne peux pas supprimer ton propre compte' });
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  res.json({ ok: true });
});

// admin : voir les conversations de n'importe quel utilisateur
app.get('/api/admin/users/:id/conversations', auth, adminOnly, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id,title,project_id,created_at,updated_at FROM conversations WHERE user_id=$1 ORDER BY updated_at DESC',
    [Number(req.params.id)]);
  res.json(rows);
});

// ============================================================
// PROJETS
// ============================================================
app.get('/api/projects', auth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT p.*,
      (SELECT count(*) FROM conversations c WHERE c.project_id=p.id) AS conversations
    FROM projects p WHERE p.user_id=$1 ORDER BY p.created_at DESC`, [req.user.id]);
  res.json(rows.map(p => ({ ...p, conversations: Number(p.conversations) })));
});

app.post('/api/projects', auth, async (req, res) => {
  const { name, instructions } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nom requis' });
  const { rows } = await pool.query(
    'INSERT INTO projects(user_id,name,instructions) VALUES($1,$2,$3) RETURNING *',
    [req.user.id, name.trim(), instructions || '']);
  res.json(rows[0]);
});

app.patch('/api/projects/:id', auth, async (req, res) => {
  const p = await ownsProject(req.user, Number(req.params.id));
  if (p === null) return res.status(404).json({ error: 'Introuvable' });
  if (p === false) return res.status(403).json({ error: 'Accès refusé' });
  const { name, instructions } = req.body;
  const { rows } = await pool.query(
    'UPDATE projects SET name=COALESCE($1,name), instructions=COALESCE($2,instructions) WHERE id=$3 RETURNING *',
    [name, instructions, p.id]);
  res.json(rows[0]);
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  const p = await ownsProject(req.user, Number(req.params.id));
  if (p === null) return res.status(404).json({ error: 'Introuvable' });
  if (p === false) return res.status(403).json({ error: 'Accès refusé' });
  await pool.query('DELETE FROM projects WHERE id=$1', [p.id]);
  res.json({ ok: true });
});

// ============================================================
// CONVERSATIONS
// ============================================================
app.get('/api/conversations', auth, async (req, res) => {
  const projectId = req.query.projectId;
  let q, params;
  if (projectId === 'none' || projectId === '0') {
    q = 'SELECT * FROM conversations WHERE user_id=$1 AND project_id IS NULL ORDER BY updated_at DESC';
    params = [req.user.id];
  } else if (projectId) {
    q = 'SELECT * FROM conversations WHERE user_id=$1 AND project_id=$2 ORDER BY updated_at DESC';
    params = [req.user.id, Number(projectId)];
  } else {
    q = 'SELECT * FROM conversations WHERE user_id=$1 ORDER BY updated_at DESC';
    params = [req.user.id];
  }
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

app.post('/api/conversations', auth, async (req, res) => {
  const { projectId, title } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO conversations(user_id,project_id,title) VALUES($1,$2,$3) RETURNING *',
    [req.user.id, projectId || null, title || 'Nouvelle conversation']);
  res.json(rows[0]);
});

app.get('/api/conversations/:id', auth, async (req, res) => {
  const c = await ownsConversation(req.user, Number(req.params.id));
  if (c === null) return res.status(404).json({ error: 'Introuvable' });
  if (c === false) return res.status(403).json({ error: 'Accès refusé' });
  const msgs = await pool.query('SELECT id,role,content,created_at FROM messages WHERE conversation_id=$1 ORDER BY id', [c.id]);
  res.json({ ...c, messages: msgs.rows });
});

app.patch('/api/conversations/:id', auth, async (req, res) => {
  const c = await ownsConversation(req.user, Number(req.params.id));
  if (c === null) return res.status(404).json({ error: 'Introuvable' });
  if (c === false) return res.status(403).json({ error: 'Accès refusé' });
  const { title, projectId } = req.body;
  const { rows } = await pool.query(
    'UPDATE conversations SET title=COALESCE($1,title), project_id=$2, updated_at=now() WHERE id=$3 RETURNING *',
    [title, projectId === undefined ? c.project_id : projectId, c.id]);
  res.json(rows[0]);
});

app.delete('/api/conversations/:id', auth, async (req, res) => {
  const c = await ownsConversation(req.user, Number(req.params.id));
  if (c === null) return res.status(404).json({ error: 'Introuvable' });
  if (c === false) return res.status(403).json({ error: 'Accès refusé' });
  await pool.query('DELETE FROM conversations WHERE id=$1', [c.id]);
  res.json({ ok: true });
});

// ============================================================
// PIÈCES JOINTES (fichiers / liens / texte)
// ============================================================
async function extractText(buffer, filename, mimetype) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    const pdf = require('pdf-parse');
    const data = await pdf(buffer);
    return data.text;
  }
  if (ext === 'docx' || mimetype.includes('wordprocessingml')) {
    const mammoth = require('mammoth');
    const r = await mammoth.extractRawText({ buffer });
    return r.value;
  }
  // txt, md, csv, json, code… : lecture brute
  return buffer.toString('utf8');
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

async function validateOwner(user, ownerType, ownerId) {
  if (ownerType === 'project') return await ownsProject(user, ownerId);
  if (ownerType === 'conversation') return await ownsConversation(user, ownerId);
  return null;
}

// upload fichier
app.post('/api/attachments/file', auth, upload.single('file'), async (req, res) => {
  try {
    const { ownerType, ownerId } = req.body;
    const owner = await validateOwner(req.user, ownerType, Number(ownerId));
    if (!owner) return res.status(403).json({ error: 'Cible invalide' });
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
    let text = await extractText(req.file.buffer, req.file.originalname, req.file.mimetype || '');
    text = (text || '').slice(0, MAX_CONTEXT_CHARS);
    const { rows } = await pool.query(
      'INSERT INTO attachments(user_id,owner_type,owner_id,name,source,text_content) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,source,created_at',
      [req.user.id, ownerType, Number(ownerId), req.file.originalname, 'file', text]);
    res.json({ ...rows[0], chars: text.length });
  } catch (e) {
    res.status(500).json({ error: 'Lecture du fichier impossible : ' + e.message });
  }
});

// lien
app.post('/api/attachments/link', auth, async (req, res) => {
  try {
    const { ownerType, ownerId, url } = req.body;
    const owner = await validateOwner(req.user, ownerType, Number(ownerId));
    if (!owner) return res.status(403).json({ error: 'Cible invalide' });
    if (!/^https?:\/\//i.test(url || '')) return res.status(400).json({ error: 'URL invalide' });
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 ClaudeApp' }, redirect: 'follow' });
    const html = await r.text();
    let text = htmlToText(html).slice(0, MAX_CONTEXT_CHARS);
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const name = (titleMatch ? titleMatch[1].trim() : url).slice(0, 120);
    const { rows } = await pool.query(
      'INSERT INTO attachments(user_id,owner_type,owner_id,name,source,text_content) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,source,created_at',
      [req.user.id, ownerType, Number(ownerId), name, 'link', text]);
    res.json({ ...rows[0], chars: text.length });
  } catch (e) {
    res.status(500).json({ error: 'Lien inaccessible : ' + e.message });
  }
});

// texte collé
app.post('/api/attachments/text', auth, async (req, res) => {
  const { ownerType, ownerId, name, text } = req.body;
  const owner = await validateOwner(req.user, ownerType, Number(ownerId));
  if (!owner) return res.status(403).json({ error: 'Cible invalide' });
  const content = (text || '').slice(0, MAX_CONTEXT_CHARS);
  const { rows } = await pool.query(
    'INSERT INTO attachments(user_id,owner_type,owner_id,name,source,text_content) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,source,created_at',
    [req.user.id, ownerType, Number(ownerId), (name || 'Note').slice(0, 120), 'text', content]);
  res.json({ ...rows[0], chars: content.length });
});

app.get('/api/attachments', auth, async (req, res) => {
  const { ownerType, ownerId } = req.query;
  const owner = await validateOwner(req.user, ownerType, Number(ownerId));
  if (!owner) return res.status(403).json({ error: 'Cible invalide' });
  const { rows } = await pool.query(
    'SELECT id,name,source,length(text_content) AS chars,created_at FROM attachments WHERE owner_type=$1 AND owner_id=$2 ORDER BY id',
    [ownerType, Number(ownerId)]);
  res.json(rows.map(r => ({ ...r, chars: Number(r.chars) })));
});

app.delete('/api/attachments/:id', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM attachments WHERE id=$1', [Number(req.params.id)]);
  if (!rows.length) return res.status(404).json({ error: 'Introuvable' });
  if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  await pool.query('DELETE FROM attachments WHERE id=$1', [rows[0].id]);
  res.json({ ok: true });
});

// ============================================================
// CHAT — proxy streaming vers l'API Claude
// ============================================================
async function buildContext(conv) {
  const parts = [];
  let project = null;
  if (conv.project_id) {
    const pr = await pool.query('SELECT * FROM projects WHERE id=$1', [conv.project_id]);
    project = pr.rows[0];
    if (project && project.instructions) parts.push('# Instructions du projet « ' + project.name + ' »\n' + project.instructions);
  }
  // pièces jointes du projet puis de la conversation
  const atts = [];
  if (project) {
    const a = await pool.query("SELECT name,text_content FROM attachments WHERE owner_type='project' AND owner_id=$1 ORDER BY id", [project.id]);
    atts.push(...a.rows);
  }
  const ac = await pool.query("SELECT name,text_content FROM attachments WHERE owner_type='conversation' AND owner_id=$1 ORDER BY id", [conv.id]);
  atts.push(...ac.rows);
  if (atts.length) {
    let docBlock = '# Documents de référence\nUtilise ces documents pour répondre quand c\'est pertinent.\n';
    let total = 0;
    for (const a of atts) {
      const chunk = '\n\n--- ' + a.name + ' ---\n' + a.text_content;
      if (total + chunk.length > MAX_CONTEXT_CHARS) { docBlock += '\n\n[... documents tronqués ...]'; break; }
      docBlock += chunk; total += chunk.length;
    }
    parts.push(docBlock);
  }
  return parts.join('\n\n');
}

app.post('/api/conversations/:id/chat', auth, async (req, res) => {
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Clé API Claude non configurée sur le serveur' });
  const c = await ownsConversation(req.user, Number(req.params.id));
  if (c === null) return res.status(404).json({ error: 'Introuvable' });
  if (c === false) return res.status(403).json({ error: 'Accès refusé' });

  const content = (req.body.content || '').trim();
  const model = req.body.model || 'claude-sonnet-4-6';
  if (!content) return res.status(400).json({ error: 'Message vide' });

  // enregistrer le message utilisateur + titre auto
  await pool.query('INSERT INTO messages(conversation_id,role,content) VALUES($1,$2,$3)', [c.id, 'user', content]);
  const cntUser = await pool.query("SELECT count(*) FROM messages WHERE conversation_id=$1 AND role='user'", [c.id]);
  if (Number(cntUser.rows[0].count) === 1) {
    await pool.query('UPDATE conversations SET title=$1 WHERE id=$2', [content.slice(0, 60), c.id]);
  }

  const histRows = await pool.query('SELECT role,content FROM messages WHERE conversation_id=$1 ORDER BY id', [c.id]);
  const messages = histRows.rows.map(m => ({ role: m.role, content: m.content }));
  const system = await buildContext(c);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let full = '';
  try {
    const body = { model, max_tokens: 4096, stream: true, messages };
    if (system) body.system = system;
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': ANTHROPIC_VERSION },
      body: JSON.stringify(body)
    });
    if (!upstream.ok) {
      const errTxt = await upstream.text();
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'API Claude (' + upstream.status + ') : ' + errTxt.slice(0, 300) })}\n\n`);
      res.end(); return;
    }
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const data = t.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
            full += ev.delta.text;
            res.write(`data: ${JSON.stringify({ type: 'delta', text: ev.delta.text })}\n\n`);
          } else if (ev.type === 'error') {
            res.write(`data: ${JSON.stringify({ type: 'error', error: (ev.error && ev.error.message) || 'Erreur' })}\n\n`);
          }
        } catch (e) { /* ignore json partiel */ }
      }
    }
    await pool.query('INSERT INTO messages(conversation_id,role,content) VALUES($1,$2,$3)', [c.id, 'assistant', full]);
    await pool.query('UPDATE conversations SET updated_at=now() WHERE id=$1', [c.id]);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (e) {
    if (full) { await pool.query('INSERT INTO messages(conversation_id,role,content) VALUES($1,$2,$3)', [c.id, 'assistant', full]); }
    res.write(`data: ${JSON.stringify({ type: 'error', error: e.message })}\n\n`);
    res.end();
  }
});

// ---------- health ----------
app.get('/api/health', (req, res) => res.json({ ok: true, hasKey: !!ANTHROPIC_API_KEY }));

init()
  .then(() => app.listen(PORT, () => console.log('[claude-backend] écoute sur le port ' + PORT)))
  .catch(e => { console.error('Échec init :', e); process.exit(1); });
