import Link from "next/link";
import { Bell, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { AppMobileNav } from "./app-mobile-nav";

export function AppTopbar() {
  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-3">
          <AppMobileNav />
          <div className="hidden flex-col text-sm sm:flex">
            <span className="font-semibold text-foreground">HitTags Paneli</span>
            <span className="text-muted-foreground text-xs">
              Koleksiyonlarını, etiketlerini ve premium içerik akışını burada yönet.
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 md:flex-none">
          <Input
            type="search"
            placeholder="Bookmark, koleksiyon veya kullanıcı ara..."
            className="bg-muted/40 text-sm"
            aria-label="Panel içi arama"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard/bookmarks/new">
              <Plus className="mr-1.5 size-4" />
              Yeni Bookmark
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="size-4" />
            <span className="sr-only">Bildirimler</span>
          </Button>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-2 py-1 pr-3 text-sm transition-colors hover:border-border hover:bg-muted/60"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-neutral-900 text-neutral-50">
                HT
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              Profilim
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
