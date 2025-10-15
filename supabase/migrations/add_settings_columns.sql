-- Add missing columns for settings functionality
-- This migration adds columns for privacy and notification settings

-- Privacy Settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allow_indexing BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT true;

-- Notification Settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_on_follow BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_on_comment BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_on_like BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_on_mention BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_weekly_digest BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_marketing BOOLEAN DEFAULT false;

-- Stripe-related columns (for future payment integration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.show_email IS 'Whether to display email on public profile';
COMMENT ON COLUMN profiles.allow_indexing IS 'Allow search engines to index profile';
COMMENT ON COLUMN profiles.show_activity IS 'Display recent activity on profile';
COMMENT ON COLUMN profiles.email_on_follow IS 'Send email when someone follows';
COMMENT ON COLUMN profiles.email_on_comment IS 'Send email when someone comments';
COMMENT ON COLUMN profiles.email_on_like IS 'Send email when someone likes content';
COMMENT ON COLUMN profiles.email_on_mention IS 'Send email when mentioned';
COMMENT ON COLUMN profiles.email_weekly_digest IS 'Send weekly digest email';
COMMENT ON COLUMN profiles.email_marketing IS 'Send marketing and promotional emails';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status (active, canceled, etc.)';
