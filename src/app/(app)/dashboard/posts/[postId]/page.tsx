import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileTextIcon, EyeIcon, HeartIcon, MessageCircleIcon, EditIcon, UsersIcon, LockIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DeletePostButton } from '@/components/posts/delete-post-button';
import { CopyPostLinkButton } from '@/components/posts/copy-post-link-button';

interface PostDetail {
  id: string;
  user_id: string;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchPost(postId);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} • HitTags`,
    description: post.content.substring(0, 155),
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await fetchPost(postId);
  const profile = await fetchUserProfile();

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/dashboard/posts" className="hover:text-neutral-900">
              Posts
            </Link>
            <span>/</span>
            <span>{post.title}</span>
          </div>
          <div className="flex gap-2">
            {profile?.username && post.slug && (
              <CopyPostLinkButton
                username={profile.username}
                slug={post.slug}
                visibility={post.visibility}
              />
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/posts/${post.id}/edit`}>
                <EditIcon className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DeletePostButton postId={post.id} postTitle={post.title} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-neutral-900">{post.title}</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                {post.view_count} views
              </span>
              <span className="flex items-center gap-1">
                <HeartIcon className="h-4 w-4" />
                {post.like_count} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircleIcon className="h-4 w-4" />
                {post.comment_count} comments
              </span>
            </div>

            {post.visibility === 'subscribers' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <UsersIcon className="h-4 w-4" />
                Subscribers Only
              </span>
            ) : post.visibility === 'premium' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                <LockIcon className="h-4 w-4" />
                Premium Only
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
                <LockIcon className="h-4 w-4" />
                Private
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-500">
            Published {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardContent className="p-6 md:p-8">
            {/* Media Gallery */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mb-8 space-y-4">
                {post.media_urls.map((url, index) => (
                  <div key={index} className="overflow-hidden rounded-lg">
                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={url}
                        controls
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border p-4 hover:bg-neutral-50"
                      >
                        <FileTextIcon className="h-5 w-5 text-neutral-400" />
                        <span className="text-sm text-blue-600 hover:underline">
                          View Attachment
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Content Body */}
            <div className="prose prose-neutral max-w-none">
              {post.content_type === 'markdown' ? (
                <ReactMarkdown>{post.content}</ReactMarkdown>
              ) : post.content_type === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <p className="whitespace-pre-wrap">{post.content}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-neutral-900">
                {post.view_count}
              </div>
              <div className="text-sm text-neutral-600">Total Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-neutral-900">
                {post.like_count}
              </div>
              <div className="text-sm text-neutral-600">Likes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-neutral-900">
                {post.comment_count}
              </div>
              <div className="text-sm text-neutral-600">Comments</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

async function fetchPost(postId: string): Promise<PostDetail | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('exclusive_posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Post fetch error:', error);
    return null;
  }

  // Increment view count (could be moved to edge function for better performance)
  await supabase
    .from('exclusive_posts')
    .update({ view_count: data.view_count + 1 })
    .eq('id', postId);

  return data;
}

async function fetchUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  return data;
}
