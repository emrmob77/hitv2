import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { MetadataGenerator } from '@/lib/seo/metadata';

// GET /api/collections - Get all public collections
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('collections')
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

    if (username) {
      // First get user ID from username
      const { data: user } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (user) {
        query = query.eq('user_id', user.id);
      }
    }

    const { data: collections, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      collections,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create a new collection
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
      name,
      description,
      cover_image_url,
      is_public,
      is_collaborative,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = MetadataGenerator.generateSlug(name);

    // Check if slug exists for this user
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('slug')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single();

    if (existingCollection) {
      // Append random suffix if slug exists
      slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
    }

    // Create collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name,
        slug,
        description: description || null,
        cover_image_url: cover_image_url || null,
        is_public: is_public !== undefined ? is_public : true,
        is_collaborative: is_collaborative || false,
      })
      .select()
      .single();

    if (collectionError) {
      return NextResponse.json(
        { error: collectionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}