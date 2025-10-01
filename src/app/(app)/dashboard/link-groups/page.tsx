import Link from 'next/link';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LinkIcon, EyeIcon, MousePointerClickIcon, ExternalLinkIcon, QrCodeIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Link Groups • HitTags',
};

interface LinkGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: Record<string, unknown>;
  is_active: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
  username?: string;
}

export default async function LinkGroupsPage() {
  const linkGroups = await fetchLinkGroups();
  const profile = await fetchUserProfile();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-neutral-900">Link Groups</h1>
          <p className="text-sm text-neutral-600">
            Create beautiful link pages to share all your important links in one place.
          </p>
        </div>
        {profile?.is_premium ? (
          <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
            <Link href="/dashboard/link-groups/new">Create Link Group</Link>
          </Button>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-medium text-amber-900">Premium Feature</p>
            <p className="mb-3 text-xs text-amber-700">
              Upgrade to Pro or Enterprise to create link groups.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Link Groups Grid */}
      <div className="mx-auto w-full max-w-5xl">
        {linkGroups.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <LinkIcon className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">No link groups yet</h3>
              <p className="mb-6 text-sm text-neutral-600">
                Create your first link group to share all your important links in one beautiful page.
              </p>
              {profile?.is_premium && (
                <Button asChild>
                  <Link href="/dashboard/link-groups/new">Create Your First Link Group</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.id} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <Link href={`/dashboard/link-groups/${group.id}`}>
                      <h3 className="mb-2 text-xl font-semibold text-neutral-900 line-clamp-1 hover:text-neutral-700">
                        {group.name}
                      </h3>
                    </Link>

                    {group.description && (
                      <p className="mb-4 text-sm text-neutral-600 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    <div className="mb-4 space-y-2 text-sm text-neutral-500">
                      <div className="flex items-center gap-2">
                        <EyeIcon className="h-4 w-4" />
                        <span>{group.view_count} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MousePointerClickIcon className="h-4 w-4" />
                        <span>{group.click_count} clicks</span>
                      </div>
                    </div>

                    {group.is_active && group.username && (
                      <div className="space-y-2">
                        <div className="rounded-lg bg-neutral-50 p-3">
                          <p className="mb-1 text-xs text-neutral-500">Public URL:</p>
                          <code className="text-xs text-blue-600">
                            hittags.com/l/{group.username}/{group.slug}
                          </code>
                        </div>

                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/l/${group.username}/${group.slug}`} target="_blank">
                              <ExternalLinkIcon className="mr-2 h-3 w-3" />
                              View
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/dashboard/link-groups/${group.id}/qr`}>
                              <QrCodeIcon className="mr-2 h-3 w-3" />
                              QR
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}

                    {!group.is_active && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <p className="text-xs text-amber-700">Inactive - Not visible to public</p>
                      </div>
                    )}

                    <p className="mt-4 text-xs text-neutral-400">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function fetchLinkGroups(): Promise<LinkGroup[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  const { data, error } = await supabase
    .from('link_groups')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Link groups fetch error:', error);
    return [];
  }

  return (data || []).map(group => ({
    ...group,
    username: profile?.username,
  }));
}

async function fetchUserProfile() {
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
