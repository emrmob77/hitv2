import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { APIKeyManager } from '@/lib/api/api-key-manager';

// Get all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await APIKeyManager.listAPIKeys(user.id, supabase);

    // Don't return secret hashes
    const sanitizedKeys = apiKeys.map((key) => ({
      ...key,
      key_secret_hash: undefined,
    }));

    return NextResponse.json({
      api_keys: sanitizedKeys,
      count: apiKeys.length,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// Create a new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      key_name,
      scopes,
      rate_limit_per_hour,
      rate_limit_per_day,
      expires_at,
      description,
      allowed_origins,
      ip_whitelist,
    } = body;

    // Validate required fields
    if (!key_name || !scopes || scopes.length === 0) {
      return NextResponse.json(
        { error: 'key_name and scopes are required' },
        { status: 400 }
      );
    }

    // Create API key
    const result = await APIKeyManager.createAPIKey(
      user.id,
      {
        key_name,
        scopes,
        rate_limit_per_hour,
        rate_limit_per_day,
        expires_at,
        description,
        allowed_origins,
        ip_whitelist,
      },
      supabase
    );

    return NextResponse.json({
      message: 'API key created successfully',
      api_key: result.api_key,
      secret_key: result.secret_key,
      key_data: {
        ...result.key_data,
        key_secret_hash: undefined,
      },
      warning:
        'Store the secret key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// Delete/revoke an API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const apiKeyId = searchParams.get('id');

    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    await APIKeyManager.revokeAPIKey(apiKeyId, user.id, supabase);

    return NextResponse.json({
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
