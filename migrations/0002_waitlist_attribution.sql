ALTER TABLE waitlist ADD COLUMN landing_path TEXT NOT NULL DEFAULT '/';
ALTER TABLE waitlist ADD COLUMN referrer TEXT NOT NULL DEFAULT '';
ALTER TABLE waitlist ADD COLUMN utm_source TEXT NOT NULL DEFAULT '';
ALTER TABLE waitlist ADD COLUMN utm_medium TEXT NOT NULL DEFAULT '';
ALTER TABLE waitlist ADD COLUMN utm_campaign TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_waitlist_landing_path ON waitlist(landing_path);
