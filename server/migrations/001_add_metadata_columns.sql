-- Add metadata column to bot_sessions table
ALTER TABLE bot_sessions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add metadata column to creators table
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update activities table metadata default
ALTER TABLE activities
ALTER COLUMN metadata SET DEFAULT '{}';

-- Create indexes for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_bot_sessions_metadata ON bot_sessions USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_creators_metadata ON creators USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_activities_metadata ON activities USING gin (metadata);

-- Add comment explaining the metadata structure
COMMENT ON COLUMN bot_sessions.metadata IS 'Stores session-related metadata like userAgent, viewport, sessionType, timing information';
COMMENT ON COLUMN creators.metadata IS 'Stores creator-related metadata like inviteTime, sessionId, interaction history';
COMMENT ON COLUMN activities.metadata IS 'Stores activity-related metadata like timing, stats, error information';
