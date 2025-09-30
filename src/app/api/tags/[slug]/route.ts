import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/tags/[slug] - Get tag by slug with bookmarks
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createSupabaseServerClient();

    // Get tag
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (tagError || !tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Get bookmarks with this tag
    const { data: bookmarkTags, error: bookmarksError } = await supabase
      .from('bookmark_tags')
      .select(
        `
        bookmark_id,
        bookmarks (
          id,
          title,
          description,
          url,
          slug,
          domain,
          favicon_url,
          image_url,
          privacy_level,
          created_at,
          user_id,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          ),
          bookmark_tags (
            tags (
              name,
              slug
            )
          )
        )
      `
      )
      .eq('tag_id', tag.id)
      .range(offset, offset + limit - 1);

    if (bookmarksError) {
      return NextResponse.json(
        { error: bookmarksError.message },
        { status: 500 }
      );
    }

    // Extract bookmarks from junction table
    const bookmarks = bookmarkTags
      ?.map((bt: any) => bt.bookmarks)
      .filter((b: any) => b && b.privacy_level === 'public');

    return NextResponse.json({
      tag,
      bookmarks,
      total: bookmarks?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[slug] - Update tag
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const supabase = await createSupabaseServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;

    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tag: updatedTag });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[slug] - Delete tag
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const supabase = await createSupabaseServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('tags').delete().eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}