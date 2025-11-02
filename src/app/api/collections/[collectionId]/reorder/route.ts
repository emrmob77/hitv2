import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseApiClient } from '@/lib/supabase/api';

const MANAGE_ROLES = new Set(['owner', 'editor']);

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { collectionId } = params;
    const supabase = await createSupabaseApiClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, user_id, is_collaborative')
      .eq('id', collectionId)
      .maybeSingle();

    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    let role: string | null = collection.user_id === user.id ? 'owner' : null;

    if (!role) {
      const { data: collaborator } = await supabase
        .from('collection_collaborators')
        .select('role')
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
        .maybeSingle();

      role = collaborator?.role ?? null;
    }

    if (!role || !MANAGE_ROLES.has(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results = await Promise.all(
      items.map((item: { id: string; position: number }) =>
        supabase
          .from('collection_bookmarks')
          .update({ position: item.position })
          .eq('id', item.id)
          .eq('collection_id', collectionId)
      )
    );

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Collection reorder error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder collection' },
      { status: 500 }
    );
  }
}
