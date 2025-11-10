import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { elasticsearchService } from '@/lib/search/elasticsearch-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const types = searchParams.get('types')?.split(',') as any[];
    const tags = searchParams.get('tags')?.split(',');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('isPublic');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = (searchParams.get('sort') || 'relevance') as 'relevance' | 'date' | 'popularity';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Check if Elasticsearch is available
    const isHealthy = await elasticsearchService.healthCheck();
    if (!isHealthy) {
      // Fallback to PostgreSQL full-text search
      return await fallbackSearch(query, user?.id);
    }

    // Build filters
    const filters: any = {};

    if (userId) {
      filters.user_id = userId;
    } else if (!user) {
      // Non-authenticated users can only see public content
      filters.is_public = true;
    } else if (isPublic !== null) {
      filters.is_public = isPublic === 'true';
    }

    if (tags) {
      filters.tags = tags;
    }

    if (dateFrom) {
      filters.date_from = dateFrom;
    }

    if (dateTo) {
      filters.date_to = dateTo;
    }

    // Search with Elasticsearch
    const startTime = Date.now();
    const results = await elasticsearchService.search({
      query,
      types,
      filters,
      page,
      limit,
      sort,
    });
    const responseTime = Date.now() - startTime;

    // Record search analytics
    if (user) {
      await supabase.rpc('record_search', {
        p_user_id: user.id,
        p_query: query,
        p_total_results: results.total,
        p_response_time_ms: responseTime,
      });
    }

    return NextResponse.json({
      results: results.documents,
      pagination: {
        total: results.total,
        page: results.page,
        limit: results.limit,
        total_pages: Math.ceil(results.total / results.limit),
      },
      took_ms: results.took_ms,
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Fallback to PostgreSQL full-text search when Elasticsearch is unavailable
 */
async function fallbackSearch(query: string, userId?: string) {
  const supabase = await createSupabaseServerClient();

  // Use PostgreSQL full-text search
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*, profiles!inner(username, avatar_url)')
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,url.ilike.%${query}%`
    )
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return NextResponse.json({
    results: bookmarks || [],
    pagination: {
      total: bookmarks?.length || 0,
      page: 1,
      limit: 20,
      total_pages: 1,
    },
    fallback: true,
    message: 'Using fallback search (Elasticsearch unavailable)',
  });
}
