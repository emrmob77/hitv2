-- Add slug field to exclusive_posts for SEO-friendly URLs
-- Format: /posts/[username]/[slug] veya /p/[username]/[slug]

ALTER TABLE exclusive_posts
ADD COLUMN slug VARCHAR(200);

-- Create index for faster lookups
CREATE INDEX idx_exclusive_posts_slug ON exclusive_posts(slug);

-- Create unique constraint for user_id + slug combination
CREATE UNIQUE INDEX idx_exclusive_posts_user_slug ON exclusive_posts(user_id, slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_post_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug from title
    base_slug := regexp_replace(lower(NEW.title), '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    base_slug := substring(base_slug, 1, 200);

    -- If slug is provided, use it
    IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
        RETURN NEW;
    END IF;

    -- Check if slug exists for this user
    new_slug := base_slug;
    WHILE EXISTS (
        SELECT 1 FROM exclusive_posts
        WHERE user_id = NEW.user_id
        AND slug = new_slug
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := new_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS trg_generate_post_slug ON exclusive_posts;
CREATE TRIGGER trg_generate_post_slug
    BEFORE INSERT OR UPDATE OF title ON exclusive_posts
    FOR EACH ROW
    EXECUTE FUNCTION generate_post_slug();

-- Backfill slugs for existing posts (run once)
UPDATE exclusive_posts SET slug = NULL WHERE slug IS NULL;
