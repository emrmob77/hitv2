import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteLinkGroupButton } from '@/components/link-groups/delete-link-group-button';

interface LinkGroupDetail {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: Record<string, unknown>;
  is_active: boolean;
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
    title: `Edit ${group.name} • HitTags`,
  };
}

export default async function EditLinkGroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = await fetchLinkGroup(groupId);

  if (!group) {
    notFound();
  }

  const theme = (group.theme || {}) as Record<string, string>;

  async function updateLinkGroup(formData: FormData) {
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
    const isActive = formData.get('is_active') === 'on';
    const primaryColor = formData.get('primary_color') as string;
    const backgroundColor = formData.get('background_color') as string;
    const textColor = formData.get('text_color') as string;
    const buttonStyle = formData.get('button_style') as string;

    if (!name) {
      return;
    }

    const { error } = await supabase
      .from('link_groups')
      .update({
        name,
        description: description || null,
        is_active: isActive,
        theme: {
          primaryColor: primaryColor || '#3b82f6',
          backgroundColor: backgroundColor || '#ffffff',
          textColor: textColor || '#1f2937',
          buttonStyle: buttonStyle || 'rounded',
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update link group:', error);
      return;
    }

    redirect(`/dashboard/link-groups/${groupId}`);
  }


  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard/link-groups" className="hover:text-neutral-900">
            Link Groups
          </Link>
          <span>/</span>
          <Link href={`/dashboard/link-groups/${groupId}`} className="hover:text-neutral-900">
            {group.name}
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-3xl font-semibold text-neutral-900">Edit Link Group</h1>
        <p className="text-sm text-neutral-600">
          Update your link group settings and customize the appearance.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Link Group Settings</CardTitle>
          <CardDescription>
            Customize your link group name, description, and theme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateLinkGroup} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., My Links, Social Profiles, Contact Info"
                defaultValue={group.name}
                required
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your link group..."
                defaultValue={group.description || ''}
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={group.is_active}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <Label htmlFor="is_active" className="font-normal">
                  Active (visible to public)
                </Label>
              </div>
              <p className="text-xs text-neutral-500">
                Inactive link groups are not visible to the public.
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Theme Customization</h3>

              <div className="space-y-4">
                {/* Primary Color */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <Input
                      id="primary_color"
                      name="primary_color"
                      type="color"
                      defaultValue={theme.primaryColor || '#3b82f6'}
                      className="h-10 w-full"
                    />
                  </div>

                  {/* Background Color */}
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="background_color">Background Color</Label>
                    <Input
                      id="background_color"
                      name="background_color"
                      type="color"
                      defaultValue={theme.backgroundColor || '#ffffff'}
                      className="h-10 w-full"
                    />
                  </div>

                  {/* Text Color */}
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="text_color">Text Color</Label>
                    <Input
                      id="text_color"
                      name="text_color"
                      type="color"
                      defaultValue={theme.textColor || '#1f2937'}
                      className="h-10 w-full"
                    />
                  </div>
                </div>

                {/* Button Style */}
                <div className="space-y-2">
                  <Label htmlFor="button_style">Button Style</Label>
                  <select
                    id="button_style"
                    name="button_style"
                    defaultValue={theme.buttonStyle || 'rounded'}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                  >
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                    <option value="pill">Pill (Fully Rounded)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 border-t pt-6">
              <div className="flex gap-3">
                <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                  Update Link Group
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/link-groups/${groupId}`}>Cancel</Link>
                </Button>
              </div>

              <DeleteLinkGroupButton groupId={group.id} groupName={group.name} />
            </div>
          </form>
        </CardContent>
      </Card>
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
    .select('id, user_id, name, slug, description, theme, is_active')
    .eq('id', groupId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return data;
}
