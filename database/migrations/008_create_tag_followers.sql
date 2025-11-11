-- Create table to track users following tags
CREATE TABLE IF NOT EXISTS tag_followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tag_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tag_followers_tag_id ON tag_followers(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_followers_user_id ON tag_followers(user_id);
