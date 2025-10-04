import Link from 'next/link';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileTextIcon, LockIcon, UsersIcon, EyeIcon, VideoIcon, FileIcon, SearchIcon, LayoutGridIcon, ListIcon } from 'lucide-react';
import { PostFilters } from '@/components/posts/post-filters';

export const metadata: Metadata = {
  title: 'Premium Posts',
};

interface ExclusivePost {
  id: string;
  title: string;
  content: string;
  content_type: 'text' | 'markdown' | 'html';
  media_urls: string[];
  visibility: 'public' | 'subscribers' | 'premium' | 'private';
  like_count: number;
  comment_count: number;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  slug: string | null;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string; visibility?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const viewMode = params.view || 'grid';
  const visibilityFilter = params.visibility || 'all';
  const sortBy = params.sort || 'newest';

  const posts = await fetchPosts(query, visibilityFilter, sortBy);
  const profile = await fetchUserProfile();
  const username = profile?.username || '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-neutral-900">Premium Posts</h1>
          <p className="text-sm text-neutral-600">
            Create exclusive content for your subscribers and premium members.
          </p>
        </div>
        {profile?.is_premium ? (
          <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
            <Link href="/dashboard/posts/new">Create Post</Link>
          </Button>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-medium text-amber-900">Premium Feature</p>
            <p className="mb-3 text-xs text-amber-700">
              Upgrade to Pro or Enterprise to create premium posts.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Search and Filters */}
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <form action="/dashboard/posts" method="get">
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search posts..."
                    defaultValue={query}
                    className="pl-10"
                  />
                  {visibilityFilter !== 'all' && (
                    <input type="hidden" name="visibility" value={visibilityFilter} />
                  )}
                  {sortBy !== 'newest' && (
                    <input type="hidden" name="sort" value={sortBy} />
                  )}
                  {viewMode !== 'grid' && (
                    <input type="hidden" name="view" value={viewMode} />
                  )}
                </form>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <PostFilters visibilityFilter={visibilityFilter} sortBy={sortBy} />

                {/* View Toggle */}
                <div className="flex rounded-md border border-neutral-300">
                  <Link
                    href={`/dashboard/posts?view=grid${query ? `&q=${query}` : ''}${visibilityFilter !== 'all' ? `&visibility=${visibilityFilter}` : ''}${sortBy !== 'newest' ? `&sort=${sortBy}` : ''}`}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-100' : ''}`}
                  >
                    <LayoutGridIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/posts?view=list${query ? `&q=${query}` : ''}${visibilityFilter !== 'all' ? `&visibility=${visibilityFilter}` : ''}${sortBy !== 'newest' ? `&sort=${sortBy}` : ''}`}
                    className={`p-2 ${viewMode === 'list' ? 'bg-neutral-100' : ''}`}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Display */}
      <div className="mx-auto w-full max-w-5xl">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileTextIcon className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                {query ? 'No posts found' : 'No premium posts yet'}
              </h3>
              <p className="mb-6 text-sm text-neutral-600">
                {query
                  ? 'Try adjusting your search or filters'
                  : 'Create your first premium post to share exclusive content with your subscribers.'}
              </p>
              {profile?.is_premium && !query && (
                <Button asChild>
                  <Link href="/dashboard/posts/new">Create Your First Post</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCardGrid key={post.id} post={post} username={username} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCardList key={post.id} post={post} username={username} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCardGrid({ post, username }: { post: ExclusivePost; username: string }) {
  return (
    <div className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <Link href={`/dashboard/posts/${post.id}`}>
          {/* Media Preview */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
              {post.media_urls[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={post.media_urls[0]}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {post.media_urls[0].match(/\.(mp4|webm|ogg)$/i) ? (
                    <VideoIcon className="h-16 w-16 text-neutral-300" />
                  ) : (
                    <FileIcon className="h-16 w-16 text-neutral-300" />
                  )}
                </div>
              )}
            </div>
          )}
        </Link>

        {/* Content */}
        <CardContent className="p-4">
          <Link href={`/dashboard/posts/${post.id}`}>
            <h3 className="mb-2 font-semibold text-neutral-900 line-clamp-2 hover:text-neutral-700">
              {post.title}
            </h3>
          </Link>

          <p className="mb-3 text-sm text-neutral-600 line-clamp-3">
            {post.content.substring(0, 150)}...
          </p>

          <div className="mb-3 flex items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <EyeIcon className="h-3 w-3" />
              {post.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <FileTextIcon className="h-3 w-3" />
              {post.comment_count} comments
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-400">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <VisibilityBadge visibility={post.visibility} />
          </div>

          {/* Public Link - Only show for public posts */}
          {post.visibility === 'public' && post.slug && username && (
            <div className="mt-3 pt-3 border-t">
              <Link
                href={`/p/${username}/${post.slug}`}
                target="_blank"
                className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                <EyeIcon className="h-3 w-3" />
                View Public Page
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PostCardList({ post, username }: { post: ExclusivePost; username: string }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {post.media_urls && post.media_urls.length > 0 && (
            <Link href={`/dashboard/posts/${post.id}`} className="flex-shrink-0">
              <div className="h-24 w-32 overflow-hidden rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200">
                {post.media_urls[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={post.media_urls[0]}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileIcon className="h-8 w-8 text-neutral-300" />
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <Link href={`/dashboard/posts/${post.id}`}>
              <h3 className="mb-1 font-semibold text-neutral-900 line-clamp-1 hover:text-neutral-700">
                {post.title}
              </h3>
            </Link>
            <p className="mb-2 text-sm text-neutral-600 line-clamp-2">
              {post.content.substring(0, 120)}...
            </p>
            <div className="flex items-center flex-wrap gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3" />
                {post.view_count}
              </span>
              <span className="flex items-center gap-1">
                <FileTextIcon className="h-3 w-3" />
                {post.comment_count}
              </span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <VisibilityBadge visibility={post.visibility} />

              {/* Public Link - Inline for list view */}
              {post.visibility === 'public' && post.slug && username && (
                <Link
                  href={`/p/${username}/${post.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <EyeIcon className="h-3 w-3" />
                  Public
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  if (visibility === 'public') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
        <EyeIcon className="h-3 w-3" />
        Public
      </span>
    );
  }
  if (visibility === 'subscribers') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        <UsersIcon className="h-3 w-3" />
        Subscribers
      </span>
    );
  }
  if (visibility === 'premium') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
        <LockIcon className="h-3 w-3" />
        Premium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
      <LockIcon className="h-3 w-3" />
      Private
    </span>
  );
}

async function fetchPosts(
  query: string,
  visibilityFilter: string,
  sortBy: string
): Promise<ExclusivePost[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let queryBuilder = supabase
    .from('exclusive_posts')
    .select('*')
    .eq('user_id', user.id);

  // Search filter
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
  }

  // Visibility filter
  if (visibilityFilter !== 'all') {
    queryBuilder = queryBuilder.eq('visibility', visibilityFilter);
  }

  // Sorting
  switch (sortBy) {
    case 'oldest':
      queryBuilder = queryBuilder.order('created_at', { ascending: true });
      break;
    case 'most_viewed':
      queryBuilder = queryBuilder.order('view_count', { ascending: false });
      break;
    case 'most_liked':
      queryBuilder = queryBuilder.order('like_count', { ascending: false });
      break;
    case 'newest':
    default:
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Posts fetch error:', error);
    return [];
  }

  return data || [];
}

async function fetchUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('username, is_premium, subscription_tier')
    .eq('id', user.id)
    .single();

  return data;
}
