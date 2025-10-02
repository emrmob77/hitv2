import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createSupabaseServerClient();

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

    // Verify ownership
    const { data: group } = await supabase
      .from('link_groups')
      .select('user_id')
      .eq('id', groupId)
      .single();

    if (!group || group.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update positions in batch
    const updates = items.map((item) =>
      supabase
        .from('link_group_items')
        .update({ position: item.position })
        .eq('id', item.id)
        .eq('link_group_id', groupId)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder items' },
      { status: 500 }
    );
  }
}
