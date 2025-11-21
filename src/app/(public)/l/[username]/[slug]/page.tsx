import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ExternalLinkIcon, Eye, Share2, User } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Profile Section */}
        <div className="mb-8 text-center">
          {/* Avatar */}
          <div className="relative mb-6 inline-block">
            {profile.avatar_url ? (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 blur-lg opacity-30" />
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="relative h-24 w-24 rounded-full border-4 border-white object-cover shadow-xl sm:h-28 sm:w-28"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl sm:h-28 sm:w-28">
                <User className="h-12 w-12 text-white sm:h-14 sm:w-14" />
              </div>
            )}
          </div>

          {/* Name & Title */}
          <h1 className="mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            {group.name}
          </h1>

          {/* Username */}
          <Link
            href={`/${profile.username}`}
            className="group mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-blue-600"
          >
            <span>@{profile.username}</span>
            <ExternalLinkIcon className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          {/* Description */}
          {group.description && (
            <p className="mb-4 text-base text-gray-600 sm:text-lg">
              {group.description}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-500">
              {profile.bio}
            </p>
          )}

          {/* Stats & Share */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
              <Eye className="h-3.5 w-3.5" />
              <span>{group.view_count.toLocaleString()} views</span>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: group.name,
                    text: group.description || `Check out ${group.name}`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 p-12 text-center backdrop-blur-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <ExternalLinkIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">No links yet</p>
              <p className="text-xs text-gray-500">Links will appear here when added</p>
            </div>
          ) : (
            items.map((item, index) => (
              <a
                key={item.id}
                href={`/api/link-redirect/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-lg sm:p-6"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideUp 0.4s ease-out forwards',
                  opacity: 0,
                }}
              >
                {/* Gradient hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-pink-50/0 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative flex items-center gap-4">
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-lg">
                        {item.title}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 transition-all group-hover:bg-blue-100 sm:h-12 sm:w-12">
                    <ExternalLinkIcon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <span>Powered by</span>
            <span className="font-semibold">HitTags</span>
          </Link>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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
