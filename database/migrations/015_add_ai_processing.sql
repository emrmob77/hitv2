-- AI Processing System
-- This migration adds tables for AI-powered content processing

-- AI processing jobs table
CREATE TABLE IF NOT EXISTS ai_processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Job details
  job_type VARCHAR(50) CHECK (job_type IN ('auto_tag', 'summarize', 'duplicate_detection', 'content_analysis')) NOT NULL,
  entity_type VARCHAR(50) CHECK (entity_type IN ('bookmark', 'post', 'collection')) NOT NULL,
  entity_id UUID NOT NULL,

  -- Status
  status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  priority INTEGER DEFAULT 0,

  -- Input/Output
  input_data JSONB,
  output_data JSONB,

  -- AI provider details
  ai_provider VARCHAR(50) DEFAULT 'openai', -- 'openai', 'claude', 'custom'
  model_used VARCHAR(100),
  tokens_used INTEGER,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-generated tags table
CREATE TABLE IF NOT EXISTS ai_generated_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) CHECK (entity_type IN ('bookmark', 'post', 'collection')) NOT NULL,
  entity_id UUID NOT NULL,

  -- Tag details
  tag VARCHAR(100) NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL, -- 0-100
  category VARCHAR(50), -- 'topic', 'industry', 'technology', etc.

  -- Metadata
  ai_provider VARCHAR(50),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(entity_type, entity_id, tag)
);

-- Content summaries table
CREATE TABLE IF NOT EXISTS ai_content_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) CHECK (entity_type IN ('bookmark', 'post')) NOT NULL,
  entity_id UUID UNIQUE NOT NULL,

  -- Summary
  short_summary TEXT, -- 1-2 sentences
  long_summary TEXT, -- 1-2 paragraphs
  key_points TEXT[], -- Bullet points

  -- Metadata
  language VARCHAR(10),
  word_count INTEGER,
  reading_time_minutes INTEGER,

  -- AI details
  ai_provider VARCHAR(50),
  model_used VARCHAR(100),
  confidence DECIMAL(5, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Duplicate detection results
CREATE TABLE IF NOT EXISTS ai_duplicate_detection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source entity
  entity_type VARCHAR(50) CHECK (entity_type IN ('bookmark', 'post')) NOT NULL,
  entity_id UUID NOT NULL,

  -- Duplicate entity
  duplicate_entity_type VARCHAR(50) CHECK (duplicate_entity_type IN ('bookmark', 'post')) NOT NULL,
  duplicate_entity_id UUID NOT NULL,

  -- Similarity metrics
  similarity_score DECIMAL(5, 2) NOT NULL, -- 0-100
  similarity_type VARCHAR(50), -- 'url', 'content', 'title', 'semantic'

  -- Decision
  is_confirmed_duplicate BOOLEAN DEFAULT NULL,
  action_taken VARCHAR(50), -- 'merged', 'kept_both', 'deleted', 'ignored'

  -- Metadata
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(entity_type, entity_id, duplicate_entity_type, duplicate_entity_id)
);

-- Indexes
CREATE INDEX idx_ai_jobs_user_id ON ai_processing_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON ai_processing_jobs(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_ai_jobs_type ON ai_processing_jobs(job_type);
CREATE INDEX idx_ai_jobs_priority ON ai_processing_jobs(priority DESC, created_at ASC);

CREATE INDEX idx_ai_tags_entity ON ai_generated_tags(entity_type, entity_id);
CREATE INDEX idx_ai_tags_tag ON ai_generated_tags(tag);
CREATE INDEX idx_ai_tags_confidence ON ai_generated_tags(confidence DESC);

CREATE INDEX idx_ai_summaries_entity ON ai_content_summaries(entity_type, entity_id);

CREATE INDEX idx_ai_duplicates_entity ON ai_duplicate_detection(entity_type, entity_id);
CREATE INDEX idx_ai_duplicates_score ON ai_duplicate_detection(similarity_score DESC);
CREATE INDEX idx_ai_duplicates_unreviewed ON ai_duplicate_detection(is_confirmed_duplicate) WHERE is_confirmed_duplicate IS NULL;

-- Row Level Security (RLS)
ALTER TABLE ai_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_duplicate_detection ENABLE ROW LEVEL SECURITY;

-- Policies for ai_processing_jobs
CREATE POLICY "Users can view their own AI jobs"
  ON ai_processing_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI jobs"
  ON ai_processing_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update AI jobs"
  ON ai_processing_jobs FOR UPDATE
  USING (true);

-- Policies for ai_generated_tags (public read for public content)
CREATE POLICY "Anyone can view AI tags for public content"
  ON ai_generated_tags FOR SELECT
  USING (true);

CREATE POLICY "System can insert AI tags"
  ON ai_generated_tags FOR INSERT
  WITH CHECK (true);

-- Policies for ai_content_summaries
CREATE POLICY "Anyone can view AI summaries for public content"
  ON ai_content_summaries FOR SELECT
  USING (true);

CREATE POLICY "System can manage AI summaries"
  ON ai_content_summaries FOR ALL
  USING (true);

-- Policies for ai_duplicate_detection
CREATE POLICY "Users can view duplicates for their content"
  ON ai_duplicate_detection FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookmarks
      WHERE id = ai_duplicate_detection.entity_id
      AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = ai_duplicate_detection.entity_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage duplicate detection"
  ON ai_duplicate_detection FOR ALL
  USING (true);

-- Functions

-- Queue AI processing job
CREATE OR REPLACE FUNCTION queue_ai_job(
  p_user_id UUID,
  p_job_type VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_input_data JSONB DEFAULT NULL,
  p_priority INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO ai_processing_jobs (
    user_id,
    job_type,
    entity_type,
    entity_id,
    input_data,
    priority
  )
  VALUES (
    p_user_id,
    p_job_type,
    p_entity_type,
    p_entity_id,
    p_input_data,
    p_priority
  )
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get next pending job
CREATE OR REPLACE FUNCTION get_next_ai_job()
RETURNS TABLE (
  job_id UUID,
  user_id UUID,
  job_type VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  input_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  UPDATE ai_processing_jobs
  SET status = 'processing',
      started_at = NOW(),
      updated_at = NOW()
  WHERE id = (
    SELECT id
    FROM ai_processing_jobs
    WHERE status = 'pending'
    AND retry_count < max_retries
    ORDER BY priority DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING
    id as job_id,
    ai_processing_jobs.user_id,
    ai_processing_jobs.job_type,
    ai_processing_jobs.entity_type,
    ai_processing_jobs.entity_id,
    ai_processing_jobs.input_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete AI job
CREATE OR REPLACE FUNCTION complete_ai_job(
  p_job_id UUID,
  p_output_data JSONB,
  p_model_used VARCHAR DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_processing_jobs
  SET status = 'completed',
      output_data = p_output_data,
      model_used = p_model_used,
      tokens_used = p_tokens_used,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fail AI job
CREATE OR REPLACE FUNCTION fail_ai_job(
  p_job_id UUID,
  p_error_message TEXT
)
RETURNS VOID AS $$
DECLARE
  v_job ai_processing_jobs;
BEGIN
  SELECT * INTO v_job FROM ai_processing_jobs WHERE id = p_job_id;

  IF v_job.retry_count < v_job.max_retries THEN
    -- Retry
    UPDATE ai_processing_jobs
    SET status = 'pending',
        retry_count = retry_count + 1,
        error_message = p_error_message,
        updated_at = NOW()
    WHERE id = p_job_id;
  ELSE
    -- Fail permanently
    UPDATE ai_processing_jobs
    SET status = 'failed',
        error_message = p_error_message,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_job_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old completed jobs
CREATE OR REPLACE FUNCTION cleanup_old_ai_jobs()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM ai_processing_jobs
  WHERE status IN ('completed', 'failed')
  AND completed_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_ai_jobs_updated_at
  BEFORE UPDATE ON ai_processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_search_updated_at();

CREATE TRIGGER trigger_update_ai_summaries_updated_at
  BEFORE UPDATE ON ai_content_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_search_updated_at();
