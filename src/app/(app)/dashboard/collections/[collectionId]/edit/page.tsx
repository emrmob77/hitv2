import Link from 'next/link';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  privacy_level: 'public' | 'private' | 'subscribers';
  cover_image_url: string | null;
  user_id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}): Promise<Metadata> {
  const { collectionId } = await params;
  const collection = await fetchCollection(collectionId);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  return {
    title: `Edit ${collection.name} • HitTags`,
  };
}

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = await fetchCollection(collectionId);

  if (!collection) {
    notFound();
  }

  async function updateCollection(formData: FormData) {
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

    const { error } = await supabase
      .from('collections')
      .update({
        name,
        description: description || null,
        cover_image_url: coverImageUrl || null,
        slug,
        privacy_level: isPublic ? 'public' : 'private',
        updated_at: new Date().toISOString(),
      })
      .eq('id', collectionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update collection:', error);
      return;
    }

    redirect(`/dashboard/collections/${collectionId}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href={`/dashboard/collections/${collectionId}`}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Collection
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-neutral-900">Edit Collection</h1>
        <p className="text-sm text-neutral-600">
          Update your collection details.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>
            Modify the name, description, and privacy settings of your collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCollection} className="space-y-6">
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
                defaultValue={collection.name}
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
                defaultValue={collection.description || ''}
              />
              <p className="text-xs text-neutral-500">
                Help others understand the purpose and content of your collection.
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
                defaultValue={collection.cover_image_url || ''}
              />
              <p className="text-xs text-neutral-500">
                Provide a URL to an image for your collection cover.
              </p>
            </div>

            {/* Privacy */}
            <div className="space-y-2">
              <Label htmlFor="is_public">Privacy Settings</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  className="h-4 w-4 rounded border-neutral-300"
                  defaultChecked={collection.privacy_level === 'public'}
                />
                <Label htmlFor="is_public" className="cursor-pointer font-normal">
                  Make this collection public
                </Label>
              </div>
              <p className="text-xs text-neutral-500">
                Public collections can be discovered and viewed by anyone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/collections/${collectionId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

async function fetchCollection(collectionId: string): Promise<Collection | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error} = await supabase
    .from('collections')
    .select('id, name, description, slug, privacy_level, cover_image_url, user_id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Collection fetch error:', error);
    return null;
  }

  return data;
}
