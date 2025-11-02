import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseApiClient } from '@/lib/supabase/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ALLOWED_ROLES = new Set(['owner', 'editor', 'contributor', 'viewer']);
const MANAGE_ROLES = new Set(['owner']);

export async function GET(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { collectionId } = params;

    const { data: collaborators, error } = await supabase
      .from('collection_collaborators')
      .select(
        `
        id,
        role,
        permissions,
        created_at,
        user:profiles!collection_collaborators_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ collaborators: collaborators ?? [] });
  } catch (error) {
    console.error('Error fetching collection collaborators:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const supabase = await createSupabaseApiClient(request);
    const { collectionId } = params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, user_id, name')
      .eq('id', collectionId)
      .maybeSingle();

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    let role: string = collection.user_id === user.id ? 'owner' : '';

    if (!role) {
      const { data: collaborator } = await supabase
        .from('collection_collaborators')
        .select('role')
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
        .maybeSingle();

      role = collaborator?.role ?? '';
    }

    if (!MANAGE_ROLES.has(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await request.json();
    const username = typeof payload?.username === 'string' ? payload.username.trim() : '';
    const requestedRole =
      typeof payload?.role === 'string' ? payload.role.trim().toLowerCase() : 'editor';

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.has(requestedRole)) {
      return NextResponse.json({ error: 'Invalid collaborator role' }, { status: 400 });
    }

    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('username', username)
      .maybeSingle();

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetProfile.id === collection.user_id) {
      return NextResponse.json({ error: 'Collection owner already has full access' }, { status: 400 });
    }

    const { data: existingCollaborator } = await supabase
      .from('collection_collaborators')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('user_id', targetProfile.id)
      .maybeSingle();

    if (existingCollaborator) {
      return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('collection_collaborators')
      .insert({
        collection_id: collectionId,
        user_id: targetProfile.id,
        role: requestedRole,
        invited_by: user.id,
      })
      .select(
        `
        id,
        role,
        permissions,
        created_at,
        user:profiles!collection_collaborators_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .maybeSingle();

    if (insertError || !inserted) {
      return NextResponse.json({ error: insertError?.message ?? 'Failed to add collaborator' }, { status: 500 });
    }

    return NextResponse.json({ success: true, collaborator: inserted });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
