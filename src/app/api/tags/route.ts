import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/tags - Get all tags or search tags
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const trending = searchParams.get('trending') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createSupabaseServerClient();

    let queryBuilder = supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (trending) {
      queryBuilder = queryBuilder.eq('is_trending', true);
    }

    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tags: data });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);

    // Check if tag already exists
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingTag) {
      return NextResponse.json({ tag: existingTag });
    }

    // Create new tag
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({
        name,
        slug,
        description: description || null,
        color: color || '#3b82f6',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tag: newTag }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}