-- Task 26: Developer API & Tools
-- Migration to add API keys, webhooks, and developer tools

-- API Keys for third-party developers
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  key_secret_hash TEXT NOT NULL, -- Hashed secret key

  -- Permissions
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read:bookmarks', 'read:collections'],
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 1000,
  rate_limit_per_day INTEGER NOT NULL DEFAULT 10000,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  description TEXT,
  allowed_origins TEXT[], -- CORS origins
  ip_whitelist TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_api_key ON api_keys(api_key) WHERE is_active = true;
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at);

-- API Usage Analytics
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,

  -- Request details
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,

  -- Usage tracking
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_usage_api_key_id ON api_usage(api_key_id, created_at DESC);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);

-- Webhook Subscriptions
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,

  -- Webhook details
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- e.g., ['bookmark.created', 'collection.updated']
  secret_key VARCHAR(255) NOT NULL, -- For signature verification

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  description TEXT,
  headers JSONB, -- Custom headers to include

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_subscriptions_user_id ON webhook_subscriptions(user_id);
CREATE INDEX idx_webhook_subscriptions_active ON webhook_subscriptions(is_active);

-- Webhook Delivery Log
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,

  -- Delivery status
  status VARCHAR(50) NOT NULL, -- 'pending', 'sent', 'failed', 'retrying'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Response details
  http_status INTEGER,
  response_body TEXT,
  error_message TEXT,

  -- Timing
  sent_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_subscription_id ON webhook_deliveries(webhook_subscription_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, next_retry_at);

-- Zapier Integration
CREATE TABLE IF NOT EXISTS zapier_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Zapier details
  zap_id VARCHAR(255),
  trigger_type VARCHAR(100) NOT NULL, -- 'new_bookmark', 'new_collection', etc.
  action_type VARCHAR(100), -- 'create_bookmark', 'add_tag', etc.

  -- Configuration
  config JSONB NOT NULL,
  filters JSONB,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_zapier_integrations_user_id ON zapier_integrations(user_id);
CREATE INDEX idx_zapier_integrations_active ON zapier_integrations(is_active);

-- OAuth Applications (for third-party integrations)
CREATE TABLE IF NOT EXISTS oauth_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Application details
  app_name VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL UNIQUE,
  client_secret_hash TEXT NOT NULL,

  -- OAuth configuration
  redirect_uris TEXT[] NOT NULL,
  scopes TEXT[] NOT NULL,
  grant_types TEXT[] DEFAULT ARRAY['authorization_code', 'refresh_token'],

  -- Application metadata
  description TEXT,
  homepage_url TEXT,
  logo_url TEXT,
  privacy_policy_url TEXT,
  terms_of_service_url TEXT,

  -- Status
  is_public BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_oauth_applications_user_id ON oauth_applications(user_id);
CREATE INDEX idx_oauth_applications_client_id ON oauth_applications(client_id) WHERE is_active = true;

-- OAuth Tokens
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,

  -- Token details
  access_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255) UNIQUE,
  token_type VARCHAR(50) DEFAULT 'Bearer',

  -- Scopes and expiration
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  refresh_expires_at TIMESTAMP WITH TIME ZONE,

  -- Status
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_application_id ON oauth_tokens(application_id);
CREATE INDEX idx_oauth_tokens_access_token ON oauth_tokens(access_token) WHERE is_revoked = false;

-- Functions

-- Generate API Key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
  key_prefix TEXT := 'hv2_'; -- hitv2 prefix
  random_part TEXT;
BEGIN
  random_part := encode(gen_random_bytes(32), 'hex');
  RETURN key_prefix || random_part;
END;
$$ LANGUAGE plpgsql;

-- Record API Usage
CREATE OR REPLACE FUNCTION record_api_usage(
  p_api_key_id UUID,
  p_endpoint VARCHAR,
  p_method VARCHAR,
  p_status_code INTEGER,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  usage_id UUID;
BEGIN
  INSERT INTO api_usage (
    api_key_id,
    endpoint,
    method,
    status_code,
    response_time_ms,
    ip_address
  ) VALUES (
    p_api_key_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_time_ms,
    p_ip_address
  ) RETURNING id INTO usage_id;

  -- Update last_used_at on API key
  UPDATE api_keys
  SET last_used_at = NOW()
  WHERE id = p_api_key_id;

  RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

-- Check API Rate Limit
CREATE OR REPLACE FUNCTION check_api_rate_limit(
  p_api_key_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  hourly_count INTEGER;
  daily_count INTEGER;
  hourly_limit INTEGER;
  daily_limit INTEGER;
BEGIN
  -- Get rate limits
  SELECT rate_limit_per_hour, rate_limit_per_day
  INTO hourly_limit, daily_limit
  FROM api_keys
  WHERE id = p_api_key_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Count requests in last hour
  SELECT COUNT(*)
  INTO hourly_count
  FROM api_usage
  WHERE api_key_id = p_api_key_id
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Count requests in last day
  SELECT COUNT(*)
  INTO daily_count
  FROM api_usage
  WHERE api_key_id = p_api_key_id
    AND created_at > NOW() - INTERVAL '1 day';

  RETURN hourly_count < hourly_limit AND daily_count < daily_limit;
END;
$$ LANGUAGE plpgsql;

-- Queue Webhook Delivery
CREATE OR REPLACE FUNCTION queue_webhook_delivery(
  p_subscription_id UUID,
  p_event_type VARCHAR,
  p_event_data JSONB
)
RETURNS UUID AS $$
DECLARE
  delivery_id UUID;
BEGIN
  INSERT INTO webhook_deliveries (
    webhook_subscription_id,
    event_type,
    event_data,
    status,
    next_retry_at
  ) VALUES (
    p_subscription_id,
    p_event_type,
    p_event_data,
    'pending',
    NOW()
  ) RETURNING id INTO delivery_id;

  RETURN delivery_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger webhooks on bookmark events
CREATE OR REPLACE FUNCTION trigger_bookmark_webhooks()
RETURNS TRIGGER AS $$
DECLARE
  subscription RECORD;
  event_type TEXT;
  event_data JSONB;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'bookmark.created';
    event_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    event_type := 'bookmark.updated';
    event_data := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    event_type := 'bookmark.deleted';
    event_data := to_jsonb(OLD);
  END IF;

  -- Queue webhooks for subscriptions
  FOR subscription IN
    SELECT id
    FROM webhook_subscriptions
    WHERE is_active = true
      AND event_type = ANY(events)
      AND user_id = COALESCE(NEW.user_id, OLD.user_id)
  LOOP
    PERFORM queue_webhook_delivery(
      subscription.id,
      event_type,
      event_data
    );
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for webhook events
DROP TRIGGER IF EXISTS trigger_bookmark_webhooks_insert ON bookmarks;
CREATE TRIGGER trigger_bookmark_webhooks_insert
  AFTER INSERT ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_bookmark_webhooks();

DROP TRIGGER IF EXISTS trigger_bookmark_webhooks_update ON bookmarks;
CREATE TRIGGER trigger_bookmark_webhooks_update
  AFTER UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_bookmark_webhooks();

DROP TRIGGER IF EXISTS trigger_bookmark_webhooks_delete ON bookmarks;
CREATE TRIGGER trigger_bookmark_webhooks_delete
  AFTER DELETE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_bookmark_webhooks();

-- Comments
COMMENT ON TABLE api_keys IS 'API keys for third-party developer access';
COMMENT ON TABLE api_usage IS 'Analytics for API usage and rate limiting';
COMMENT ON TABLE webhook_subscriptions IS 'Webhook subscriptions for real-time event notifications';
COMMENT ON TABLE webhook_deliveries IS 'Log of webhook delivery attempts';
COMMENT ON TABLE zapier_integrations IS 'Zapier integration configurations';
COMMENT ON TABLE oauth_applications IS 'OAuth applications for third-party integrations';
COMMENT ON TABLE oauth_tokens IS 'OAuth access and refresh tokens';
