-- Cross-Device Session Management System
-- This migration adds tables for managing user sessions across devices

-- Device Sessions Table
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Device information
  device_id VARCHAR(255) UNIQUE NOT NULL, -- Unique device identifier
  device_name VARCHAR(255), -- User-friendly device name
  device_type VARCHAR(50), -- mobile, desktop, tablet
  platform VARCHAR(50), -- ios, android, web, chrome-extension
  browser VARCHAR(100),
  os VARCHAR(100),
  os_version VARCHAR(50),

  -- IP and location
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),

  -- Session status
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Push notification token (for mobile apps)
  push_token TEXT,

  -- Session data (for sync)
  session_data JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync Queue Table (for cross-device synchronization)
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Sync metadata
  entity_type VARCHAR(50) CHECK (entity_type IN ('bookmark', 'collection', 'post', 'link_group', 'settings')) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) CHECK (action IN ('create', 'update', 'delete')) NOT NULL,

  -- Sync data
  sync_data JSONB NOT NULL,

  -- Target devices (null = all devices)
  target_device_ids TEXT[], -- Array of device_ids to sync to

  -- Status
  is_processed BOOLEAN DEFAULT false,
  processed_by_devices TEXT[] DEFAULT '{}', -- Array of device_ids that have processed this sync

  -- Priority (higher = more important)
  priority INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Sync Conflicts Table (for handling conflicts)
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Conflict details
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Conflicting versions
  device_1_id VARCHAR(255) NOT NULL,
  device_1_data JSONB NOT NULL,
  device_1_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

  device_2_id VARCHAR(255) NOT NULL,
  device_2_data JSONB NOT NULL,
  device_2_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolution_strategy VARCHAR(50), -- 'latest', 'merge', 'manual'
  resolved_data JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX idx_device_sessions_device_id ON device_sessions(device_id);
CREATE INDEX idx_device_sessions_active ON device_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_device_sessions_last_activity ON device_sessions(last_activity_at DESC);

CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_unprocessed ON sync_queue(is_processed) WHERE is_processed = false;
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at DESC);
CREATE INDEX idx_sync_queue_priority ON sync_queue(priority DESC);

CREATE INDEX idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX idx_sync_conflicts_unresolved ON sync_conflicts(is_resolved) WHERE is_resolved = false;

-- Row Level Security (RLS)
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

-- Policies for device_sessions
CREATE POLICY "Users can view their own device sessions"
  ON device_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own device sessions"
  ON device_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device sessions"
  ON device_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device sessions"
  ON device_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for sync_queue
CREATE POLICY "Users can view their own sync queue"
  ON sync_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sync queue items"
  ON sync_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync queue"
  ON sync_queue FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for sync_conflicts
CREATE POLICY "Users can view their own sync conflicts"
  ON sync_conflicts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync conflicts"
  ON sync_conflicts FOR UPDATE
  USING (auth.uid() = user_id);

-- Functions

-- Function to register or update device session
CREATE OR REPLACE FUNCTION register_device_session(
  p_user_id UUID,
  p_device_id VARCHAR,
  p_device_name VARCHAR DEFAULT NULL,
  p_device_type VARCHAR DEFAULT NULL,
  p_platform VARCHAR DEFAULT NULL,
  p_session_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO device_sessions (
    user_id,
    device_id,
    device_name,
    device_type,
    platform,
    session_data,
    last_activity_at
  )
  VALUES (
    p_user_id,
    p_device_id,
    p_device_name,
    p_device_type,
    p_platform,
    p_session_data,
    NOW()
  )
  ON CONFLICT (device_id)
  DO UPDATE SET
    last_activity_at = NOW(),
    session_data = EXCLUDED.session_data,
    is_active = true,
    updated_at = NOW()
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add item to sync queue
CREATE OR REPLACE FUNCTION queue_sync(
  p_user_id UUID,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_action VARCHAR,
  p_sync_data JSONB,
  p_target_device_ids TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_sync_id UUID;
BEGIN
  INSERT INTO sync_queue (
    user_id,
    entity_type,
    entity_id,
    action,
    sync_data,
    target_device_ids
  )
  VALUES (
    p_user_id,
    p_entity_type,
    p_entity_id,
    p_action,
    p_sync_data,
    p_target_device_ids
  )
  RETURNING id INTO v_sync_id;

  RETURN v_sync_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark sync item as processed by device
CREATE OR REPLACE FUNCTION mark_sync_processed(
  p_sync_id UUID,
  p_device_id VARCHAR
)
RETURNS VOID AS $$
BEGIN
  UPDATE sync_queue
  SET processed_by_devices = array_append(processed_by_devices, p_device_id),
      is_processed = (
        CASE
          WHEN target_device_ids IS NULL THEN false -- Global sync, never fully processed
          WHEN array_length(processed_by_devices, 1) + 1 >= array_length(target_device_ids, 1) THEN true
          ELSE false
        END
      )
  WHERE id = p_sync_id
  AND NOT (processed_by_devices @> ARRAY[p_device_id]); -- Only if not already processed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate old sessions (inactive for >30 days)
CREATE OR REPLACE FUNCTION deactivate_old_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE device_sessions
  SET is_active = false,
      updated_at = NOW()
  WHERE is_active = true
  AND last_activity_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old sync queue items
CREATE OR REPLACE FUNCTION cleanup_sync_queue()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM sync_queue
  WHERE expires_at < NOW()
  OR (is_processed = true AND created_at < NOW() - INTERVAL '7 days');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_device_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_session_updated_at
  BEFORE UPDATE ON device_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_device_session_updated_at();
