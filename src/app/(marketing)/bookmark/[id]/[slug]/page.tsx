import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BookmarkDetailPreview } from '@/components/bookmarks/bookmark-detail-preview';
import { BookmarkDetailSidebar } from '@/components/bookmarks/bookmark-detail-sidebar';
import { BookmarkComments } from '@/components/bookmarks/bookmark-comments';
import { siteConfig } from '@/config/site';

interface Props {
  params: {
    id: string;
    slug: string;
  };
}

async function getBookmark(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select(
        `
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          bio
        ),
        bookmark_tags (
          tags (
            id,
            name,
            slug
          )
        ),
        collection_bookmarks (
          collections (
            id,
            name,
            slug
          )
        )
      `
      )
      .eq('id', id)
      .eq('privacy_level', 'public')
      .single();

    if (error || !bookmark) {
      return null;
    }

    return bookmark;
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    return null;
  }
}

async function getUserCollections(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, name, slug')
      .eq('user_id', userId)
      .eq('privacy_level', 'public')
      .limit(3);

    if (error || !collections) {
      return [];
    }

    // Get bookmark counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const { count } = await supabase
          .from('collection_bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', collection.id);

        return {
          ...collection,
          bookmarkCount: count || 0,
        };
      })
    );

    return collectionsWithCounts;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bookmark = await getBookmark(id);

  if (!bookmark) {
    return {
      title: 'Bookmark Not Found',
    };
  }

  const username = bookmark.profiles?.username;
  return MetadataGenerator.generateBookmarkMetadata(bookmark, username);
}

export default async function BookmarkDetailPage({ params }: Props) {
  const { id, slug } = await params;
  const bookmark = await getBookmark(id);

  if (!bookmark) {
    notFound();
  }

  // Check if slug matches, redirect if not
  const correctSlug = bookmark.slug || bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (slug !== correctSlug) {
    redirect(`/bookmark/${id}/${correctSlug}`);
  }

  // Extract tags from bookmark_tags relation
  const rawTags = bookmark.bookmark_tags || [];
  const tags = rawTags.map((bt: any) => ({
    name: bt.tags.name,
    slug: bt.tags.slug,
  }));
  const tagIds = rawTags
    .map((bt: any) => bt.tags?.id)
    .filter((id: string | null | undefined): id is string => Boolean(id));

  const structuredData = StructuredDataGenerator.generateBookmarkSchema({
    id: bookmark.id,
    title: bookmark.title,
    description: bookmark.description,
    url: bookmark.url,
    created_at: bookmark.created_at,
    slug: correctSlug,
    tags,
    user: bookmark.profiles
      ? {
          username: bookmark.profiles.username,
          display_name: bookmark.profiles.display_name,
        }
      : undefined,
  });

  // Get user collections
    const ownerCollections = (await getUserCollections(bookmark.user_id)) || [];

  let viewerCollections: Array<{
    id: string;
    name: string;
    slug: string;
    bookmarkCount: number;
  }> = [];
  let viewerMembershipIds: string[] = [];

  // Get current user
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUser = undefined;
  let isLiked = false;
  let isBookmarked = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single();

    if (profile) {
      currentUser = {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
      };

      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('likeable_type', 'bookmark')
        .eq('likeable_id', bookmark.id)
        .single();

      isLiked = !!likeData;

      const { data: savedData } = await supabase
        .from('saved_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('bookmark_id', bookmark.id)
        .single();

      isBookmarked = !!savedData;
    }
  }

  // Get real stats
  const { count: realLikeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('likeable_type', 'bookmark')
    .eq('likeable_id', bookmark.id);

  const { count: realCommentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('commentable_type', 'bookmark')
    .eq('commentable_id', bookmark.id);

  let viewCount = bookmark.view_count ?? 0;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data: updatedBookmark, error: viewUpdateError } = await supabaseAdmin
        .from('bookmarks')
        .update({ view_count: viewCount + 1 })
        .eq('id', bookmark.id)
        .select('view_count')
        .single();

      if (!viewUpdateError && updatedBookmark) {
        viewCount = updatedBookmark.view_count ?? viewCount + 1;
      } else {
        viewCount = viewCount + 1;
      }
    } catch (error) {
      console.error('Error updating view count:', error);
      viewCount = viewCount + 1;
    }
  } else {
    try {
      const { data: incrementedCount, error: viewError } = await supabase.rpc(
        'increment_bookmark_view',
        { p_bookmark_id: bookmark.id }
      );

      if (!viewError && typeof incrementedCount === 'number') {
        viewCount = incrementedCount;
      } else {
        viewCount = viewCount + 1;
      }
    } catch (error) {
      console.error('Error incrementing view count via RPC:', error);
      viewCount = viewCount + 1;
    }
  }

  let saveCount = bookmark.save_count ?? 0;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { count: adminSaveCount, error: adminSaveError } = await supabaseAdmin
        .from('saved_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('bookmark_id', bookmark.id);

      if (!adminSaveError && typeof adminSaveCount === 'number') {
        saveCount = adminSaveCount;
      }
    } catch (error) {
      console.error('Error fetching total save count:', error);
    }
  }

  if (currentUser) {
    try {
      const { data: viewerCollectionData } = await supabase
        .from('collections')
        .select('id, name, slug, bookmark_count')
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (viewerCollectionData) {
        const collectionRows = viewerCollectionData as Array<{
          id: string;
          name: string;
          slug: string;
          bookmark_count: number | null;
        }>;

        viewerCollections = collectionRows.map((collection) => ({
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          bookmarkCount: collection.bookmark_count ?? 0,
        }));

        const collectionIds = collectionRows.map((collection) => collection.id);
        if (collectionIds.length > 0) {
          const { data: membershipRows } = await supabase
            .from('collection_bookmarks')
            .select('collection_id')
            .eq('bookmark_id', bookmark.id)
            .in('collection_id', collectionIds);

          if (membershipRows) {
            const membershipList = membershipRows as Array<{ collection_id: string }>;
            viewerMembershipIds = membershipList.map((row) => row.collection_id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching viewer collections:', error);
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
  const bookmarkPageUrl = `${baseUrl}/bookmark/${bookmark.id}/${correctSlug}`;
  const shareCount = bookmark.click_count ?? 0;

  let relatedBookmarks: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    likes: number;
    saves: number;
  }> = [];

  if (tagIds.length > 0) {
    try {
      const { data: relatedData, error: relatedError } = await supabase
        .from('bookmark_tags')
        .select(
          `
          bookmark_id,
          bookmarks!inner (
            id,
            title,
            slug,
            description,
            image_url,
            like_count,
            save_count,
            privacy_level
          )
        `
        )
        .in('tag_id', tagIds)
        .neq('bookmark_id', bookmark.id)
        .eq('bookmarks.privacy_level', 'public')
        .limit(12);

      if (!relatedError && relatedData) {
        const unique = new Map<string, typeof relatedData[number]>();
        for (const entry of relatedData) {
          const related = entry.bookmarks;
          if (!related || !related.id || related.id === bookmark.id) {
            continue;
          }

          if (!unique.has(related.id)) {
            unique.set(related.id, entry);
          }
        }

        relatedBookmarks = Array.from(unique.values())
          .slice(0, 4)
          .map((entry) => {
            const related = entry.bookmarks!;
            return {
              id: related.id,
              title: related.title,
              slug: related.slug || related.id,
              description: related.description,
              imageUrl: related.image_url,
              likes: related.like_count ?? 0,
              saves: related.save_count ?? 0,
            };
          });
      }
    } catch (error) {
      console.error('Error fetching related bookmarks:', error);
    }
  }

  const sidebarData = {
    stats: {
      views: viewCount || 0,
      likes: realLikeCount || 0,
      saves: saveCount || 0,
      comments: realCommentCount || 0,
      shares: shareCount,
    },
    ownerCollections: ownerCollections,
    ownerUsername: bookmark.profiles?.username || null,
    bookmarkId: bookmark.id,
    currentUserId: currentUser?.id,
    bookmarkTitle: bookmark.title,
    bookmarkDescription: bookmark.description,
    pageUrl: bookmarkPageUrl,
    viewerCollections,
    viewerMembershipIds,
    relatedBookmarks,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-700">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/explore" className="hover:text-neutral-700">
              Explore
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neutral-900">{bookmark.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Bookmark Preview */}
              <BookmarkDetailPreview
                id={bookmark.id}
                title={bookmark.title}
                description={bookmark.description}
                url={bookmark.url}
                domain={bookmark.domain}
                imageUrl={bookmark.image_url}
                createdAt={bookmark.created_at}
                viewCount={viewCount || 0}
                likeCount={realLikeCount || 0}
                author={{
                  username: bookmark.profiles?.username || 'unknown',
                  displayName: bookmark.profiles?.display_name || null,
                  avatarUrl: bookmark.profiles?.avatar_url || null,
                  bio: bookmark.profiles?.bio || null,
                }}
                tags={tags}
                isLiked={isLiked}
                isBookmarked={isBookmarked}
                currentUserId={user?.id}
                authorId={bookmark.user_id}
                saveCount={saveCount || 0}
                shareCount={shareCount}
              />

              {/* Comments */}
              <BookmarkComments
                bookmarkId={bookmark.id}
                bookmarkOwnerId={bookmark.user_id}
                currentUser={currentUser}
              />
            </div>

            {/* Sidebar */}
            <BookmarkDetailSidebar {...sidebarData} />
          </div>
        </div>
      </main>
    </>
  );
}
