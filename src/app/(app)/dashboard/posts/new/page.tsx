import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Create Premium Post • HitTags',
};

export default async function NewPostPage() {
  const profile = await checkPremiumAccess();

  if (!profile?.is_premium) {
    redirect('/pricing');
  }

  async function createPost(formData: FormData) {
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

    const { data: post, error } = await supabase
      .from('exclusive_posts')
      .insert({
        user_id: user.id,
        title,
        content,
        content_type: contentType || 'text',
        visibility: visibility || 'subscribers',
        media_urls: mediaUrls.length > 0 ? mediaUrls : [],
      })
      .select('id')
      .single();

    if (error || !post) {
      console.error('Failed to create post:', error);
      return;
    }

    redirect(`/dashboard/posts/${post.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Create Premium Post</h1>
        <p className="text-sm text-neutral-600">
          Share exclusive content with your subscribers and premium members.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Create rich content with text, images, videos, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPost} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter post title..."
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
                placeholder="Write your premium content here...

You can use **markdown** for formatting:
- **Bold text**
- *Italic text*
- # Headings
- Lists
- Links
"
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
            <div className="flex gap-3">
              <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Publish Post
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/posts">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="mb-2 font-medium text-blue-900">💡 Premium Post Tips</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Use engaging titles to attract your subscribers</li>
            <li>• Add high-quality images or videos to enhance your content</li>
            <li>• Use Markdown for better formatting (headings, lists, bold text)</li>
            <li>• Choose the right visibility level for your audience</li>
            <li>• Engage with comments to build community</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

async function checkPremiumAccess() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('is_premium, subscription_tier')
    .eq('id', user.id)
    .single();

  return data;
}
