import Link from "next/link";
import { Sparkles } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const HeroIcon = siteConfig.marketing?.heroBadge?.icon ?? Sparkles;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 text-base font-semibold">
            <span className="rounded-full bg-neutral-900 px-2 py-1 text-xs uppercase tracking-tight text-neutral-50">
              {siteConfig.name}
            </span>
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              Sosyal Bookmark Platformu
            </span>
          </Link>
          {siteConfig.marketing?.heroBadge ? (
            <span className="hidden items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 sm:inline-flex">
              <HeroIcon className="size-3" />
              {siteConfig.marketing.heroBadge.text}
            </span>
          ) : null}
        </div>

        <MainNav />

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-sm font-medium text-muted-foreground sm:inline-flex">
            <Link href={siteConfig.cta.secondary.href}>{siteConfig.cta.secondary.title}</Link>
          </Button>
          <Button asChild className="text-sm font-semibold">
            <Link href={siteConfig.cta.primary.href}>{siteConfig.cta.primary.title}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
