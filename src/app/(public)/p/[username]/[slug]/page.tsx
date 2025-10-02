import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeIcon, HeartIcon, MessageCircleIcon, FileTextIcon, VideoIcon, FileIcon, UserIcon, CalendarIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PostData {
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
  created_at: string;
  slug: string;
}

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const { post, profile } = await fetchPostData(username, slug);

  if (!post || !profile) {
    return { title: 'Post Not Found' };
  }

  const description = post.content.substring(0, 155);
  const authorName = profile.display_name || profile.username;

  return {
    title: `${post.title} - ${authorName} • HitTags`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.media_urls?.[0] ? [post.media_urls[0]] : [],
      type: 'article',
      authors: [authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.media_urls?.[0] ? [post.media_urls[0]] : [],
    },
  };
}

export default async function PublicPremiumPostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const { post, profile } = await fetchPostData(username, slug);

  if (!post || !profile) {
    notFound();
  }

  // Check visibility
  if (post.visibility !== 'public') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <FileTextIcon className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">Subscribers Only</h1>
            <p className="mb-6 text-neutral-600">
              This content is exclusive to {profile.display_name || profile.username}&apos;s subscribers.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild>
                <Link href={`/${username}`}>View Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Increment view count
  await incrementViewCount(post.id);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Author Info */}
        <div className="mb-8">
          <Link
            href={`/${username}`}
            className="flex items-center gap-3 rounded-lg p-4 transition-colors hover:bg-white"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
                <UserIcon className="h-6 w-6 text-neutral-500" />
              </div>
            )}
            <div>
              <h2 className="font-semibold text-neutral-900">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-sm text-neutral-600">@{profile.username}</p>
            </div>
          </Link>
        </div>

        {/* Post Content */}
        <article>
          <Card className="mb-6">
            <CardContent className="p-8">
              {/* Title */}
              <h1 className="mb-4 text-4xl font-bold text-neutral-900">{post.title}</h1>

              {/* Meta Info */}
              <div className="mb-6 flex items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  {post.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4" />
                  {post.like_count} likes
                </span>
              </div>

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
                        <video src={url} controls className="w-full rounded-lg" />
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
                  <p className="whitespace-pre-wrap text-neutral-700">{post.content}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Stats */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="mb-1 flex items-center justify-center">
                  <EyeIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">{post.view_count}</div>
                <div className="text-sm text-neutral-600">Views</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="mb-1 flex items-center justify-center">
                  <HeartIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">{post.like_count}</div>
                <div className="text-sm text-neutral-600">Likes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="mb-1 flex items-center justify-center">
                  <MessageCircleIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">{post.comment_count}</div>
                <div className="text-sm text-neutral-600">Comments</div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold text-blue-900">
                Want more from {profile.display_name || profile.username}?
              </h3>
              <p className="mb-4 text-blue-700">
                Subscribe to get exclusive content and support their work.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button asChild>
                  <Link href={`/${username}`}>Subscribe Now</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/${username}`}>View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
            Powered by <span className="font-semibold">HitTags</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

async function fetchPostData(username: string, slug: string) {
  const supabase = await createSupabaseServerClient();

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('username', username)
    .single();

  if (!profile) {
    return { post: null, profile: null };
  }

  // Get post
  const { data: post } = await supabase
    .from('exclusive_posts')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', slug)
    .single();

  if (!post) {
    return { post: null, profile };
  }

  return { post, profile };
}

async function incrementViewCount(postId: string) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from('exclusive_posts')
    .update({ view_count: 0 })
    .eq('id', postId);

  // Ideally use a database trigger or edge function
  const { data } = await supabase
    .from('exclusive_posts')
    .select('view_count')
    .eq('id', postId)
    .single();

  if (data) {
    await supabase
      .from('exclusive_posts')
      .update({ view_count: data.view_count + 1 })
      .eq('id', postId);
  }
}
