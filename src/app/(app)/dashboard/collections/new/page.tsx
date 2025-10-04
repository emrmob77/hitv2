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
  title: 'Create Collection',
};

export default function NewCollectionPage() {
  async function createCollection(formData: FormData) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/login');
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const coverImageUrl = formData.get('cover_image_url') as string;
    const isPublic = formData.get('is_public') === 'on';

    if (!name) {
      return;
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);

    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        cover_image_url: coverImageUrl || null,
        slug,
        privacy_level: isPublic ? 'public' : 'private',
      })
      .select('id')
      .single();

    if (error || !collection) {
      console.error('Failed to create collection:', error);
      return;
    }

    redirect(`/dashboard/collections/${collection.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Create Collection</h1>
        <p className="text-sm text-neutral-600">
          Organize your bookmarks into a curated collection.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>
            Give your collection a name and description to help others understand what it contains.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCollection} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Web Development Resources"
                required
                maxLength={100}
              />
              <p className="text-xs text-neutral-500">
                Choose a clear, descriptive name for your collection.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what this collection is about..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-neutral-500">
                Help others understand the purpose of this collection.
              </p>
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input
                id="cover_image_url"
                name="cover_image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-neutral-500">
                Provide a URL to an image for your collection cover.
              </p>
            </div>

            {/* Privacy */}
            <div className="space-y-2">
              <Label>Privacy</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  defaultChecked
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <Label htmlFor="is_public" className="font-normal">
                  Make this collection public
                </Label>
              </div>
              <p className="text-xs text-neutral-500">
                Public collections can be discovered and viewed by anyone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Create Collection
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/collections">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
