import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalLinkIcon, PlusIcon, SettingsIcon, EyeIcon, MousePointerClickIcon, TrendingUpIcon } from 'lucide-react';
import { SortableLinkList } from '@/components/link-groups/sortable-link-list';
import { QRCodeGenerator } from '@/components/link-groups/qr-code-generator';

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

  const publicUrl = profile?.username && group.is_active
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/l/${profile.username}/${group.slug}`
    : '';

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

  async function handleReorder(reorderedItems: LinkItem[]) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Verify ownership
    const { data: group } = await supabase
      .from('link_groups')
      .select('user_id')
      .eq('id', groupId)
      .single();

    if (!group || group.user_id !== user.id) {
      throw new Error('Forbidden');
    }

    // Update positions in batch
    const updates = reorderedItems.map((item) =>
      supabase
        .from('link_group_items')
        .update({ position: item.position })
        .eq('id', item.id)
        .eq('link_group_id', groupId)
    );

    await Promise.all(updates);

    revalidatePath(`/dashboard/link-groups/${groupId}`);
  }

  async function handleToggleActive(itemId: string, isActive: boolean) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('link_group_items')
      .update({ is_active: isActive })
      .eq('id', itemId);

    if (error) {
      throw new Error('Failed to toggle link status');
    }

    revalidatePath(`/dashboard/link-groups/${groupId}`);
  }

  async function handleDelete(itemId: string) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('link_group_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error('Failed to delete link');
    }

    revalidatePath(`/dashboard/link-groups/${groupId}`);
  }

  async function handleUpdate(
    itemId: string,
    data: { title?: string; url?: string; description?: string }
  ) {
    'use server';

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const updateData: Record<string, string | null> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    const { error } = await supabase
      .from('link_group_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('link_group_id', groupId);

    if (error) {
      throw new Error('Failed to update link');
    }

    revalidatePath(`/dashboard/link-groups/${groupId}`);
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
            {publicUrl && (
              <QRCodeGenerator url={publicUrl} title={group.name} />
            )}
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

      </header>

      {/* Analytics Stats */}
      <div className="mx-auto w-full max-w-4xl">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group.view_count}</div>
              <p className="text-xs text-neutral-500">Page visits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClickIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group.click_count}</div>
              <p className="text-xs text-neutral-500">Link clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {group.view_count > 0 ? ((group.click_count / group.view_count) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-neutral-500">Engagement rate</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performing Links */}
      {items.length > 0 && (
        <div className="mx-auto w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Links</CardTitle>
              <CardDescription>Most clicked links in this group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items
                  .filter(item => item.is_active)
                  .sort((a, b) => b.click_count - a.click_count)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-neutral-500 truncate max-w-md">{item.url}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900">{item.click_count}</p>
                        <p className="text-xs text-neutral-500">clicks</p>
                      </div>
                    </div>
                  ))}
                {items.filter(item => item.is_active).length === 0 && (
                  <p className="text-center text-sm text-neutral-500 py-4">
                    No active links yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

      {/* Link Items with Drag & Drop */}
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Your Links ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <SortableLinkList
              items={items}
              onReorder={handleReorder}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
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
