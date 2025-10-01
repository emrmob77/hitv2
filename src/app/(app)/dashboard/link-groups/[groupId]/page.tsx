import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVerticalIcon, ExternalLinkIcon, PlusIcon, SettingsIcon } from 'lucide-react';

interface LinkGroupDetail {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: Record<string, unknown>;
  is_active: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
}

interface LinkItem {
  id: string;
  link_group_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupId: string }>;
}): Promise<Metadata> {
  const { groupId } = await params;
  const group = await fetchLinkGroup(groupId);

  if (!group) {
    return { title: 'Link Group Not Found' };
  }

  return {
    title: `${group.name} • HitTags`,
  };
}

export default async function LinkGroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = await fetchLinkGroup(groupId);

  if (!group) {
    notFound();
  }

  const items = await fetchLinkItems(groupId);
  const profile = await fetchUserProfile();

  async function addLinkItem(formData: FormData) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/login');
    }

    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;

    if (!title || !url) {
      return;
    }

    // Get max position
    const { data: maxItem } = await supabase
      .from('link_group_items')
      .select('position')
      .eq('link_group_id', groupId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxItem?.position || 0) + 1;

    const { error } = await supabase
      .from('link_group_items')
      .insert({
        link_group_id: groupId,
        title,
        url,
        description: description || null,
        position,
        is_active: true,
      });

    if (error) {
      console.error('Failed to add link item:', error);
      return;
    }

    redirect(`/dashboard/link-groups/${groupId}`);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/dashboard/link-groups" className="hover:text-neutral-900">
              Link Groups
            </Link>
            <span>/</span>
            <span>{group.name}</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/link-groups/${groupId}/edit`}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            {group.is_active && profile?.username && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/l/${profile.username}/${group.slug}`} target="_blank">
                  <ExternalLinkIcon className="mr-2 h-4 w-4" />
                  View Public Page
                </Link>
              </Button>
            )}
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">{group.name}</h1>
        {group.description && (
          <p className="text-sm text-neutral-600">{group.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
          <span>{group.view_count} views</span>
          <span>•</span>
          <span>{group.click_count} total clicks</span>
        </div>
      </header>

      {/* Add Link Form */}
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Link</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addLinkItem} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Website, Twitter, Instagram"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="url" className="text-sm font-medium">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Short description of this link"
                  maxLength={200}
                />
              </div>

              <Button type="submit" size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Link Items */}
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Your Links ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-600">
                No links added yet. Add your first link above to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                  >
                    <GripVerticalIcon className="h-5 w-5 flex-shrink-0 text-neutral-400" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-neutral-900">{item.title}</h3>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-neutral-600 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-xs text-blue-600 hover:underline"
                      >
                        {item.url}
                      </a>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2 text-sm text-neutral-500">
                      <span>{item.click_count} clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function fetchLinkGroup(groupId: string): Promise<LinkGroupDetail | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('link_groups')
    .select('*')
    .eq('id', groupId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return data;
}

async function fetchLinkItems(groupId: string): Promise<LinkItem[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('link_group_items')
    .select('*')
    .eq('link_group_id', groupId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Link items fetch error:', error);
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
    .select('username')
    .eq('id', user.id)
    .single();

  return data;
}
