ALTER TABLE research_runs ADD COLUMN correlation_id TEXT;
ALTER TABLE research_runs ADD COLUMN decision_receipt_json TEXT;
ALTER TABLE research_runs ADD COLUMN inference_attempted INTEGER NOT NULL DEFAULT 0
  CHECK (inference_attempted IN (0, 1));
