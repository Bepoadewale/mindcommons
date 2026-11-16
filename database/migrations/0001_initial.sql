PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('community_representative', 'researcher', 'community_member')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS policies (
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'superseded')),
  allowed_purpose TEXT NOT NULL,
  commercial_allowed INTEGER NOT NULL CHECK (commercial_allowed IN (0, 1)),
  effective_at TEXT NOT NULL,
  PRIMARY KEY (session_id, version)
);

CREATE TABLE IF NOT EXISTS proposals (
  proposal_id TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'approved', 'rejected', 'superseded')),
  title TEXT NOT NULL,
  proposed_purpose TEXT NOT NULL,
  proposed_commercial_allowed INTEGER NOT NULL CHECK (proposed_commercial_allowed IN (0, 1)),
  created_at TEXT NOT NULL,
  decided_at TEXT,
  PRIMARY KEY (session_id, proposal_id)
);

CREATE TABLE IF NOT EXISTS individual_permissions (
  permission_id TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  community_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('granted', 'withdrawn', 'expired')),
  expires_at TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (session_id, permission_id)
);

CREATE TABLE IF NOT EXISTS research_runs (
  run_id TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('denied', 'running', 'completed', 'failed')),
  policy_version INTEGER,
  decision_reasons TEXT NOT NULL,
  model_id TEXT,
  output_json TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  PRIMARY KEY (session_id, run_id)
);

CREATE TABLE IF NOT EXISTS benefit_commitments (
  commitment_id TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  due_at TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'in_progress', 'reviewed', 'fulfilled')),
  PRIMARY KEY (session_id, commitment_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  event_id TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  community_id TEXT NOT NULL,
  action TEXT NOT NULL,
  policy_version INTEGER,
  decision TEXT,
  job_status TEXT,
  correlation_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  PRIMARY KEY (session_id, event_id)
);
CREATE INDEX IF NOT EXISTS audit_session_time ON audit_events(session_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS demo_limits (
  day TEXT PRIMARY KEY,
  run_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cleanup_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_cleaned_at TEXT
);
INSERT OR IGNORE INTO cleanup_state(id, last_cleaned_at) VALUES (1, NULL);
