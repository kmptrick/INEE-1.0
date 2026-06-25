-- ============================================================
-- Schéma PostgreSQL — appli Claude multi-utilisateurs
-- Idempotent : exécuté à chaque démarrage du backend.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',   -- 'admin' | 'user'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  instructions TEXT DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  title      TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,    -- 'user' | 'assistant'
  content         TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pièces jointes : liées soit à un projet (base de connaissances persistante),
-- soit à une conversation (contexte ponctuel).
CREATE TABLE IF NOT EXISTS attachments (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_type   TEXT NOT NULL,     -- 'project' | 'conversation'
  owner_id     INTEGER NOT NULL,
  name         TEXT NOT NULL,
  source       TEXT NOT NULL,     -- 'file' | 'link' | 'text'
  text_content TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Réinitialisation de mot de passe (colonnes ajoutées si absentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires    TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_conv_user    ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_msg_conv     ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_proj_user    ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_att_owner    ON attachments(owner_type, owner_id);
