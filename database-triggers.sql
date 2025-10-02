-- =============================================
-- AFFILIATE EARNINGS TRIGGERS
-- =============================================

-- Function to update affiliate link earnings when a new earning record is created
CREATE OR REPLACE FUNCTION update_affiliate_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_earnings in affiliate_links
    UPDATE affiliate_links
    SET total_earnings = (
        SELECT COALESCE(SUM(amount), 0)
        FROM earnings
        WHERE affiliate_link_id = NEW.affiliate_link_id
        AND status IN ('confirmed', 'paid')
    )
    WHERE id = NEW.affiliate_link_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on earnings INSERT
CREATE TRIGGER update_affiliate_earnings_on_insert
AFTER INSERT ON earnings
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_earnings();

-- Trigger on earnings UPDATE (status changes)
CREATE TRIGGER update_affiliate_earnings_on_update
AFTER UPDATE ON earnings
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_affiliate_earnings();

-- Trigger on earnings DELETE
CREATE TRIGGER update_affiliate_earnings_on_delete
AFTER DELETE ON earnings
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_earnings();

-- Function to create earnings record when affiliate click converts
CREATE OR REPLACE FUNCTION create_earnings_on_conversion()
RETURNS TRIGGER AS $$
DECLARE
    v_affiliate_link affiliate_links%ROWTYPE;
    v_earning_amount DECIMAL(10,2);
BEGIN
    -- Only process if converted changed from FALSE to TRUE
    IF NEW.converted = TRUE AND (OLD.converted IS NULL OR OLD.converted = FALSE) THEN
        -- Get affiliate link details
        SELECT * INTO v_affiliate_link
        FROM affiliate_links
        WHERE id = NEW.affiliate_link_id;

        -- Calculate earning amount (commission_rate % of conversion_value)
        IF NEW.conversion_value IS NOT NULL AND NEW.conversion_value > 0 THEN
            v_earning_amount := (NEW.conversion_value * v_affiliate_link.commission_rate / 100);

            -- Create earnings record
            INSERT INTO earnings (
                user_id,
                affiliate_link_id,
                amount,
                source,
                status
            ) VALUES (
                v_affiliate_link.user_id,
                NEW.affiliate_link_id,
                v_earning_amount,
                'affiliate_conversion',
                'confirmed'
            );

            -- Update conversion_count in affiliate_links
            UPDATE affiliate_links
            SET conversion_count = conversion_count + 1
            WHERE id = NEW.affiliate_link_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on affiliate_clicks conversion
CREATE TRIGGER create_earnings_on_conversion_trigger
AFTER UPDATE ON affiliate_clicks
FOR EACH ROW
EXECUTE FUNCTION create_earnings_on_conversion();

-- Function to update total_clicks when affiliate_clicks is inserted
CREATE OR REPLACE FUNCTION update_affiliate_clicks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliate_links
    SET click_count = (
        SELECT COUNT(*)
        FROM affiliate_clicks
        WHERE affiliate_link_id = NEW.affiliate_link_id
    )
    WHERE id = NEW.affiliate_link_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update click count
CREATE TRIGGER update_clicks_count_on_insert
AFTER INSERT ON affiliate_clicks
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_clicks_count();
