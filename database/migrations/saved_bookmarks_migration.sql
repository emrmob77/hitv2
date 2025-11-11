-- Create saved_bookmarks table
CREATE TABLE IF NOT EXISTS saved_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bookmark_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_bookmarks_user_id ON saved_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_bookmarks_bookmark_id ON saved_bookmarks(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_saved_bookmarks_created_at ON saved_bookmarks(created_at DESC);

-- Enable RLS
ALTER TABLE saved_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved bookmarks"
  ON saved_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save bookmarks"
  ON saved_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their bookmarks"
  ON saved_bookmarks FOR DELETE
  USING (auth.uid() = user_id);
