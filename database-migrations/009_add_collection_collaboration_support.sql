-- Collection followers table to track users who follow public collections
CREATE TABLE IF NOT EXISTS collection_followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_followers_collection_id
    ON collection_followers(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_followers_user_id
    ON collection_followers(user_id);

-- Helper to increment collection view count atomically
CREATE OR REPLACE FUNCTION public.increment_collection_view(p_collection_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE collections
  SET view_count = coalesce(view_count, 0) + 1
  WHERE id = p_collection_id
  RETURNING view_count INTO updated_count;

  RETURN coalesce(updated_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_collection_view(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_collection_view(uuid) TO authenticated;
