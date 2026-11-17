CREATE TABLE IF NOT EXISTS individual_permission_history (
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  community_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('granted', 'withdrawn', 'expired')),
  expires_at TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'granted', 'withdrawn', 'migration-backfill')),
  actor TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  PRIMARY KEY (session_id, permission_id, version)
);

CREATE INDEX IF NOT EXISTS individual_permission_history_time
  ON individual_permission_history(session_id, permission_id, version DESC);

INSERT OR IGNORE INTO individual_permission_history (
  session_id,
  permission_id,
  version,
  community_id,
  purpose,
  status,
  expires_at,
  action,
  actor,
  correlation_id,
  recorded_at
)
SELECT
  session_id,
  permission_id,
  version,
  community_id,
  purpose,
  status,
  expires_at,
  'migration-backfill',
  'demo:migration',
  'migration-backfill',
  updated_at
FROM individual_permissions;
