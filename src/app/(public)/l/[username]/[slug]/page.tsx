import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ExternalLinkIcon } from 'lucide-react';

interface LinkGroupData {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: Record<string, string>;
  is_active: boolean;
  view_count: number;
  click_count: number;
}

interface LinkItemData {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
}

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const { group, profile } = await fetchLinkGroupData(username, slug);

  if (!group) {
    return { title: 'Link Group Not Found' };
  }

  return {
    title: `${group.name} - ${profile?.display_name || profile?.username || 'HitTags'}`,
    description: group.description || `Check out all links from ${profile?.display_name || profile?.username}`,
    openGraph: {
      title: group.name,
      description: group.description || undefined,
      images: profile?.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PublicLinkGroupPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const { group, profile, items } = await fetchLinkGroupData(username, slug);

  if (!group || !group.is_active || !profile) {
    notFound();
  }

  // Increment view count (should be moved to edge function in production)
  await incrementViewCount(group.id);

  const theme = group.theme || {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    buttonStyle: 'rounded',
  };

  return (
    <div
      className="min-h-screen py-8 px-4 sm:py-12 sm:px-6"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="mx-auto max-w-2xl">
        {/* Profile Section */}
        <div className="mb-6 text-center sm:mb-8">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="mx-auto mb-3 h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg sm:mb-4 sm:h-24 sm:w-24"
            />
          )}
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
            {group.name}
          </h1>
          {group.description && (
            <p className="mb-3 px-2 text-sm opacity-80 sm:mb-4 sm:text-base">
              {group.description}
            </p>
          )}
          {profile.bio && (
            <p className="px-2 text-xs opacity-70 sm:text-sm">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-2.5 sm:space-y-3">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white/50 p-6 text-center sm:p-8">
              <p className="text-xs text-gray-600 sm:text-sm">No links available yet</p>
            </div>
          ) : (
            items.map((item) => (
              <a
                key={item.id}
                href={`/api/link-redirect/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[56px] items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all active:scale-[0.98] hover:shadow-md sm:min-h-0 sm:px-6 sm:py-4 sm:hover:scale-105"
                style={{
                  borderRadius: theme.buttonStyle === 'rounded' ? '0.5rem' : theme.buttonStyle === 'pill' ? '9999px' : '0.25rem',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 sm:text-base">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-gray-600 line-clamp-1 sm:text-sm">
                      {item.description}
                    </div>
                  )}
                </div>
                <ExternalLinkIcon className="h-4 w-4 flex-shrink-0 text-gray-400 sm:h-5 sm:w-5" />
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center sm:mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs opacity-60 transition-opacity hover:opacity-100 sm:text-sm"
          >
            <span>Powered by</span>
            <span className="font-semibold">HitTags</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

async function fetchLinkGroupData(username: string, slug: string) {
  const supabase = await createSupabaseServerClient();

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('username', username)
    .single();

  if (!profile) {
    return { group: null, profile: null, items: [] };
  }

  // Get link group
  const { data: group } = await supabase
    .from('link_groups')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', slug)
    .single();

  if (!group) {
    return { group: null, profile, items: [] };
  }

  // Get link items
  const { data: items } = await supabase
    .from('link_group_items')
    .select('*')
    .eq('link_group_id', group.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  return {
    group,
    profile,
    items: items || [],
  };
}

async function incrementViewCount(groupId: string) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from('link_groups')
    .update({ view_count: 0 }) // Will be incremented by trigger
    .eq('id', groupId);

  // This should ideally use a database trigger or edge function
  // For now, we'll just increment it directly
  const { data } = await supabase
    .from('link_groups')
    .select('view_count')
    .eq('id', groupId)
    .single();

  if (data) {
    await supabase
      .from('link_groups')
      .update({ view_count: data.view_count + 1 })
      .eq('id', groupId);
  }
}
