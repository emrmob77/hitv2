"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Plus, UserRound, Sparkles } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileNavProps = {
  className?: string;
  isAuthenticated: boolean;
  navItems?: { title: string; href: string }[];
};

export function MobileNav({ className, isAuthenticated, navItems }: MobileNavProps) {
  const pathname = usePathname();
  const items = navItems ?? siteConfig.mainNav.map((item) => ({ title: item.title, href: item.href }));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex h-full flex-col p-0">
        <SheetHeader className="border-b border-border bg-muted/40">
          <SheetTitle className="flex items-center gap-2 text-left text-sm font-semibold">
            <span className="rounded-full bg-neutral-900 px-2 py-1 text-xs uppercase tracking-tight text-neutral-50">
              {siteConfig.name}
            </span>
            <span className="text-muted-foreground">Social bookmark platform</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {siteConfig.marketing?.announcement ? (
            <Link
              href={siteConfig.marketing.announcement.href}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm transition-colors hover:border-border hover:bg-muted/70"
            >
              <Sparkles className="size-4 text-neutral-500" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {siteConfig.marketing.announcement.label}
                </span>
                <span className="text-sm text-foreground">
                  {siteConfig.marketing.announcement.text}
                </span>
              </div>
            </Link>
          ) : null}

          <div className="space-y-1">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
              Navigation
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-neutral-900 text-neutral-50"
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
              What you can do with HitTags
            </p>
            <ul className="space-y-2">
              {siteConfig.highlights.features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm"
                >
                  <p className="font-semibold text-foreground">{feature.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <SheetFooter className="border-t border-border bg-muted/40">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                placeholder="Search bookmarks..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-9 py-2 text-sm focus:border-[var(--hit-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)]"
              />
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/bookmarks/new"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[var(--hit-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--hit-primary-dark)]"
                >
                  <Plus className="size-4" />
                  Add bookmark
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
                >
                  <UserRound className="size-4" />
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[var(--hit-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--hit-primary-dark)]"
                >
                  Start for free
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
