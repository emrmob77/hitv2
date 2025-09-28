"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type MainNavProps = {
  className?: string;
};

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Ana gezinme"
      className={cn(
        "hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:gap-8",
        className
      )}
    >
      {siteConfig.mainNav.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative transition-colors hover:text-foreground",
              isActive && "text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              {item.title}
              {item.badge ? (
                <span className="rounded-full bg-neutral-900/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-900/80">
                  {item.badge}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
