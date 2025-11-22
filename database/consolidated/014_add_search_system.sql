-- Elasticsearch Integration Schema
-- This migration adds support for full-text search with Elasticsearch

-- Search indexes tracking table
CREATE TABLE IF NOT EXISTS search_indexes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) CHECK (entity_type IN ('bookmark', 'collection', 'post', 'user', 'tag')) NOT NULL,
  entity_id UUID NOT NULL,

  -- Elasticsearch metadata
  index_name VARCHAR(255) NOT NULL,
  document_id VARCHAR(255) NOT NULL,

  -- Indexing status
  is_indexed BOOLEAN DEFAULT false,
  last_indexed_at TIMESTAMP WITH TIME ZONE,
  index_version INTEGER DEFAULT 1,

  -- Error tracking
  index_error TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(entity_type, entity_id)
);

-- Search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Search details
  query TEXT NOT NULL,
  filters JSONB,

  -- Results
  total_results INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_position INTEGER,

  -- Context
  search_type VARCHAR(50) CHECK (search_type IN ('simple', 'advanced', 'visual', 'voice')) DEFAULT 'simple',
  device_type VARCHAR(50),

  -- Performance
  response_time_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending topics table
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Topic details
  topic VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),

  -- Metrics
  mention_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  user_count INTEGER DEFAULT 0,

  -- Scoring
  trend_score DECIMAL(10, 2) DEFAULT 0,
  velocity DECIMAL(10, 2) DEFAULT 0, -- Rate of growth

  -- Time windows
  last_24h_count INTEGER DEFAULT 0,
  last_7d_count INTEGER DEFAULT 0,
  last_30d_count INTEGER DEFAULT 0,

  -- Metadata
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  peak_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search suggestions table (for autocomplete)
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  suggestion TEXT UNIQUE NOT NULL,
  category VARCHAR(50),

  -- Usage stats
  search_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Quality score
  quality_score DECIMAL(5, 2) DEFAULT 0,

  -- Freshness
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation engine data
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Recommendation
  recommended_type VARCHAR(50) CHECK (recommended_type IN ('bookmark', 'collection', 'user', 'tag')) NOT NULL,
  recommended_id UUID NOT NULL,

  -- Scoring
  relevance_score DECIMAL(5, 2) NOT NULL,
  confidence DECIMAL(5, 2),

  -- Reasoning
  reason VARCHAR(100), -- 'similar_users', 'content_based', 'trending', etc.

  -- Interaction tracking
  was_shown BOOLEAN DEFAULT false,
  was_clicked BOOLEAN DEFAULT false,
  was_dismissed BOOLEAN DEFAULT false,
  shown_at TIMESTAMP WITH TIME ZONE,
  interacted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes for performance
CREATE INDEX idx_search_indexes_entity ON search_indexes(entity_type, entity_id);
CREATE INDEX idx_search_indexes_not_indexed ON search_indexes(is_indexed) WHERE is_indexed = false;
CREATE INDEX idx_search_indexes_updated ON search_indexes(updated_at DESC);

CREATE INDEX idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at DESC);
CREATE INDEX idx_search_analytics_query ON search_analytics USING gin(to_tsvector('english', query));

CREATE INDEX idx_trending_topics_score ON trending_topics(trend_score DESC);
CREATE INDEX idx_trending_topics_velocity ON trending_topics(velocity DESC);
CREATE INDEX idx_trending_topics_updated ON trending_topics(updated_at DESC);

CREATE INDEX idx_search_suggestions_text ON search_suggestions USING gin(to_tsvector('english', suggestion));
CREATE INDEX idx_search_suggestions_score ON search_suggestions(quality_score DESC);

CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_type ON user_recommendations(recommended_type, recommended_id);
CREATE INDEX idx_user_recommendations_score ON user_recommendations(relevance_score DESC);
CREATE INDEX idx_user_recommendations_active ON user_recommendations(user_id, expires_at) WHERE expires_at > NOW();

-- Row Level Security (RLS)
ALTER TABLE search_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for search_indexes (admin only for management)
CREATE POLICY "Admins can manage search indexes"
  ON search_indexes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Policies for search_analytics
CREATE POLICY "Users can view their own search analytics"
  ON search_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert search analytics"
  ON search_analytics FOR INSERT
  WITH CHECK (true);

-- Policies for trending_topics (public read)
CREATE POLICY "Anyone can view trending topics"
  ON trending_topics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage trending topics"
  ON trending_topics FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Policies for search_suggestions (public read)
CREATE POLICY "Anyone can view search suggestions"
  ON search_suggestions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert search suggestions"
  ON search_suggestions FOR INSERT
  WITH CHECK (true);

-- Policies for user_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON user_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations"
  ON user_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own recommendations"
  ON user_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- Functions

-- Function to update trend score
CREATE OR REPLACE FUNCTION update_trend_score(p_topic VARCHAR)
RETURNS VOID AS $$
DECLARE
  v_topic trending_topics;
  v_new_score DECIMAL(10, 2);
  v_velocity DECIMAL(10, 2);
BEGIN
  SELECT * INTO v_topic FROM trending_topics WHERE topic = p_topic;

  IF v_topic IS NULL THEN
    RETURN;
  END IF;

  -- Calculate velocity (growth rate)
  IF v_topic.last_7d_count > 0 THEN
    v_velocity := (v_topic.last_24h_count::DECIMAL / v_topic.last_7d_count) * 100;
  ELSE
    v_velocity := 0;
  END IF;

  -- Calculate trend score
  -- Score = (recent mentions * 2) + (velocity * 10) + (unique users * 5)
  v_new_score := (v_topic.last_24h_count * 2) + (v_velocity * 10) + (v_topic.user_count * 5);

  UPDATE trending_topics
  SET trend_score = v_new_score,
      velocity = v_velocity,
      updated_at = NOW()
  WHERE topic = p_topic;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record search
CREATE OR REPLACE FUNCTION record_search(
  p_user_id UUID,
  p_query TEXT,
  p_total_results INTEGER,
  p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_analytics_id UUID;
BEGIN
  INSERT INTO search_analytics (
    user_id,
    query,
    total_results,
    response_time_ms
  )
  VALUES (
    p_user_id,
    p_query,
    p_total_results,
    p_response_time_ms
  )
  RETURNING id INTO v_analytics_id;

  -- Update or create search suggestion
  INSERT INTO search_suggestions (suggestion, search_count, last_searched_at)
  VALUES (p_query, 1, NOW())
  ON CONFLICT (suggestion)
  DO UPDATE SET
    search_count = search_suggestions.search_count + 1,
    last_searched_at = NOW(),
    updated_at = NOW();

  RETURN v_analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending topics
CREATE OR REPLACE FUNCTION get_trending_topics(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  topic VARCHAR,
  trend_score DECIMAL,
  mention_count INTEGER,
  velocity DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.topic,
    t.trend_score,
    t.last_24h_count as mention_count,
    t.velocity
  FROM trending_topics t
  WHERE t.last_seen_at > NOW() - INTERVAL '7 days'
  ORDER BY t.trend_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old recommendations
CREATE OR REPLACE FUNCTION cleanup_old_recommendations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM user_recommendations
  WHERE expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_search_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_indexes_updated_at
  BEFORE UPDATE ON search_indexes
  FOR EACH ROW
  EXECUTE FUNCTION update_search_updated_at();

CREATE TRIGGER trigger_update_trending_topics_updated_at
  BEFORE UPDATE ON trending_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_search_updated_at();

CREATE TRIGGER trigger_update_search_suggestions_updated_at
  BEFORE UPDATE ON search_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_search_updated_at();
