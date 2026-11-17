ALTER TABLE policies
  ADD COLUMN required_benefit_ids_json TEXT NOT NULL DEFAULT '[]';

ALTER TABLE proposals
  ADD COLUMN required_benefit_ids_json TEXT NOT NULL DEFAULT '[]';

UPDATE proposals
SET title = 'Require every contributor and research team to accept the accessible-results commitment',
    required_benefit_ids_json = '["benefit-findings"]'
WHERE proposal_id = 'proposal-v2';
