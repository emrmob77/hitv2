import Link from 'next/link';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LinkGroupCard } from '@/components/link-groups/link-group-card';
import { LinkIcon, PlusIcon } from 'lucide-react';

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hittags.com';

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
          <EmptyState
            icon={LinkIcon}
            title="No link groups yet"
            description="Create your first link group to share all your important links in one beautiful page."
            action={
              profile?.is_premium ? (
                <Button asChild>
                  <Link href="/dashboard/link-groups/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Your First Link Group
                  </Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {linkGroups.map((group) => (
              <LinkGroupCard key={group.id} group={group} baseUrl={baseUrl} />
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
