import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // bookmark, collection, tag, user

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const searchPattern = `%${query}%`;
    const results: any[] = [];

    // Get current user for privacy filtering
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Search Bookmarks (if no type or type=bookmark)
    if (!type || type === 'bookmark') {
      const bookmarkQuery = supabase
        .from('bookmarks')
        .select(
          `
          id,
          title,
          description,
          url,
          slug,
          image_url,
          profiles!bookmarks_user_id_fkey (
            username
          )
        `
        )
        .eq('privacy_level', 'public')
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data: bookmarks } = await bookmarkQuery;

      if (bookmarks) {
        results.push(
          ...bookmarks.map((bookmark) => ({
            type: 'bookmark',
            id: bookmark.id,
            title: bookmark.title,
            description: bookmark.description,
            url: bookmark.url,
            imageUrl: bookmark.image_url,
            metadata: {
              username: bookmark.profiles?.username,
              slug: bookmark.slug,
            },
          }))
        );
      }
    }

    // Search Collections (if no type or type=collection)
    if (!type || type === 'collection') {
      const collectionQuery = supabase
        .from('collections')
        .select(
          `
          id,
          name,
          description,
          slug,
          cover_image_url,
          profiles!collections_user_id_fkey (
            username
          )
        `
        )
        .eq('privacy_level', 'public')
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data: collections } = await collectionQuery;

      if (collections) {
        results.push(
          ...collections.map((collection) => ({
            type: 'collection',
            id: collection.id,
            title: collection.name,
            description: collection.description,
            imageUrl: collection.cover_image_url,
            metadata: {
              username: collection.profiles?.username,
              slug: collection.slug,
            },
          }))
        );
      }
    }

    // Search Tags (if no type or type=tag)
    if (!type || type === 'tag') {
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name, slug, description, usage_count')
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (tags) {
        results.push(
          ...tags.map((tag) => ({
            type: 'tag',
            id: tag.id,
            title: `#${tag.name}`,
            description: tag.description,
            metadata: {
              slug: tag.slug,
              count: tag.usage_count,
            },
          }))
        );
      }
    }

    // Search Users (if no type or type=user)
    if (!type || type === 'user') {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url')
        .or(
          `username.ilike.${searchPattern},display_name.ilike.${searchPattern},bio.ilike.${searchPattern}`
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (users) {
        results.push(
          ...users.map((user) => ({
            type: 'user',
            id: user.id,
            title: user.display_name || user.username,
            description: user.bio,
            imageUrl: user.avatar_url,
            metadata: {
              username: user.username,
            },
          }))
        );
      }
    }

    // Sort results by relevance (exact matches first)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      query,
      results: sortedResults.slice(0, limit),
      total: sortedResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
