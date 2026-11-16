CREATE TABLE IF NOT EXISTS rate_limits (
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  minute TEXT NOT NULL,
  request_count INTEGER NOT NULL,
  PRIMARY KEY (session_id, minute)
);

CREATE INDEX IF NOT EXISTS rate_limits_minute ON rate_limits(minute);
