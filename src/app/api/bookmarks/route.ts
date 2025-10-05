import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { MetadataGenerator } from '@/lib/seo/metadata';

// Helper to extract domain from URL
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

// GET /api/bookmarks - Get all bookmarks with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const tagSlug = searchParams.get('tag');

    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('bookmarks')
      .select(
        `
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: bookmarks, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      bookmarks,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Create a new bookmark
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      url,
      title,
      description,
      favicon_url,
      image_url,
      is_public,
      privacy_level,
      tags,
    } = body;

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = MetadataGenerator.generateSlug(title);

    // Extract domain
    const domain = extractDomain(url);

    // Create bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        url,
        title,
        description: description || null,
        slug,
        domain,
        favicon_url: favicon_url || null,
        image_url: image_url || null,
        is_public: is_public !== undefined ? is_public : true,
        privacy_level: privacy_level || 'public',
      })
      .select()
      .single();

    if (bookmarkError) {
      return NextResponse.json(
        { error: bookmarkError.message },
        { status: 500 }
      );
    }

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagPromises = tags.map(async (tagName: string) => {
        const tagSlug = MetadataGenerator.generateSlug(tagName);

        // Check if tag exists
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', tagSlug)
          .single();

        let tagId: string;

        if (existingTag) {
          tagId = existingTag.id;
          // Increment usage count
          await supabase
            .from('tags')
            .update({ usage_count: supabase.rpc('increment', { x: 1 }) })
            .eq('id', tagId);
        } else {
          // Create new tag
          const { data: newTag } = await supabase
            .from('tags')
            .insert({
              name: tagName,
              slug: tagSlug,
              usage_count: 1,
            })
            .select('id')
            .single();

          tagId = newTag!.id;
        }

        // Create bookmark-tag relationship
        return supabase
          .from('bookmark_tags')
          .insert({
            bookmark_id: bookmark.id,
            tag_id: tagId,
          });
      });

      await Promise.all(tagPromises);
    }

    // Create activity for bookmark creation
    if (is_public || privacy_level === 'public') {
      await supabase.from('activities').insert({
        user_id: user.id,
        action: 'create',
        object_type: 'bookmark',
        object_id: bookmark.id,
      });
    }

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}