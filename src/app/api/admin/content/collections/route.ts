/**
 * Admin Content Collections API
 * GET - List all collections
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all collections with user info
    const { data: collections, error } = await supabase
      .from('collections')
      .select(
        `
        id,
        name,
        description,
        is_public,
        is_featured,
        created_at,
        user_id,
        profiles!inner(email)
      `
      )
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    // Get views and likes counts
    const collectionIds = collections?.map((c) => c.id) || [];

    const { data: views } = await supabase
      .from('collection_views')
      .select('collection_id')
      .in('collection_id', collectionIds);

    const { data: likes } = await supabase
      .from('collection_likes')
      .select('collection_id')
      .in('collection_id', collectionIds);

    // Create count maps
    const viewsMap = (views || []).reduce((acc, v) => {
      acc[v.collection_id] = (acc[v.collection_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const likesMap = (likes || []).reduce((acc, l) => {
      acc[l.collection_id] = (acc[l.collection_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Enrich collections
    const enrichedCollections = collections?.map((collection: any) => ({
      id: collection.id,
      title: collection.name,
      description: collection.description,
      is_public: collection.is_public,
      is_featured: collection.is_featured,
      created_at: collection.created_at,
      user_email: collection.profiles.email,
      views_count: viewsMap[collection.id] || 0,
      likes_count: likesMap[collection.id] || 0,
      type: 'collection' as const,
    }));

    return NextResponse.json({ collections: enrichedCollections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
