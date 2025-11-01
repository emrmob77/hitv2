import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { GlobalSearchBar } from "@/components/search/global-search-bar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Explore", href: "/explore" },
  { title: "Trending", href: "/trending" },
  { title: "Pricing", href: "/pricing" },
];

export async function MarketingHeader() {
  let isAuthenticated = false;
  let userProfile = null;
  let avatarLabel = 'HT';

  try {
    const supabase = await createSupabaseServerClient({ strict: false });
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;

        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, is_admin')
          .eq('id', user.id)
          .single();

        userProfile = profile;

        avatarLabel = deriveInitials(
          profile?.display_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email ||
            user.user_metadata?.email
        );
      }
    }
  } catch {
    isAuthenticated = false;
  }

  return (
    <header id="header" className="border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                href="/"
                aria-label="HitTags homepage"
                className="text-2xl font-semibold text-neutral-900"
              >
                HitTags
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-neutral-500 hover:text-neutral-700 px-3 py-2 text-sm"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <GlobalSearchBar />
            </div>
            {isAuthenticated ? (
              <>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/dashboard/bookmarks/new">
                    <Plus className="mr-1.5 size-4" />
                    Add Bookmark
                  </Link>
                </Button>
                <NotificationDropdown />
                <UserDropdown
                  userProfile={userProfile}
                  avatarLabel={avatarLabel}
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-neutral-500 hover:text-neutral-900 px-3 py-2 text-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-neutral-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-neutral-700"
                >
                  Start for free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function deriveInitials(source?: string | null) {
  if (!source) return 'HT';
  const cleaned = source.trim();
  if (!cleaned) return 'HT';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const [first] = parts;
    return (first.slice(0, 2) || 'HT').toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  const result = `${first}${second}`.trim();
  return (result || parts[0]?.slice(0, 2) || 'HT').toUpperCase();
}
