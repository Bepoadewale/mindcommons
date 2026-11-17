ALTER TABLE benefit_commitments ADD COLUMN agreed_at TEXT;
ALTER TABLE benefit_commitments ADD COLUMN agreed_by TEXT;
ALTER TABLE benefit_commitments ADD COLUMN accepted_at TEXT;
ALTER TABLE benefit_commitments ADD COLUMN accepted_by TEXT;
ALTER TABLE benefit_commitments ADD COLUMN review_outcome TEXT
  CHECK (review_outcome IS NULL OR review_outcome IN ('accepted', 'changes-requested'));
ALTER TABLE benefit_commitments ADD COLUMN reviewed_at TEXT;
ALTER TABLE benefit_commitments ADD COLUMN reviewed_by TEXT;
