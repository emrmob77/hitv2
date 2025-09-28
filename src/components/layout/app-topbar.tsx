import Link from "next/link";
import { Bell, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { signOutAction } from "@/lib/auth/actions";

import { AppMobileNav } from "./app-mobile-nav";

export function AppTopbar() {
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
          <Button variant="ghost" size="icon">
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              className="inline-flex items-center gap-2 border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-neutral-900 text-neutral-50">
                  HT
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
