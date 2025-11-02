import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseApiClient } from '@/lib/supabase/api';
import type { Database } from '@/lib/supabase/types';

const ALLOWED_ROLES = new Set(['owner', 'editor', 'contributor', 'viewer']);
const MANAGE_ROLES = new Set(['owner']);

async function resolveManagerRole(
  supabase: SupabaseClient<Database>,
  collectionId: string,
  userId: string
): Promise<string | null> {
  const { data: collection } = await supabase
    .from('collections')
    .select('user_id')
    .eq('id', collectionId)
    .maybeSingle();

  if (!collection) {
    return null;
  }

  if (collection.user_id === userId) {
    return 'owner';
  }

  const { data: collaborator } = await supabase
    .from('collection_collaborators')
    .select('role')
    .eq('collection_id', collectionId)
    .eq('user_id', userId)
    .maybeSingle();

  return collaborator?.role ?? null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { collectionId: string; collaboratorId: string } }
) {
  try {
    const supabase = await createSupabaseApiClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const managerRole = await resolveManagerRole(supabase, params.collectionId, user.id);

    if (!managerRole || !MANAGE_ROLES.has(managerRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await request.json();
    const requestedRole =
      typeof payload?.role === 'string' ? payload.role.trim().toLowerCase() : '';

    if (!ALLOWED_ROLES.has(requestedRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('collection_collaborators')
      .update({ role: requestedRole })
      .eq('collection_id', params.collectionId)
      .eq('id', params.collaboratorId)
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

    if (error || !updated) {
      return NextResponse.json({ error: error?.message ?? 'Failed to update collaborator' }, { status: 500 });
    }

    return NextResponse.json({ success: true, collaborator: updated });
  } catch (error) {
    console.error('Error updating collaborator:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { collectionId: string; collaboratorId: string } }
) {
  try {
    const supabase = await createSupabaseApiClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const managerRole = await resolveManagerRole(supabase, params.collectionId, user.id);

    if (!managerRole || !MANAGE_ROLES.has(managerRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: collaborator } = await supabase
      .from('collection_collaborators')
      .select('user_id')
      .eq('collection_id', params.collectionId)
      .eq('id', params.collaboratorId)
      .maybeSingle();

    if (!collaborator) {
      return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('collection_collaborators')
      .delete()
      .eq('collection_id', params.collectionId)
      .eq('id', params.collaboratorId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
