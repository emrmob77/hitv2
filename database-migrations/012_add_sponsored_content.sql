-- Sponsored Content and Brand Partnership System
-- This migration adds tables for managing sponsored content and brand partnerships

-- Sponsored Content Table
CREATE TABLE IF NOT EXISTS sponsored_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Content details
  content_type VARCHAR(50) CHECK (content_type IN ('bookmark', 'post', 'collection', 'link_group')) NOT NULL,
  content_id UUID NOT NULL, -- References the actual content

  -- Sponsorship details
  sponsor_name VARCHAR(255) NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_url TEXT,
  campaign_name VARCHAR(255),

  -- Placement settings
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority = shown more often
  target_audience JSONB, -- Targeting criteria

  -- Budget and billing
  budget_cents INTEGER, -- Total budget in cents
  cost_per_impression_cents INTEGER, -- CPI in cents
  cost_per_click_cents INTEGER, -- CPC in cents
  max_impressions INTEGER,
  max_clicks INTEGER,

  -- Tracking
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_spend_cents INTEGER DEFAULT 0,

  -- Disclosure (for transparency)
  disclosure_text TEXT DEFAULT 'Sponsored',
  is_clearly_marked BOOLEAN DEFAULT true,

  -- Schedule
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand Partnership Table
CREATE TABLE IF NOT EXISTS brand_partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Brand details
  brand_name VARCHAR(255) NOT NULL,
  brand_logo_url TEXT,
  brand_website TEXT,
  industry VARCHAR(100),

  -- Partnership details
  partnership_type VARCHAR(50) CHECK (partnership_type IN ('affiliate', 'sponsored', 'ambassador', 'collaboration')) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('pending', 'active', 'paused', 'ended')) DEFAULT 'pending',

  -- Terms
  commission_rate DECIMAL(5, 2), -- For affiliate partnerships (e.g., 10.5%)
  flat_fee_cents INTEGER, -- For sponsored content
  payment_terms TEXT,
  contract_url TEXT,

  -- Contact
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Performance requirements
  min_monthly_posts INTEGER,
  min_monthly_reach INTEGER,
  required_tags TEXT[],

  -- Schedule
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,

  -- Metadata
  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsored Content Analytics (for detailed tracking)
CREATE TABLE IF NOT EXISTS sponsored_content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsored_content_id UUID REFERENCES sponsored_content(id) ON DELETE CASCADE NOT NULL,

  event_type VARCHAR(50) CHECK (event_type IN ('impression', 'click', 'conversion')) NOT NULL,

  -- User information
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,

  -- Location
  country VARCHAR(2),
  city VARCHAR(100),

  -- Device info
  device_type VARCHAR(50), -- mobile, desktop, tablet
  browser VARCHAR(50),
  os VARCHAR(50),

  -- Referrer
  referrer_url TEXT,
  referrer_source VARCHAR(100),

  -- Conversion tracking
  conversion_value_cents INTEGER,
  conversion_type VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sponsored_content_user_id ON sponsored_content(user_id);
CREATE INDEX idx_sponsored_content_active ON sponsored_content(is_active) WHERE is_active = true;
CREATE INDEX idx_sponsored_content_dates ON sponsored_content(start_date, end_date);
CREATE INDEX idx_sponsored_content_priority ON sponsored_content(priority DESC);

CREATE INDEX idx_brand_partnerships_user_id ON brand_partnerships(user_id);
CREATE INDEX idx_brand_partnerships_status ON brand_partnerships(status);
CREATE INDEX idx_brand_partnerships_type ON brand_partnerships(partnership_type);

CREATE INDEX idx_sponsored_analytics_content_id ON sponsored_content_analytics(sponsored_content_id);
CREATE INDEX idx_sponsored_analytics_event_type ON sponsored_content_analytics(event_type);
CREATE INDEX idx_sponsored_analytics_created_at ON sponsored_content_analytics(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE sponsored_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_content_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for sponsored_content
CREATE POLICY "Users can view their own sponsored content"
  ON sponsored_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sponsored content"
  ON sponsored_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sponsored content"
  ON sponsored_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sponsored content"
  ON sponsored_content FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for brand_partnerships
CREATE POLICY "Users can view their own brand partnerships"
  ON brand_partnerships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand partnerships"
  ON brand_partnerships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand partnerships"
  ON brand_partnerships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand partnerships"
  ON brand_partnerships FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for sponsored_content_analytics
CREATE POLICY "Users can view analytics for their sponsored content"
  ON sponsored_content_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sponsored_content
      WHERE id = sponsored_content_analytics.sponsored_content_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics events"
  ON sponsored_content_analytics FOR INSERT
  WITH CHECK (true); -- Tracking events can be inserted by anyone

-- Functions

-- Function to increment sponsored content metrics
CREATE OR REPLACE FUNCTION increment_sponsored_content_metric(
  p_sponsored_content_id UUID,
  p_metric_type VARCHAR,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  IF p_metric_type = 'impressions' THEN
    UPDATE sponsored_content
    SET total_impressions = total_impressions + p_amount,
        updated_at = NOW()
    WHERE id = p_sponsored_content_id;
  ELSIF p_metric_type = 'clicks' THEN
    UPDATE sponsored_content
    SET total_clicks = total_clicks + p_amount,
        updated_at = NOW()
    WHERE id = p_sponsored_content_id;
  ELSIF p_metric_type = 'conversions' THEN
    UPDATE sponsored_content
    SET total_conversions = total_conversions + p_amount,
        updated_at = NOW()
    WHERE id = p_sponsored_content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if sponsored content budget is exhausted
CREATE OR REPLACE FUNCTION is_sponsored_content_budget_available(p_sponsored_content_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_sponsored_content sponsored_content;
BEGIN
  SELECT * INTO v_sponsored_content
  FROM sponsored_content
  WHERE id = p_sponsored_content_id;

  -- Check if active
  IF NOT v_sponsored_content.is_active THEN
    RETURN false;
  END IF;

  -- Check dates
  IF v_sponsored_content.start_date IS NOT NULL AND NOW() < v_sponsored_content.start_date THEN
    RETURN false;
  END IF;

  IF v_sponsored_content.end_date IS NOT NULL AND NOW() > v_sponsored_content.end_date THEN
    RETURN false;
  END IF;

  -- Check budget
  IF v_sponsored_content.budget_cents IS NOT NULL AND
     v_sponsored_content.total_spend_cents >= v_sponsored_content.budget_cents THEN
    RETURN false;
  END IF;

  -- Check max impressions
  IF v_sponsored_content.max_impressions IS NOT NULL AND
     v_sponsored_content.total_impressions >= v_sponsored_content.max_impressions THEN
    RETURN false;
  END IF;

  -- Check max clicks
  IF v_sponsored_content.max_clicks IS NOT NULL AND
     v_sponsored_content.total_clicks >= v_sponsored_content.max_clicks THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sponsored_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sponsored_content_updated_at
  BEFORE UPDATE ON sponsored_content
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsored_content_updated_at();

CREATE TRIGGER trigger_update_brand_partnerships_updated_at
  BEFORE UPDATE ON brand_partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsored_content_updated_at();
