"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/80 bg-muted/20 px-4 py-6 md:flex lg:w-72">
      <div className="flex w-full flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Overview
          </p>
          <nav className="space-y-1">
            {siteConfig.appNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-neutral-900 text-neutral-50 shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 truncate font-medium">{item.title}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-50">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            Upgrade to Premium Studio
          </p>
          <p className="text-xs text-muted-foreground">
            Deliver subscriber-only drops with the URL-free studio, tap into link analytics, and unlock revenue sharing tools.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-700"
          >
            Explore plans →
          </Link>
        </div>
      </div>
    </aside>
  );
}
