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
  title: 'Create Link Group • HitTags',
};

export default async function NewLinkGroupPage() {
  const profile = await checkPremiumAccess();

  if (!profile?.is_premium) {
    redirect('/pricing');
  }

  async function createLinkGroup(formData: FormData) {
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
    const customSlug = formData.get('slug') as string;

    if (!name) {
      return;
    }

    // Generate slug
    const slug = customSlug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

    const { data: linkGroup, error } = await supabase
      .from('link_groups')
      .insert({
        user_id: user.id,
        name,
        slug,
        description: description || null,
        theme: {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          buttonStyle: 'rounded',
        },
        is_active: true,
      })
      .select('id')
      .single();

    if (error || !linkGroup) {
      console.error('Failed to create link group:', error);
      return;
    }

    redirect(`/dashboard/link-groups/${linkGroup.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Create Link Group</h1>
        <p className="text-sm text-neutral-600">
          Create a beautiful page to share all your important links in one place.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Link Group Details</CardTitle>
          <CardDescription>
            Set up your link group with a name and custom URL slug.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createLinkGroup} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., My Links, Social Profiles, Contact Info"
                required
                maxLength={200}
              />
              <p className="text-xs text-neutral-500">
                This will be displayed as the title of your link page.
              </p>
            </div>

            {/* Custom Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Custom URL Slug (optional)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">hittags.com/l/{profile.username || 'you'}/</span>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="my-links"
                  pattern="[a-z0-9-]+"
                  maxLength={50}
                  className="max-w-xs"
                />
              </div>
              <p className="text-xs text-neutral-500">
                Only lowercase letters, numbers, and hyphens. Auto-generated if left empty.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your link group..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-neutral-500">
                A brief description that will appear on your link page.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Create Link Group
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/link-groups">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="mb-2 font-medium text-blue-900">🔗 What&apos;s a Link Group?</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Share all your important links in one beautiful page</li>
            <li>• Perfect for social media bios, email signatures, and business cards</li>
            <li>• Customize colors, themes, and button styles</li>
            <li>• Track views and clicks for each link</li>
            <li>• Add unlimited links and organize them by category</li>
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
    .select('username, is_premium, subscription_tier')
    .eq('id', user.id)
    .single();

  return data;
}
