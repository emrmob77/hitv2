import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-full bg-neutral-900 px-2 py-1 text-xs uppercase tracking-tight text-neutral-50">
            {siteConfig.name}
          </span>
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
            Sosyal Bookmark Platformu
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/50 hover:bg-muted/60 sm:inline-flex"
          >
            Ücretsiz Başla
          </Link>
          <Link
            href="/login"
            className="inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 transition-colors hover:bg-neutral-800"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </header>
  );
}
