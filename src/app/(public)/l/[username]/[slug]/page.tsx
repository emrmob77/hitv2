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
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="mx-auto max-w-2xl">
        {/* Profile Section */}
        <div className="mb-8 text-center">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
            />
          )}
          <h1 className="mb-2 text-3xl font-bold">
            {group.name}
          </h1>
          {group.description && (
            <p className="mb-4 text-base opacity-80">
              {group.description}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm opacity-70">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white/50 p-8 text-center">
              <p className="text-sm text-gray-600">No links available yet</p>
            </div>
          ) : (
            items.map((item) => (
              <a
                key={item.id}
                href={`/api/link-redirect/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm transition-all hover:scale-105 hover:shadow-md"
                style={{
                  borderRadius: theme.buttonStyle === 'rounded' ? '0.5rem' : theme.buttonStyle === 'pill' ? '9999px' : '0.25rem',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {item.description}
                    </div>
                  )}
                </div>
                <ExternalLinkIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100"
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
