import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";

import { siteConfig } from "@/config/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

import { MobileNav } from "./mobile-nav";

const marketingNav = [
  { title: "Anasayfa", href: "/" },
  { title: "Keşfet", href: "/explore" },
  { title: "Trending", href: "/trending" },
  { title: "Fiyatlandırma", href: "/pricing" },
];

export async function SiteHeader() {
  let isAuthenticated = false;

  try {
    const supabase = await createSupabaseServerClient({ strict: false });
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      isAuthenticated = Boolean(session?.user);
    }
  } catch (error) {
    console.warn("Supabase session kontrolü başarısız", error);
    isAuthenticated = false;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <MobileNav isAuthenticated={isAuthenticated} navItems={marketingNav} />
          <Link href="/" className="text-2xl font-semibold text-neutral-900">
            {siteConfig.name}
          </Link>
          <nav className="hidden md:ml-8 md:flex md:space-x-6">
            {marketingNav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition",
                  index === 0
                    ? "text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Bookmark ara..."
              className="w-64 rounded-lg border border-neutral-300 bg-neutral-50 px-9 py-2 text-sm focus:border-[var(--hit-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)]"
            />
          </div>

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/bookmarks/new"
                className="hidden items-center gap-2 rounded-lg bg-[var(--hit-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--hit-primary-dark)] sm:flex"
              >
                <Plus className="size-4" />
                Bookmark ekle
              </Link>
              <Link
                href="/dashboard"
                className="hidden rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 md:flex"
              >
                Panel
              </Link>
              <Link
                href="/dashboard/notifications"
                className="hidden rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900 md:flex"
              >
                <Bell className="size-4" />
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
                >
                  Çıkış yap
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                Giriş yap
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border-2 border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
              >
                Ücretsiz Başla
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
