import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { APIKeyManager } from '@/lib/api/api-key-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeyId = params.id;

    // Verify ownership
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('id, key_name')
      .eq('id', apiKeyId)
      .eq('user_id', user.id)
      .single();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    // Get usage stats
    const stats = await APIKeyManager.getUsageStats(apiKeyId, supabase);

    // Get recent requests
    const { data: recentRequests } = await supabase
      .from('api_usage')
      .select('*')
      .eq('api_key_id', apiKeyId)
      .order('created_at', { ascending: false })
      .limit(100);

    return NextResponse.json({
      api_key_id: apiKeyId,
      key_name: apiKey.key_name,
      stats,
      recent_requests: recentRequests || [],
    });
  } catch (error) {
    console.error('Error fetching API key stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API key stats' },
      { status: 500 }
    );
  }
}
