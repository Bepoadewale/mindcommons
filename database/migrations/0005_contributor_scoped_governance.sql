ALTER TABLE policies
  ADD COLUMN withdrawal_mode TEXT NOT NULL DEFAULT 'exclude-withdrawn'
  CHECK (withdrawal_mode IN ('exclude-withdrawn', 'require-all'));

ALTER TABLE proposals
  ADD COLUMN withdrawal_mode TEXT NOT NULL DEFAULT 'require-all'
  CHECK (withdrawal_mode IN ('exclude-withdrawn', 'require-all'));

ALTER TABLE research_runs
  ADD COLUMN contribution_decisions_json TEXT NOT NULL DEFAULT '[]';

UPDATE proposals
SET title = 'Require every contributor to permit the research request',
    withdrawal_mode = 'require-all'
WHERE proposal_id = 'proposal-v2';

UPDATE individual_permissions
SET permission_id = 'contributor-a:community-wellbeing-research'
WHERE permission_id = 'participant-a';

UPDATE individual_permission_history
SET permission_id = 'contributor-a:community-wellbeing-research'
WHERE permission_id = 'participant-a';

INSERT OR IGNORE INTO individual_permissions(
  permission_id, session_id, community_id, purpose, status, expires_at, version, updated_at
)
SELECT
  'contributor-b:community-wellbeing-research', session_id, community_id, purpose,
  'granted', expires_at, 1, updated_at
FROM individual_permissions
WHERE permission_id = 'contributor-a:community-wellbeing-research';

INSERT OR IGNORE INTO individual_permissions(
  permission_id, session_id, community_id, purpose, status, expires_at, version, updated_at
)
SELECT
  'contributor-c:community-wellbeing-research', session_id, community_id, purpose,
  'granted', expires_at, 1, updated_at
FROM individual_permissions
WHERE permission_id = 'contributor-a:community-wellbeing-research';

INSERT OR IGNORE INTO individual_permission_history(
  session_id, permission_id, version, community_id, purpose, status, expires_at,
  action, actor, correlation_id, recorded_at
)
SELECT
  session_id, permission_id, version, community_id, purpose, status, expires_at,
  'migration-backfill', 'demo:migration', 'contributor-history-backfill', updated_at
FROM individual_permissions
WHERE permission_id IN (
  'contributor-b:community-wellbeing-research',
  'contributor-c:community-wellbeing-research'
);
