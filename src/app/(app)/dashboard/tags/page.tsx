import { Metadata } from 'next';
import Link from 'next/link';
import { Hash, TrendingUp } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Tags',
};

export const dynamic = 'force-dynamic';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  usage_count: number;
  is_trending: boolean;
  created_at: string;
}

async function getUserTags(): Promise<Tag[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Get all tags used in user's bookmarks
    const { data: bookmarkTags, error } = await supabase
      .from('bookmark_tags')
      .select(
        `
        tags (
          id,
          name,
          slug,
          description,
          color,
          usage_count,
          is_trending,
          created_at
        ),
        bookmarks!inner (
          user_id
        )
      `
      )
      .eq('bookmarks.user_id', user.id);

    if (error || !bookmarkTags) {
      return [];
    }

    // Extract unique tags and count usage
    const tagMap = new Map<string, Tag & { userUsageCount: number }>();

    bookmarkTags.forEach((bt: any) => {
      if (bt.tags) {
        const tag = bt.tags;
        if (tagMap.has(tag.id)) {
          const existing = tagMap.get(tag.id)!;
          existing.userUsageCount += 1;
        } else {
          tagMap.set(tag.id, {
            ...tag,
            userUsageCount: 1,
          });
        }
      }
    });

    // Sort by user usage count
    return Array.from(tagMap.values()).sort(
      (a, b) => b.userUsageCount - a.userUsageCount
    );
  } catch (error) {
    console.error('Error fetching user tags:', error);
    return [];
  }
}

export default async function TagsPage() {
  const tags = await getUserTags();

  return (
    <div className="space-y-8">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-neutral-900">Your Tags</h1>
          <p className="text-sm text-neutral-600">
            Manage and organize your bookmark tags
          </p>
        </div>
        <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
          <Link href="/dashboard/bookmarks">View Bookmarks</Link>
        </Button>
      </header>

      <div className="mx-auto w-full max-w-5xl">
        {tags.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <Hash className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              No tags yet
            </h3>
            <p className="mb-6 text-sm text-neutral-600">
              Start adding tags to your bookmarks to organize them better
            </p>
            <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
              <Link href="/dashboard/bookmarks/new">Add Your First Bookmark</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="divide-y divide-neutral-200">
              {tags.map((tag: any) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-6 transition hover:bg-neutral-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: tag.color || '#6b7280' }}
                    >
                      <Hash className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/tag/${tag.slug}`}
                          className="text-lg font-semibold text-neutral-900 hover:text-neutral-700"
                        >
                          {tag.name}
                        </Link>
                        {tag.is_trending && (
                          <span className="flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Trending
                          </span>
                        )}
                      </div>
                      {tag.description && (
                        <p className="mt-1 text-sm text-neutral-600">
                          {tag.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-neutral-500">
                        <span>
                          {tag.userUsageCount} of your bookmark
                          {tag.userUsageCount !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span>
                          {tag.usage_count} total use
                          {tag.usage_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-neutral-700"
                    >
                      <Link href={`/tag/${tag.slug}`}>View Tag</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-neutral-700"
                    >
                      <Link
                        href={`/dashboard/bookmarks?tag=${tag.slug}`}
                      >
                        Filter Bookmarks
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">
              About Tags
            </h3>
            <p className="text-sm text-neutral-600">
              Tags help you organize and categorize your bookmarks. When you add
              tags to your bookmarks, they become searchable and easier to find.
              You can filter your bookmarks by tag and discover related content
              from other users.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
