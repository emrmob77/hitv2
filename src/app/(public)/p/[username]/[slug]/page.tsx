import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cache } from 'react';
import { EyeIcon, HeartIcon, MessageCircleIcon, FileTextIcon, UserIcon, CalendarIcon, LockIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';

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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

const getPostData = cache(async (username: string, slug: string) => {
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('username', username)
    .single();

  if (!profile) {
    return { post: null, profile: null };
  }

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
});

function createExcerpt(content: string, limit = 160) {
  const condensed = content
    .replace(/[#>*_`~/]/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (condensed.length <= limit) {
    return condensed;
  }

  return `${condensed.slice(0, limit - 1).trimEnd()}…`;
}

function renderPostBody(post: PostData, body: string, options?: { forcePlain?: boolean }) {
  if (options?.forcePlain) {
    return <p className="whitespace-pre-wrap text-neutral-700">{body}</p>;
  }

  if (post.content_type === 'markdown') {
    return <ReactMarkdown>{body}</ReactMarkdown>;
  }

  if (post.content_type === 'html') {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  }

  return <p className="whitespace-pre-wrap text-neutral-700">{body}</p>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const { post, profile } = await getPostData(username, slug);

  if (!post || !profile) {
    return { title: 'Post Not Found' };
  }

  const description = createExcerpt(post.content, 155);
  const authorName = profile.display_name || profile.username;
  const canonicalUrl = `${baseUrl}/p/${username}/${slug}`;
  const isPaywalled = post.visibility === 'premium' || post.visibility === 'subscribers';
  const isPrivate = post.visibility === 'private';
  const images = post.media_urls?.[0] ? [post.media_urls[0]] : undefined;

  const robots: Metadata['robots'] | undefined = isPrivate
    ? { index: false, follow: false }
    : isPaywalled
    ? {
        index: true,
        follow: false,
        googleBot: {
          index: true,
          follow: false,
          'max-snippet': 160,
          'max-image-preview': 'large',
          'max-video-preview': -1,
        },
      }
    : undefined;

  return {
    title: `${post.title} - ${authorName} • HitTags`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description,
      images,
      type: 'article',
      url: canonicalUrl,
      authors: [authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images,
    },
    robots,
  };
}

export default async function PublicPremiumPostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const { post, profile } = await getPostData(username, slug);

  if (!post || !profile) {
    notFound();
  }

  const authorName = profile.display_name || profile.username;
  const isPaywalled = post.visibility === 'premium' || post.visibility === 'subscribers';
  const isPrivate = post.visibility === 'private';
  const excerpt = createExcerpt(post.content, 220);
  const structuredData = StructuredDataGenerator.generatePremiumPostSchema({
    title: post.title,
    slug: post.slug || slug,
    username,
    createdAt: post.created_at,
    visibility: post.visibility,
    excerpt,
    mediaUrls: post.media_urls ?? [],
    authorName,
  });

  if (isPrivate) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200">
              <LockIcon className="h-8 w-8 text-neutral-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">Private Post</h1>
            <p className="mb-6 text-neutral-600">
              {authorName} marked this content as private. Only invited readers can view it.
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

  await incrementViewCount(post.id, post.view_count);

  const teaserContent = isPaywalled ? createExcerpt(post.content, 520) : post.content;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8">
            <Link
              href={`/${username}`}
              className="flex items-center gap-3 rounded-lg p-4 transition-colors hover:bg-white"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={authorName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
                  <UserIcon className="h-6 w-6 text-neutral-500" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-neutral-900">{authorName}</h2>
                <p className="text-sm text-neutral-600">@{profile.username}</p>
              </div>
            </Link>
          </div>

          <article>
            <Card className="mb-6">
              <CardContent className="p-8">
                <h1 className="mb-4 text-4xl font-bold text-neutral-900">{post.title}</h1>

                <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
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
                  {isPaywalled && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                      <LockIcon className="h-4 w-4" />
                      Premium preview
                    </span>
                  )}
                </div>

                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="mb-8 space-y-4">
                    {post.media_urls.map((url, index) => (
                      <div key={index} className="overflow-hidden rounded-lg">
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img src={url} alt={`Media ${index + 1}`} className="w-full rounded-lg" />
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
                            <span className="text-sm text-blue-600 hover:underline">View Attachment</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={
                    isPaywalled
                      ? 'premium-content relative overflow-hidden rounded-xl border border-amber-100 bg-amber-50/40 p-6 text-base text-neutral-800'
                      : 'prose prose-neutral max-w-none'
                  }
                >
                  {renderPostBody(post, teaserContent, { forcePlain: isPaywalled })}
                  {isPaywalled && (
                    <>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-amber-50 via-amber-50/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                          <LockIcon className="h-4 w-4" />
                          Subscribe to unlock full content
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {isPaywalled && (
                  <p className="mt-4 text-sm text-amber-800">
                    Enjoy this preview. Subscribers receive the complete article, attachments, and every new release.
                  </p>
                )}
              </CardContent>
            </Card>

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

            <Card className={isPaywalled ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}>
              <CardContent className="p-6 text-center">
                <h3
                  className={
                    isPaywalled
                      ? 'mb-2 text-xl font-semibold text-amber-900'
                      : 'mb-2 text-xl font-semibold text-blue-900'
                  }
                >
                  {isPaywalled
                    ? `Unlock the full drop from ${authorName}`
                    : `Want more from ${authorName}?`}
                </h3>
                <p className={isPaywalled ? 'mb-4 text-amber-800' : 'mb-4 text-blue-700'}>
                  {isPaywalled
                    ? 'Subscribe to access the complete write-up, premium resources, and every new release.'
                    : 'Subscribe to get exclusive content and support their work.'}
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

          <div className="mt-12 text-center">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
              Powered by <span className="font-semibold">HitTags</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

async function incrementViewCount(postId: string, currentViews: number | null) {
  const supabase = await createSupabaseServerClient();

  const nextValue = (currentViews ?? 0) + 1;
  const { error } = await supabase
    .from('exclusive_posts')
    .update({ view_count: nextValue })
    .eq('id', postId);

  if (error) {
    console.error('Failed to increment premium post view count:', error);
  }
}
