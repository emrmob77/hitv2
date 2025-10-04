import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Explore", href: "/explore" },
  { title: "Trending", href: "/trending" },
  { title: "Pricing", href: "/pricing" },
];

export async function MarketingHeader() {
  let isAuthenticated = false;
  let userInitials = 'HT';

  try {
    const supabase = await createSupabaseServerClient({ strict: false });
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
        userInitials = deriveInitials(
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
              <h1 className="text-2xl text-neutral-900">HitTags</h1>
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
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <input
                type="search"
                placeholder="Search bookmarks..."
                className="w-64 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              />
              <i className="fa-solid fa-search absolute left-3 top-3 text-neutral-400" />
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/bookmark/new"
                  className="bg-neutral-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-neutral-700"
                >
                  <i className="fa-solid fa-plus mr-2" />
                  Add Bookmark
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <i className="fa-regular fa-bell text-xl" />
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                    {userInitials}
                  </span>
                </Link>
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
