-- Migration: Add bookmark_id to affiliate_links table
-- Date: 2025-10-03
-- Description: Links affiliate_links with bookmarks table

-- 1. Add bookmark_id column (nullable at first for existing records)
ALTER TABLE affiliate_links
ADD COLUMN IF NOT EXISTS bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_links_bookmark_id ON affiliate_links(bookmark_id);

-- 3. Rename click_count to total_clicks for consistency with code
ALTER TABLE affiliate_links
RENAME COLUMN click_count TO total_clicks;

-- 4. Update trigger function to use new column name
CREATE OR REPLACE FUNCTION update_affiliate_clicks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliate_links
    SET total_clicks = (
        SELECT COUNT(*)
        FROM affiliate_clicks
        WHERE affiliate_link_id = NEW.affiliate_link_id
    )
    WHERE id = NEW.affiliate_link_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Make short_code nullable (generated automatically if not provided)
ALTER TABLE affiliate_links
ALTER COLUMN short_code DROP NOT NULL;

-- 6. Add function to generate short_code if not provided
CREATE OR REPLACE FUNCTION generate_affiliate_short_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
        NEW.short_code := substring(md5(random()::text), 1, 8);

        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM affiliate_links WHERE short_code = NEW.short_code AND id != NEW.id) LOOP
            NEW.short_code := substring(md5(random()::text), 1, 8);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto-generating short_code
DROP TRIGGER IF EXISTS trigger_generate_affiliate_short_code ON affiliate_links;
CREATE TRIGGER trigger_generate_affiliate_short_code
    BEFORE INSERT OR UPDATE ON affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION generate_affiliate_short_code();
