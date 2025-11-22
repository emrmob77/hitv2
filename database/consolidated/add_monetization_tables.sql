-- Content Monetization and Partnership System
-- This migration creates tables for creator monetization, partnerships, and sponsored content

-- Creator Monetization Applications
CREATE TABLE IF NOT EXISTS creator_monetization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  application_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Eligibility Metrics
  total_followers INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  total_collections INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.00,

  -- Quality Score (0-100)
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),

  -- Revenue Settings
  revenue_share_percentage DECIMAL(5,2) DEFAULT 70.00 CHECK (revenue_share_percentage >= 0 AND revenue_share_percentage <= 100),
  minimum_payout_amount DECIMAL(10,2) DEFAULT 100.00,

  -- Payment Information
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer')),
  payment_details JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Brand Partnerships
CREATE TABLE IF NOT EXISTS brand_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Partner Information
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  brand_website TEXT,
  contact_email TEXT NOT NULL,
  contact_name TEXT,

  -- Partnership Details
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,

  -- Budget and Rates
  total_budget DECIMAL(10,2),
  cost_per_click DECIMAL(10,2),
  cost_per_impression DECIMAL(10,2),

  -- Targeting
  target_categories TEXT[],
  target_tags TEXT[],
  target_audience JSONB,

  -- Performance
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsored Content
CREATE TABLE IF NOT EXISTS sponsored_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES brand_partnerships(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Content Information
  content_type TEXT NOT NULL CHECK (content_type IN ('bookmark', 'collection', 'post')),
  content_id UUID NOT NULL,

  -- Sponsored Details
  is_sponsored BOOLEAN DEFAULT true,
  sponsor_label TEXT DEFAULT 'Sponsored',
  disclosure_text TEXT,

  -- Campaign Info
  campaign_name TEXT,
  campaign_start_date TIMESTAMPTZ,
  campaign_end_date TIMESTAMPTZ,

  -- Performance Tracking
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Revenue
  creator_earnings DECIMAL(10,2) DEFAULT 0.00,
  platform_earnings DECIMAL(10,2) DEFAULT 0.00,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue Transactions
CREATE TABLE IF NOT EXISTS revenue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue_share', 'sponsored_content', 'affiliate_commission', 'subscription', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Source
  source_type TEXT CHECK (source_type IN ('sponsored_content', 'collection_views', 'bookmark_clicks', 'affiliate_link', 'subscription')),
  source_id UUID,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),

  -- Payment Details
  payout_date TIMESTAMPTZ,
  payout_method TEXT,
  payout_reference TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creator_monetization_user ON creator_monetization(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_monetization_status ON creator_monetization(status);
CREATE INDEX IF NOT EXISTS idx_brand_partnerships_status ON brand_partnerships(status);
CREATE INDEX IF NOT EXISTS idx_sponsored_content_partnership ON sponsored_content(partnership_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_content_creator ON sponsored_content(creator_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_content_content ON sponsored_content(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_revenue_transactions_user ON revenue_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_transactions_status ON revenue_transactions(status);

-- Row Level Security (RLS) Policies

-- Creator Monetization RLS
ALTER TABLE creator_monetization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own monetization status"
  ON creator_monetization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own application"
  ON creator_monetization FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application"
  ON creator_monetization FOR UPDATE
  USING (auth.uid() = user_id);

-- Brand Partnerships RLS (Admin only - will be handled via service role)
ALTER TABLE brand_partnerships ENABLE ROW LEVEL SECURITY;

-- Sponsored Content RLS
ALTER TABLE sponsored_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sponsored content"
  ON sponsored_content FOR SELECT
  USING (status = 'active');

CREATE POLICY "Creators can view their own sponsored content"
  ON sponsored_content FOR SELECT
  USING (auth.uid() = creator_id);

-- Revenue Transactions RLS
ALTER TABLE revenue_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON revenue_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE creator_monetization IS 'Creator monetization applications and status';
COMMENT ON TABLE brand_partnerships IS 'Brand partnership campaigns and budgets';
COMMENT ON TABLE sponsored_content IS 'Sponsored bookmarks, collections, and posts';
COMMENT ON TABLE revenue_transactions IS 'Revenue transactions and payouts for creators';

COMMENT ON COLUMN creator_monetization.quality_score IS 'Quality score based on engagement, content quality, and community feedback (0-100)';
COMMENT ON COLUMN creator_monetization.revenue_share_percentage IS 'Percentage of revenue creator receives (default 70%)';
COMMENT ON COLUMN sponsored_content.disclosure_text IS 'Required disclosure text for sponsored content transparency';
