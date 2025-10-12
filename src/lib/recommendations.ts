import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RelatedBookmark {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  author: {
    username: string;
    displayName: string | null;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

/**
 * Get related bookmarks based on shared tags
 * @param bookmarkId - Current bookmark ID to exclude from results
 * @param tags - Array of tag slugs to match
 * @param limit - Number of results to return (default: 6)
 */
export async function getRelatedBookmarksByTags(
  bookmarkId: string,
  tags: string[],
  limit: number = 6
): Promise<RelatedBookmark[]> {
  try {
    if (tags.length === 0) {
      return [];
    }

    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    // Get bookmarks that share tags with the current bookmark
    const { data: relatedBookmarks, error } = await supabase
      .from('bookmarks')
      .select(
        `
        id,
        title,
        slug,
        description,
        image_url,
        created_at,
        like_count,
        profiles!bookmarks_user_id_fkey (
          username,
          display_name
        ),
        bookmark_tags (
          tags (
            name,
            slug
          )
        )
      `
      )
      .eq('privacy_level', 'public')
      .neq('id', bookmarkId)
      .order('like_count', { ascending: false })
      .limit(limit * 3); // Get more to filter by tag relevance

    if (error || !relatedBookmarks) {
      return [];
    }

    // Score bookmarks by number of shared tags
    const scoredBookmarks = relatedBookmarks
      .map((bookmark) => {
        const bookmarkTags =
          bookmark.bookmark_tags
            ?.map((bt: any) => bt.tags?.slug)
            .filter(Boolean) || [];

        const sharedTags = bookmarkTags.filter((tag: string) =>
          tags.includes(tag)
        );

        return {
          bookmark,
          score: sharedTags.length,
          bookmarkTags: bookmarkTags,
        };
      })
      .filter((item) => item.score > 0) // Only include bookmarks with at least 1 shared tag
      .sort((a, b) => {
        // Sort by score first, then by like count
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return (b.bookmark.like_count || 0) - (a.bookmark.like_count || 0);
      })
      .slice(0, limit);

    // Transform to RelatedBookmark format
    return scoredBookmarks.map(({ bookmark }) => ({
      id: bookmark.id,
      title: bookmark.title,
      slug: bookmark.slug || bookmark.id,
      description: bookmark.description,
      imageUrl: bookmark.image_url,
      author: {
        username: bookmark.profiles?.username || 'unknown',
        displayName: bookmark.profiles?.display_name || null,
      },
      tags:
        bookmark.bookmark_tags
          ?.map((bt: any) => bt.tags)
          .filter(Boolean)
          .map((tag: any) => ({
            name: tag.name,
            slug: tag.slug,
          })) || [],
    }));
  } catch (error) {
    console.error('Error fetching related bookmarks:', error);
    return [];
  }
}

/**
 * Get related collections based on shared tags or creator
 * @param collectionId - Current collection ID to exclude
 * @param userId - Creator user ID
 * @param tags - Array of tag slugs from bookmarks in the collection
 * @param limit - Number of results to return (default: 4)
 */
export async function getRelatedCollections(
  collectionId: string,
  userId: string,
  tags: string[],
  limit: number = 4
): Promise<any[]> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    // Get collections from the same creator
    const { data: sameCreatorCollections } = await supabase
      .from('collections')
      .select(
        `
        id,
        name,
        slug,
        description,
        cover_image_url,
        profiles!collections_user_id_fkey (
          username,
          display_name
        )
      `
      )
      .eq('user_id', userId)
      .eq('privacy_level', 'public')
      .neq('id', collectionId)
      .limit(limit);

    if (!sameCreatorCollections || sameCreatorCollections.length === 0) {
      // If no collections from same creator, get popular collections
      const { data: popularCollections } = await supabase
        .from('collections')
        .select(
          `
          id,
          name,
          slug,
          description,
          cover_image_url,
          view_count,
          profiles!collections_user_id_fkey (
            username,
            display_name
          )
        `
        )
        .eq('privacy_level', 'public')
        .neq('id', collectionId)
        .order('view_count', { ascending: false })
        .limit(limit);

      return popularCollections || [];
    }

    return sameCreatorCollections;
  } catch (error) {
    console.error('Error fetching related collections:', error);
    return [];
  }
}

/**
 * Get personalized recommendations for a user based on their interests
 * @param userId - User ID to get recommendations for
 * @param limit - Number of results to return (default: 10)
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<RelatedBookmark[]> {
  try {
    const supabase = await createSupabaseServerClient({ strict: false });

    if (!supabase) {
      return [];
    }

    // Get user's liked and saved bookmarks to understand interests
    const [{ data: likedBookmarks }, { data: savedBookmarks }] = await Promise.all([
      supabase
        .from('likes')
        .select('likeable_id')
        .eq('user_id', userId)
        .eq('likeable_type', 'bookmark')
        .limit(50),
      supabase
        .from('saved_bookmarks')
        .select('bookmark_id')
        .eq('user_id', userId)
        .limit(50),
    ]);

    const interactedIds = new Set([
      ...(likedBookmarks?.map((l) => l.likeable_id) || []),
      ...(savedBookmarks?.map((s) => s.bookmark_id) || []),
    ]);

    if (interactedIds.size === 0) {
      // If no interactions, return trending bookmarks
      const { data: trending } = await supabase
        .from('bookmarks')
        .select(
          `
          id,
          title,
          slug,
          description,
          image_url,
          like_count,
          profiles!bookmarks_user_id_fkey (
            username,
            display_name
          ),
          bookmark_tags (
            tags (
              name,
              slug
            )
          )
        `
        )
        .eq('privacy_level', 'public')
        .order('like_count', { ascending: false })
        .limit(limit);

      return formatBookmarks(trending || []);
    }

    // Get tags from user's interacted bookmarks
    const { data: userTags } = await supabase
      .from('bookmark_tags')
      .select('tags(slug)')
      .in('bookmark_id', Array.from(interactedIds));

    const tagSlugs = userTags
      ?.map((bt: any) => bt.tags?.slug)
      .filter(Boolean) || [];

    if (tagSlugs.length === 0) {
      return [];
    }

    // Get bookmarks with similar tags that user hasn't interacted with
    const { data: recommended } = await supabase
      .from('bookmarks')
      .select(
        `
        id,
        title,
        slug,
        description,
        image_url,
        like_count,
        profiles!bookmarks_user_id_fkey (
          username,
          display_name
        ),
        bookmark_tags (
          tags (
            name,
            slug
          )
        )
      `
      )
      .eq('privacy_level', 'public')
      .not('id', 'in', `(${Array.from(interactedIds).join(',')})`)
      .order('like_count', { ascending: false })
      .limit(limit * 2);

    if (!recommended) {
      return [];
    }

    // Score by tag relevance
    const scored = recommended
      .map((bookmark) => {
        const bookmarkTagSlugs =
          bookmark.bookmark_tags
            ?.map((bt: any) => bt.tags?.slug)
            .filter(Boolean) || [];

        const matchCount = bookmarkTagSlugs.filter((slug: string) =>
          tagSlugs.includes(slug)
        ).length;

        return { bookmark, score: matchCount };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return formatBookmarks(scored.map((s) => s.bookmark));
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }
}

function formatBookmarks(bookmarks: any[]): RelatedBookmark[] {
  return bookmarks.map((bookmark) => ({
    id: bookmark.id,
    title: bookmark.title,
    slug: bookmark.slug || bookmark.id,
    description: bookmark.description,
    imageUrl: bookmark.image_url,
    author: {
      username: bookmark.profiles?.username || 'unknown',
      displayName: bookmark.profiles?.display_name || null,
    },
    tags:
      bookmark.bookmark_tags
        ?.map((bt: any) => bt.tags)
        .filter(Boolean)
        .map((tag: any) => ({
          name: tag.name,
          slug: tag.slug,
        })) || [],
  }));
}
