"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Uygulama menüsünü aç"
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
            <span className="text-muted-foreground">Kontrol Paneli</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
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
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                    active
                      ? "bg-neutral-900 text-neutral-50"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="flex-1 truncate font-medium">{item.title}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-neutral-900/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-50">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
