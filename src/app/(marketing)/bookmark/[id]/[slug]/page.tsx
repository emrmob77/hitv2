import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BookmarkDetailPreview } from '@/components/bookmarks/bookmark-detail-preview';
import { BookmarkDetailSidebar } from '@/components/bookmarks/bookmark-detail-sidebar';
import { BookmarkComments } from '@/components/bookmarks/bookmark-comments';

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

  const structuredData = StructuredDataGenerator.generateBookmarkSchema(bookmark);

  // Extract tags from bookmark_tags relation
  const tags = bookmark.bookmark_tags?.map((bt: any) => ({
    name: bt.tags.name,
    slug: bt.tags.slug,
  })) || [];

  // Get user collections
  const userCollections = await getUserCollections(bookmark.user_id);

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

  const { count: saveCount } = await supabase
    .from('saved_bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('bookmark_id', bookmark.id);

  const sidebarData = {
    stats: {
      views: bookmark.view_count || 0,
      likes: realLikeCount || 0,
      saves: saveCount || 0,
      comments: realCommentCount || 0,
      shares: 0, // Not tracked yet
    },
    collections: userCollections,
    relatedBookmarks: [], // TODO: Implement related bookmarks based on tags
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
                viewCount={bookmark.view_count || 0}
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
