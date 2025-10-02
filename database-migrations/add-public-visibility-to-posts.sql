-- Add 'public' option to exclusive_posts visibility
-- This allows users to share their premium posts publicly

-- Drop existing constraint
ALTER TABLE exclusive_posts
DROP CONSTRAINT IF EXISTS exclusive_posts_visibility_check;

-- Add new constraint with 'public' option
ALTER TABLE exclusive_posts
ADD CONSTRAINT exclusive_posts_visibility_check
CHECK (visibility IN ('public', 'subscribers', 'premium', 'private'));

-- Update existing posts if needed (optional)
-- UPDATE exclusive_posts SET visibility = 'public' WHERE visibility = 'subscribers' AND user_wants_public = true;
