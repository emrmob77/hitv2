import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeletePostButton } from '@/components/posts/delete-post-button';

interface PostDetail {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_type: 'text' | 'markdown' | 'html';
  media_urls: string[];
  visibility: 'subscribers' | 'premium' | 'private';
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
    title: `Edit ${post.title} • HitTags`,
  };
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await fetchPost(postId);

  if (!post) {
    notFound();
  }

  async function updatePost(formData: FormData) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/login');
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const contentType = formData.get('content_type') as string;
    const visibility = formData.get('visibility') as string;
    const mediaUrls = (formData.get('media_urls') as string)
      .split('\n')
      .filter(url => url.trim())
      .map(url => url.trim());

    if (!title || !content) {
      return;
    }

    const { error } = await supabase
      .from('exclusive_posts')
      .update({
        title,
        content,
        content_type: contentType || 'text',
        visibility: visibility || 'subscribers',
        media_urls: mediaUrls.length > 0 ? mediaUrls : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update post:', error);
      return;
    }

    redirect(`/dashboard/posts/${postId}`);
  }


  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard/posts" className="hover:text-neutral-900">
            Posts
          </Link>
          <span>/</span>
          <Link href={`/dashboard/posts/${postId}`} className="hover:text-neutral-900">
            {post.title}
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-3xl font-semibold text-neutral-900">Edit Premium Post</h1>
        <p className="text-sm text-neutral-600">
          Update your exclusive content for subscribers and premium members.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Update the content, media, and visibility settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePost} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter post title..."
                defaultValue={post.title}
                required
                maxLength={500}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your premium content here..."
                defaultValue={post.content}
                rows={12}
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-neutral-500">
                Supports Markdown formatting for rich text content.
              </p>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="content_type">Content Type</Label>
              <select
                id="content_type"
                name="content_type"
                defaultValue={post.content_type}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              >
                <option value="text">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>

            {/* Media URLs */}
            <div className="space-y-2">
              <Label htmlFor="media_urls">Media URLs (Images, Videos, Documents)</Label>
              <Textarea
                id="media_urls"
                name="media_urls"
                placeholder="https://example.com/image1.jpg
https://example.com/video.mp4
https://example.com/document.pdf

(One URL per line)"
                defaultValue={post.media_urls.join('\n')}
                rows={6}
              />
              <p className="text-xs text-neutral-500">
                Add URLs to images, videos, or documents (one per line).
              </p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <select
                id="visibility"
                name="visibility"
                defaultValue={post.visibility}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              >
                <option value="public">Public (Anyone can view)</option>
                <option value="subscribers">Subscribers Only</option>
                <option value="premium">Premium Members Only</option>
                <option value="private">Private (Only You)</option>
              </select>
              <p className="text-xs text-neutral-500">
                Control who can see this premium post. Public posts are visible to anyone with the link.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-3">
                <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                  Update Post
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/posts/${postId}`}>Cancel</Link>
                </Button>
              </div>

              <DeletePostButton postId={post.id} postTitle={post.title} />
            </div>
          </form>
        </CardContent>
      </Card>
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
    .select('id, user_id, title, content, content_type, media_urls, visibility')
    .eq('id', postId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Post fetch error:', error);
    return null;
  }

  return data;
}
