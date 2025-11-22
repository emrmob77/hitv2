-- Content Moderation and Security System
-- Migration 011: Add content reporting, user blocking, and moderation tools

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Polymorphic content reference
  content_type TEXT NOT NULL CHECK (content_type IN ('bookmark', 'collection', 'post', 'comment', 'user', 'link_group')),
  content_id UUID NOT NULL,

  -- Report details
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'harassment',
    'inappropriate_content',
    'copyright_violation',
    'misinformation',
    'hate_speech',
    'violence',
    'other'
  )),
  description TEXT,

  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderator_notes TEXT,
  resolution TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_content ON reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- BLOCKED USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate blocks
  UNIQUE(blocker_id, blocked_id),

  -- Can't block yourself
  CHECK (blocker_id != blocked_id)
);

-- Indexes for blocked users
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- ============================================================================
-- MODERATION ACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'content_removed',
    'user_warned',
    'user_suspended',
    'user_banned',
    'content_approved',
    'report_dismissed'
  )),

  -- Polymorphic content reference
  content_type TEXT CHECK (content_type IN ('bookmark', 'collection', 'post', 'comment', 'user', 'link_group')),
  content_id UUID,

  reason TEXT NOT NULL,
  notes TEXT,

  -- Related report if any
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes for moderation actions
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_user ON moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created_at ON moderation_actions(created_at DESC);

-- ============================================================================
-- USER SUSPENSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_suspensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  reason TEXT NOT NULL,
  notes TEXT,

  -- Suspension details
  is_permanent BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Appeal
  appeal_text TEXT,
  appeal_status TEXT CHECK (appeal_status IN ('pending', 'approved', 'rejected')),
  appeal_reviewed_at TIMESTAMPTZ,
  appeal_reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user suspensions
CREATE INDEX IF NOT EXISTS idx_user_suspensions_user ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_active ON user_suspensions(user_id, expires_at) WHERE is_permanent = FALSE;

-- ============================================================================
-- SPAM PREVENTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS spam_detection_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,

  -- Activity tracking
  action_type TEXT NOT NULL CHECK (action_type IN (
    'bookmark_create',
    'collection_create',
    'post_create',
    'comment_create',
    'link_click',
    'affiliate_click'
  )),

  -- Detection
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  detection_reason TEXT,

  -- Metadata
  user_agent TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for spam detection
CREATE INDEX IF NOT EXISTS idx_spam_detection_user ON spam_detection_log(user_id);
CREATE INDEX IF NOT EXISTS idx_spam_detection_ip ON spam_detection_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_spam_detection_suspicious ON spam_detection_log(is_suspicious) WHERE is_suspicious = TRUE;
CREATE INDEX IF NOT EXISTS idx_spam_detection_created_at ON spam_detection_log(created_at DESC);

-- ============================================================================
-- GDPR DATA EXPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_type TEXT NOT NULL CHECK (export_type IN ('full', 'bookmarks', 'collections', 'posts', 'analytics')),

  -- File storage
  file_url TEXT,
  file_size_bytes BIGINT,
  expires_at TIMESTAMPTZ,

  -- Processing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for data exports
CREATE INDEX IF NOT EXISTS idx_data_exports_user ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_export_requests(status);

-- ============================================================================
-- ADD MODERATION FIELDS TO PROFILES
-- ============================================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS warning_count INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Reports: Users can create reports, moderators can view all
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_moderator = TRUE
    )
  );

CREATE POLICY "Moderators can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_moderator = TRUE
    )
  );

-- Blocked users: Users can manage their own blocks
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their blocks"
  ON blocked_users FOR ALL
  TO authenticated
  USING (auth.uid() = blocker_id);

-- Moderation actions: Only moderators
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can manage moderation actions"
  ON moderation_actions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_moderator = TRUE
    )
  );

-- User suspensions: Moderators can manage
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can manage suspensions"
  ON user_suspensions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_moderator = TRUE
    )
  );

CREATE POLICY "Users can view their own suspensions"
  ON user_suspensions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Data export requests: Users can only see their own
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data exports"
  ON data_export_requests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_suspensions
    WHERE user_id = user_id_param
    AND (
      is_permanent = TRUE
      OR (expires_at IS NOT NULL AND expires_at > NOW())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is blocked by another user
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_id_param UUID, blocked_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE blocker_id = blocker_id_param
    AND blocked_id = blocked_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update report timestamp
CREATE OR REPLACE FUNCTION update_report_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  IF NEW.status IN ('resolved', 'dismissed') AND OLD.status != NEW.status THEN
    NEW.resolved_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for report updates
DROP TRIGGER IF EXISTS trigger_update_report_timestamp ON reports;
CREATE TRIGGER trigger_update_report_timestamp
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_report_timestamp();
