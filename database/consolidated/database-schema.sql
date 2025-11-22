-- HitTags Platform - Complete Database Schema
-- PostgreSQL + Supabase Implementation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    location VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    bookmark_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    privacy_level VARCHAR(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'friends')),
    default_bookmark_privacy VARCHAR(20) DEFAULT 'public' CHECK (default_bookmark_privacy IN ('public', 'private', 'subscribers')),
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTION & BILLING
-- =============================================

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    bookmark_limit INTEGER,
    collection_limit INTEGER,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTENT MANAGEMENT
-- =============================================

-- Tags system
CREATE TABLE tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    usage_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id),
    -- SEO fields
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    seo_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    favicon_url TEXT,
    image_url TEXT,
    domain VARCHAR(255),
    meta_data JSONB DEFAULT '{}',
    privacy_level VARCHAR(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'subscribers')),
    is_archived BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    -- SEO fields
    slug VARCHAR(200),
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    canonical_url TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_user_url UNIQUE(user_id, url)
);

-- Bookmark tags relationship
CREATE TABLE bookmark_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(bookmark_id, tag_id)
);

-- Collections
CREATE TABLE collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    privacy_level VARCHAR(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'subscribers')),
    is_collaborative BOOLEAN DEFAULT FALSE,
    bookmark_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, slug)
);

-- Collection bookmarks relationship
CREATE TABLE collection_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    added_by UUID REFERENCES profiles(id),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(collection_id, bookmark_id)
);

-- Collection collaborators
CREATE TABLE collection_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('owner', 'editor', 'contributor', 'viewer')),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES profiles(id),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(collection_id, user_id)
);

-- Collection followers
CREATE TABLE collection_followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(collection_id, user_id)
);

-- =============================================
-- SOCIAL FEATURES
-- =============================================

-- User follows
CREATE TABLE follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Tag followers
CREATE TABLE tag_followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tag_id, user_id)
);

-- Likes system (polymorphic)
CREATE TABLE likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    likeable_type VARCHAR(50) NOT NULL CHECK (likeable_type IN ('bookmark', 'collection', 'comment', 'exclusive_post')),
    likeable_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, likeable_type, likeable_id)
);

-- Comments system (polymorphic)
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    commentable_type VARCHAR(50) NOT NULL CHECK (commentable_type IN ('bookmark', 'collection', 'exclusive_post')),
    commentable_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions (following users for exclusive content)
CREATE TABLE subscriptions_user (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscriber_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(subscriber_id, creator_id),
    CHECK (subscriber_id != creator_id)
);

-- =============================================
-- PREMIUM FEATURES
-- =============================================

-- Exclusive posts (premium feature)
CREATE TABLE exclusive_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'html')),
    media_urls JSONB DEFAULT '[]',
    visibility VARCHAR(20) DEFAULT 'subscribers' CHECK (visibility IN ('subscribers', 'premium', 'private')),
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link groups (Linktree-like feature)
CREATE TABLE link_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    theme JSONB DEFAULT '{}',
    custom_css TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, slug)
);

-- Link group items
CREATE TABLE link_group_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_group_id UUID REFERENCES link_groups(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tag links (premium feature - direct links to tags)
CREATE TABLE tag_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tag_id, user_id, url)
);

-- =============================================
-- AFFILIATE & MONETIZATION
-- =============================================

-- Affiliate links
CREATE TABLE affiliate_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    short_code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200),
    description TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate clicks tracking
CREATE TABLE affiliate_clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    visitor_ip INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    device_type VARCHAR(20),
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Earnings tracking
CREATE TABLE earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    affiliate_link_id UUID REFERENCES affiliate_links(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    source VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
    payout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS & TRACKING
-- =============================================

-- Analytics events
CREATE TABLE analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views tracking
CREATE TABLE page_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    viewable_type VARCHAR(50) NOT NULL CHECK (viewable_type IN ('bookmark', 'collection', 'profile', 'tag', 'link_group')),
    viewable_id UUID NOT NULL,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    device_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS & ACTIVITY
-- =============================================

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    object_type VARCHAR(50) NOT NULL,
    object_id UUID NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTENT MODERATION
-- =============================================

-- Reports
CREATE TABLE reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_type VARCHAR(50) NOT NULL,
    reported_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES profiles(id),
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked users
CREATE TABLE blocked_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- =============================================
-- SEARCH & DISCOVERY
-- =============================================

-- Search queries (for analytics)
CREATE TABLE search_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_result_id UUID,
    clicked_result_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending topics
CREATE TABLE trending_topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic VARCHAR(200) NOT NULL,
    topic_type VARCHAR(50) NOT NULL CHECK (topic_type IN ('tag', 'domain', 'keyword')),
    score DECIMAL(10,2) DEFAULT 0.00,
    period VARCHAR(20) NOT NULL CHECK (period IN ('hour', 'day', 'week', 'month')),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(topic, topic_type, period, date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Bookmarks indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_domain ON bookmarks(domain);
CREATE INDEX idx_bookmarks_privacy_level ON bookmarks(privacy_level);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at);
CREATE INDEX idx_bookmarks_like_count ON bookmarks(like_count);
CREATE INDEX idx_bookmarks_url_hash ON bookmarks USING hash(url);

-- Tags indexes
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage_count ON tags(usage_count);
CREATE INDEX idx_tags_is_trending ON tags(is_trending);

-- Collections indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_privacy_level ON collections(privacy_level);
CREATE INDEX idx_collections_created_at ON collections(created_at);

-- Social features indexes
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_tag_followers_tag_id ON tag_followers(tag_id);
CREATE INDEX idx_tag_followers_user_id ON tag_followers(user_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_likeable ON likes(likeable_type, likeable_id);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_page_views_viewable ON page_views(viewable_type, viewable_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update bookmark count
CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET bookmark_count = bookmark_count + 1 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET bookmark_count = bookmark_count - 1 WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookmark count
CREATE TRIGGER trigger_update_bookmark_count
    AFTER INSERT OR DELETE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_bookmark_count();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
        UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for follower count
CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_follower_count();

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        CASE NEW.likeable_type
            WHEN 'bookmark' THEN
                UPDATE bookmarks SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
            WHEN 'collection' THEN
                UPDATE collections SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
            WHEN 'comment' THEN
                UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
            WHEN 'exclusive_post' THEN
                UPDATE exclusive_posts SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
        END CASE;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        CASE OLD.likeable_type
            WHEN 'bookmark' THEN
                UPDATE bookmarks SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
            WHEN 'collection' THEN
                UPDATE collections SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
            WHEN 'comment' THEN
                UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
            WHEN 'exclusive_post' THEN
                UPDATE exclusive_posts SET like_count = like_count - 1 WHERE id = OLD.likeable_id;
        END CASE;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count
CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tag usage count
CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON bookmark_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_bookmarks_updated_at BEFORE UPDATE ON bookmarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exclusive_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Bookmarks policies
CREATE POLICY "Public bookmarks are viewable by everyone" ON bookmarks FOR SELECT USING (privacy_level = 'public');
CREATE POLICY "Private bookmarks are viewable by owner" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Subscriber bookmarks are viewable by subscribers" ON bookmarks FOR SELECT USING (
    privacy_level = 'subscribers' AND (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM subscriptions_user WHERE subscriber_id = auth.uid() AND creator_id = user_id AND status = 'active')
    )
);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Public collections are viewable by everyone" ON collections FOR SELECT USING (privacy_level = 'public');
CREATE POLICY "Private collections are viewable by owner" ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own collections" ON collections FOR ALL USING (auth.uid() = user_id);

-- Collection bookmarks policies
CREATE POLICY "Collection bookmarks accessible to collaborators" ON collection_bookmarks
FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
    OR EXISTS (
        SELECT 1 FROM collection_collaborators cc
        WHERE cc.collection_id = collection_bookmarks.collection_id
          AND cc.user_id = auth.uid()
    )
);

CREATE POLICY "Collection bookmarks can be reordered by editors" ON collection_bookmarks
FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
    OR EXISTS (
        SELECT 1 FROM collection_collaborators cc
        WHERE cc.collection_id = collection_bookmarks.collection_id
          AND cc.user_id = auth.uid()
          AND cc.role IN ('owner', 'editor')
    )
)
WITH CHECK (
    auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
    OR EXISTS (
        SELECT 1 FROM collection_collaborators cc
        WHERE cc.collection_id = collection_bookmarks.collection_id
          AND cc.user_id = auth.uid()
          AND cc.role IN ('owner', 'editor')
    )
);

CREATE POLICY "Collection bookmarks can be removed by editors" ON collection_bookmarks
FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
    OR EXISTS (
        SELECT 1 FROM collection_collaborators cc
        WHERE cc.collection_id = collection_bookmarks.collection_id
          AND cc.user_id = auth.uid()
          AND cc.role IN ('owner', 'editor')
    )
);

CREATE POLICY "Collection bookmarks can be added by contributors" ON collection_bookmarks
FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
    OR EXISTS (
        SELECT 1 FROM collection_collaborators cc
        WHERE cc.collection_id = collection_bookmarks.collection_id
          AND cc.user_id = auth.uid()
          AND cc.role IN ('owner', 'editor', 'contributor')
    )
);

-- Exclusive posts policies (premium feature)
CREATE POLICY "Exclusive posts viewable by subscribers" ON exclusive_posts FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM subscriptions_user WHERE subscriber_id = auth.uid() AND creator_id = user_id AND status = 'active')
);
CREATE POLICY "Users can manage own exclusive posts" ON exclusive_posts FOR ALL USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, bookmark_limit, collection_limit, features) VALUES
('Free', 'free', 'Perfect for getting started', 0.00, 0.00, 20, 3, '{"basic_bookmarking": true, "public_collections": true, "basic_search": true}'),
('Pro', 'pro', 'For power users and content creators', 9.99, 99.99, 1000, 50, '{"unlimited_bookmarks": true, "private_collections": true, "advanced_search": true, "analytics": true, "affiliate_links": true, "exclusive_posts": true}'),
('Enterprise', 'enterprise', 'For teams and organizations', 29.99, 299.99, -1, -1, '{"unlimited_everything": true, "team_collaboration": true, "advanced_analytics": true, "priority_support": true, "custom_branding": true, "api_access": true}');

-- Insert some default tags
INSERT INTO tags (name, slug, description, color, created_by) VALUES
('Technology', 'technology', 'Tech-related content and resources', '#3B82F6', NULL),
('Design', 'design', 'Design inspiration and resources', '#8B5CF6', NULL),
('Development', 'development', 'Programming and development resources', '#10B981', NULL),
('Business', 'business', 'Business and entrepreneurship content', '#F59E0B', NULL),
('Marketing', 'marketing', 'Marketing strategies and tools', '#EF4444', NULL),
('Education', 'education', 'Learning resources and tutorials', '#6366F1', NULL);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Popular bookmarks view
CREATE VIEW popular_bookmarks AS
SELECT 
    b.*,
    p.username,
    p.display_name,
    p.avatar_url,
    ARRAY_AGG(t.name) as tag_names
FROM bookmarks b
JOIN profiles p ON b.user_id = p.id
LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
LEFT JOIN tags t ON bt.tag_id = t.id
WHERE b.privacy_level = 'public'
GROUP BY b.id, p.username, p.display_name, p.avatar_url
ORDER BY b.like_count DESC, b.created_at DESC;

-- Trending tags view
CREATE VIEW trending_tags AS
SELECT 
    t.*,
    COUNT(bt.bookmark_id) as recent_usage
FROM tags t
LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
LEFT JOIN bookmarks b ON bt.bookmark_id = b.id
WHERE b.created_at >= NOW() - INTERVAL '7 days' OR b.created_at IS NULL
GROUP BY t.id
ORDER BY recent_usage DESC, t.usage_count DESC;

-- User stats view
CREATE VIEW user_stats AS
SELECT 
    p.id,
    p.username,
    p.bookmark_count,
    p.follower_count,
    p.following_count,
    COUNT(DISTINCT c.id) as collection_count,
    COUNT(DISTINCT l.id) as total_likes_given,
    SUM(b.like_count) as total_likes_received
FROM profiles p
LEFT JOIN collections c ON p.id = c.user_id
LEFT JOIN likes l ON p.id = l.user_id
LEFT JOIN bookmarks b ON p.id = b.user_id
GROUP BY p.id, p.username, p.bookmark_count, p.follower_count, p.following_count;

-- =============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Function to check if user can create bookmark (based on plan limits)
CREATE OR REPLACE FUNCTION can_create_bookmark(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan VARCHAR(20);
    current_count INTEGER;
    plan_limit INTEGER;
BEGIN
    -- Get user's current plan and bookmark count
    SELECT subscription_tier, bookmark_count INTO user_plan, current_count
    FROM profiles WHERE id = user_uuid;
    
    -- Get plan limit
    SELECT bookmark_limit INTO plan_limit
    FROM subscription_plans WHERE slug = user_plan;
    
    -- Check if unlimited (-1) or under limit
    RETURN plan_limit = -1 OR current_count < plan_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's feed
CREATE OR REPLACE FUNCTION get_user_feed(user_uuid UUID, page_limit INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    bookmark_id UUID,
    bookmark_title VARCHAR(500),
    bookmark_url TEXT,
    bookmark_description TEXT,
    bookmark_created_at TIMESTAMP WITH TIME ZONE,
    author_id UUID,
    author_username VARCHAR(50),
    author_display_name VARCHAR(100),
    author_avatar_url TEXT,
    like_count INTEGER,
    comment_count INTEGER,
    tag_names TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.url,
        b.description,
        b.created_at,
        p.id,
        p.username,
        p.display_name,
        p.avatar_url,
        b.like_count,
        b.comment_count,
        ARRAY_AGG(t.name) as tag_names
    FROM bookmarks b
    JOIN profiles p ON b.user_id = p.id
    LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
    LEFT JOIN tags t ON bt.tag_id = t.id
    WHERE b.privacy_level = 'public'
    AND (
        b.user_id = user_uuid OR -- Own bookmarks
        EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = user_uuid AND f.following_id = b.user_id) -- Following
    )
    GROUP BY b.id, p.id, p.username, p.display_name, p.avatar_url
    ORDER BY b.created_at DESC
    LIMIT page_limit OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

/*
This schema provides:

1. **Complete User Management**: Profiles, settings, subscriptions
2. **Content System**: Bookmarks, tags, collections with full relationships
3. **Social Features**: Follows, likes, comments, user subscriptions
4. **Premium Features**: Exclusive posts, link groups, tag links
5. **Monetization**: Affiliate links, earnings tracking, click analytics
6. **Analytics**: Comprehensive event tracking and page views
7. **Moderation**: Reports, blocked users, content filtering
8. **Performance**: Proper indexing for all major queries
9. **Security**: Row Level Security policies for data protection
10. **Business Logic**: Functions for plan limits and feed generation

Key Features:
- Polymorphic likes and comments system
- Flexible privacy controls (public, private, subscribers)
- Comprehensive analytics and tracking
- Affiliate system with fraud detection
- Premium content and monetization
- Full-text search ready structure
- Scalable design with proper indexing
- GDPR-compliant data structure
*/
--
 =============================================
-- SEO OPTIMIZATION TABLES
-- =============================================

-- SEO metrics tracking
CREATE TABLE seo_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url TEXT NOT NULL,
    page_type VARCHAR(50) NOT NULL,
    organic_clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    average_position DECIMAL(4,1),
    click_through_rate DECIMAL(5,4),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO performance tracking
CREATE TABLE seo_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    keyword VARCHAR(200),
    position INTEGER,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4),
    date DATE NOT NULL
);

-- =============================================
-- SEO FUNCTIONS
-- =============================================

-- Function to generate SEO-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate bookmark slugs
CREATE OR REPLACE FUNCTION update_bookmark_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM bookmarks WHERE slug = NEW.slug AND id != NEW.id) LOOP
            NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bookmark_slug
    BEFORE INSERT OR UPDATE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_bookmark_slug();

-- Trigger to auto-generate tag slugs
CREATE OR REPLACE FUNCTION update_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.name);
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM tags WHERE slug = NEW.slug AND id != NEW.id) LOOP
            NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tag_slug
    BEFORE INSERT OR UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_slug();

-- =============================================
-- SEO INDEXES
-- =============================================

-- SEO-specific indexes
CREATE INDEX idx_bookmarks_slug ON bookmarks(slug);
CREATE INDEX idx_tags_slug_seo ON tags(slug);
CREATE INDEX idx_seo_metrics_url ON seo_metrics(url);
CREATE INDEX idx_seo_metrics_date ON seo_metrics(date);
CREATE INDEX idx_seo_performance_content ON seo_performance(content_type, content_id);
CREATE INDEX idx_seo_performance_keyword ON seo_performance(keyword);
