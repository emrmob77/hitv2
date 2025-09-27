import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <span className="text-lg font-semibold text-foreground">
              {siteConfig.name}
            </span>
            <p className="max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          {siteConfig.footerLinks.map((group) => (
            <div key={group.title} className="space-y-3 text-sm">
              <p className="font-semibold text-foreground">{group.title}</p>
              <ul className="space-y-2 text-muted-foreground">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col-reverse gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} {siteConfig.name}. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link
              href={siteConfig.socialLinks.twitter}
              className="transition-colors hover:text-foreground"
            >
              Twitter
            </Link>
            <Link
              href={siteConfig.socialLinks.github}
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
            <Link
              href={siteConfig.socialLinks.linkedin}
              className="transition-colors hover:text-foreground"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
