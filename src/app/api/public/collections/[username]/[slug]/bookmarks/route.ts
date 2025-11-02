import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/collections/[username]/[slug]/bookmarks - Add bookmark to collection
export async function POST(
  request: Request,
  { params }: { params: { username: string; slug: string } }
) {
  try {
    const { username, slug } = params;
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookmark_id } = body;

    if (!bookmark_id) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    // Get user and collection
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: collection } = await supabase
      .from('collections')
      .select('id, user_id, is_collaborative, bookmark_count')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check permission: owner or collaborative
    if (
      collection.user_id !== currentUser.id &&
      !collection.is_collaborative
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if bookmark exists and is accessible
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id, user_id, is_public')
      .eq('id', bookmark_id)
      .single();

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    // Check if already in collection
    const { data: existing } = await supabase
      .from('collection_bookmarks')
      .select('*')
      .eq('collection_id', collection.id)
      .eq('bookmark_id', bookmark_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bookmark already in collection' },
        { status: 400 }
      );
    }

    // Add to collection
    const { error: insertError } = await supabase
      .from('collection_bookmarks')
      .insert({
        collection_id: collection.id,
        bookmark_id: bookmark_id,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Update bookmark count
    await supabase
      .from('collections')
      .update({ bookmark_count: collection.bookmark_count + 1 })
      .eq('id', collection.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding bookmark to collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[username]/[slug]/bookmarks - Remove bookmark from collection
export async function DELETE(
  request: Request,
  { params }: { params: { username: string; slug: string } }
) {
  try {
    const { username, slug } = params;
    const { searchParams } = new URL(request.url);
    const bookmark_id = searchParams.get('bookmark_id');

    if (!bookmark_id) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and collection
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: collection } = await supabase
      .from('collections')
      .select('id, user_id, is_collaborative, bookmark_count')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (
      collection.user_id !== currentUser.id &&
      !collection.is_collaborative
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Remove from collection
    const { error: deleteError } = await supabase
      .from('collection_bookmarks')
      .delete()
      .eq('collection_id', collection.id)
      .eq('bookmark_id', bookmark_id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Update bookmark count
    await supabase
      .from('collections')
      .update({ bookmark_count: Math.max(0, collection.bookmark_count - 1) })
      .eq('id', collection.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark from collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}