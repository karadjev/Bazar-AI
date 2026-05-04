ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS manager_comment TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_created
  ON lead_status_history(lead_id, created_at DESC);
