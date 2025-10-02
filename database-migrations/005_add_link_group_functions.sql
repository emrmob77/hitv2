-- Function to increment link group click count
CREATE OR REPLACE FUNCTION increment_link_group_clicks(group_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE link_groups
    SET click_count = click_count + 1
    WHERE id = group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_link_group_clicks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_link_group_clicks(UUID) TO anon;
