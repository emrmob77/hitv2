import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
          avatar_url
        )
      `
      )
      .eq('id', id)
      .eq('is_public', true)
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bookmark = await getBookmark(params.id);

  if (!bookmark) {
    return {
      title: 'Bookmark Not Found | HitTags',
    };
  }

  const username = bookmark.profiles?.username;
  return MetadataGenerator.generateBookmarkMetadata(bookmark, username);
}

export default async function BookmarkDetailPage({ params }: Props) {
  const bookmark = await getBookmark(params.id);

  if (!bookmark) {
    notFound();
  }

  // Check if slug matches, redirect if not
  const correctSlug = bookmark.slug || bookmark.id;
  if (params.slug !== correctSlug) {
    redirect(`/bookmarks/${params.id}/${correctSlug}`);
  }

  const structuredData = StructuredDataGenerator.generateBookmarkSchema(bookmark);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Bookmark Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            {bookmark.favicon_url && (
              <img
                src={bookmark.favicon_url}
                alt=""
                className="w-12 h-12 rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{bookmark.title}</h1>
              {bookmark.domain && (
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="nofollow ugc noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {bookmark.domain}
                </a>
              )}
            </div>
          </div>

          {bookmark.description && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
              {bookmark.description}
            </p>
          )}

          {/* Preview Image */}
          {bookmark.image_url && (
            <img
              src={bookmark.image_url}
              alt={bookmark.title}
              className="w-full rounded-lg mb-6"
            />
          )}

          {/* Author Info */}
          {bookmark.profiles && (
            <div className="flex items-center gap-3 mb-6">
              {bookmark.profiles.avatar_url && (
                <img
                  src={bookmark.profiles.avatar_url}
                  alt={bookmark.profiles.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm text-neutral-500">Saved by</p>
                <a
                  href={`/users/${bookmark.profiles.username}`}
                  className="font-medium hover:underline"
                >
                  {bookmark.profiles.display_name || bookmark.profiles.username}
                </a>
              </div>
            </div>
          )}

          {/* Visit Link Button */}
          <a
            href={`/go/${bookmark.id}`}
            target="_blank"
            rel="nofollow ugc noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Visit Link
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-sm">{bookmark.view_count} views</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm">{bookmark.like_count} likes</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm">{bookmark.comment_count} comments</span>
          </div>
        </div>
      </div>
    </>
  );
}