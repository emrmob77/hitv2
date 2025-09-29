import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/collections/[username]/[slug] - Get collection by username and slug
export async function GET(
  request: Request,
  { params }: { params: { username: string; slug: string } }
) {
  try {
    const { username, slug } = params;
    const supabase = await createSupabaseServerClient();

    // Get user by username
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check if collection is public
    if (!collection.is_public) {
      // Check if user is the owner
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser || currentUser.id !== collection.user_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get bookmarks in collection
    const { data: collectionBookmarks, error: bookmarksError } = await supabase
      .from('collection_bookmarks')
      .select(
        `
        added_at,
        bookmarks (
          id,
          title,
          description,
          url,
          slug,
          domain,
          favicon_url,
          image_url,
          is_public,
          view_count,
          like_count,
          created_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `
      )
      .eq('collection_id', collection.id)
      .order('added_at', { ascending: false });

    if (bookmarksError) {
      return NextResponse.json(
        { error: bookmarksError.message },
        { status: 500 }
      );
    }

    const bookmarks = collectionBookmarks
      ?.map((cb: any) => cb.bookmarks)
      .filter((b: any) => b && b.is_public);

    return NextResponse.json({
      collection: {
        ...collection,
        user,
      },
      bookmarks,
      total: bookmarks?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/collections/[username]/[slug] - Update collection
export async function PUT(
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

    // Get user and collection
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!user || user.id !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, cover_image_url, is_public, is_collaborative } =
      body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (cover_image_url !== undefined)
      updateData.cover_image_url = cover_image_url;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (is_collaborative !== undefined)
      updateData.is_collaborative = is_collaborative;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedCollection, error } = await supabase
      .from('collections')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ collection: updatedCollection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[username]/[slug] - Delete collection
export async function DELETE(
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

    // Get user
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!user || user.id !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('user_id', user.id)
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}