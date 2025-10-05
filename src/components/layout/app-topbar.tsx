import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

import { signOutAction } from "@/lib/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AppMobileNav } from "./app-mobile-nav";

export async function AppTopbar() {
  let avatarLabel = "HT";

  try {
    const supabase = await createSupabaseServerClient({ strict: false });
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      avatarLabel = deriveInitials(
        user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email ||
          user?.user_metadata?.email
      );
    }
  } catch (error) {
    console.warn("Kullanıcı avatar bilgisini getirirken hata oluştu", error);
  }

  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-3">
          <AppMobileNav />
          <div className="hidden flex-col text-sm sm:flex">
            <span className="font-semibold text-foreground">HitTags Console</span>
            <span className="text-muted-foreground text-xs">
              Manage your collections, tags, and premium drops from a single place.
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 md:flex-none">
          <Input
            type="search"
            placeholder="Search bookmarks, collections, or users..."
            className="bg-muted/40 text-sm"
            aria-label="Dashboard search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard/bookmarks/new">
              <Plus className="mr-1.5 size-4" />
              Add bookmark
            </Link>
          </Button>
          <NotificationDropdown />
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              className="inline-flex items-center gap-2 border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-neutral-900 text-neutral-50">
                  {avatarLabel}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

function deriveInitials(source?: string | null) {
  if (!source) return "HT";
  const cleaned = source.trim();
  if (!cleaned) return "HT";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const [first] = parts;
    return (first.slice(0, 2) || "HT").toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const result = `${first}${second}`.trim();
  return (result || parts[0]?.slice(0, 2) || "HT").toUpperCase();
}
