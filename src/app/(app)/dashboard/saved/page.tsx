import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Saved Bookmarks - HitTags',
  description: 'Your saved bookmarks',
};

// Disable caching for real-time updates
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getSavedBookmarks(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: savedBookmarks, error } = await supabase
    .from('saved_bookmarks')
    .select(
      `
      id,
      created_at,
      bookmarks (
        id,
        title,
        description,
        url,
        domain,
        image_url,
        favicon_url,
        slug,
        created_at,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved bookmarks:', error);
    return [];
  }

  return savedBookmarks || [];
}

export default async function SavedBookmarksPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const savedBookmarks = await getSavedBookmarks(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Saved Bookmarks</h1>
        <p className="mt-2 text-neutral-600">
          Bookmarks you've saved for later
        </p>
      </div>

      {savedBookmarks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bookmark className="h-12 w-12 text-neutral-300" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900">
              No saved bookmarks yet
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Start saving bookmarks to access them quickly later
            </p>
            <Link
              href="/explore"
              className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              Explore Bookmarks
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedBookmarks.map((saved: any) => {
            const bookmark = saved.bookmarks;
            if (!bookmark) return null;

            return (
              <Link
                key={saved.id}
                href={`/bookmark/${bookmark.id}/${bookmark.slug}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-neutral-100">
                      {bookmark.image_url ? (
                        <img
                          src={bookmark.image_url}
                          alt={bookmark.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Bookmark className="h-12 w-12 text-neutral-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        {bookmark.favicon_url && (
                          <img
                            src={bookmark.favicon_url}
                            alt=""
                            className="h-4 w-4"
                          />
                        )}
                        <span className="text-xs text-neutral-500">
                          {bookmark.domain}
                        </span>
                      </div>

                      <h3 className="mb-2 line-clamp-2 font-semibold text-neutral-900 group-hover:text-blue-600">
                        {bookmark.title}
                      </h3>

                      {bookmark.description && (
                        <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
                          {bookmark.description}
                        </p>
                      )}

                      {/* Author */}
                      <div className="flex items-center gap-2">
                        {bookmark.profiles?.avatar_url ? (
                          <img
                            src={bookmark.profiles.avatar_url}
                            alt={bookmark.profiles.username}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300">
                            <span className="text-xs font-semibold text-neutral-600">
                              {(bookmark.profiles?.display_name ||
                                bookmark.profiles?.username ||
                                'U')
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-neutral-600">
                          {bookmark.profiles?.display_name ||
                            bookmark.profiles?.username ||
                            'Unknown'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
