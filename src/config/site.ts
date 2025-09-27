export type MainNavItem = {
  title: string;
  href: string;
};

export type FooterLinkGroup = {
  title: string;
  links: { title: string; href: string }[];
};

export const siteConfig = {
  name: "HitTags",
  description:
    "HitTags, modern web içeriğini keşfetmek, kaydetmek ve paylaşmak için SEO-first yaklaşımı ile tasarlanmış global sosyal bookmark platformudur.",
  url: "https://hittags.com",
  ogImage: "https://hittags.com/og-image.jpg",
  mainNav: [
    { title: "Keşfet", href: "/explore" },
    { title: "Trend", href: "/trending" },
    { title: "Etiketler", href: "/tags" },
    { title: "Fiyatlandırma", href: "/pricing" },
    { title: "Giriş Yap", href: "/login" },
  ] satisfies MainNavItem[],
  footerLinks: [
    {
      title: "Ürün",
      links: [
        { title: "Özellikler", href: "/features" },
        { title: "Fiyatlandırma", href: "/pricing" },
        { title: "API", href: "/api" },
        { title: "Tarayıcı Eklentisi", href: "/extensions" },
      ],
    },
    {
      title: "Kaynaklar",
      links: [
        { title: "Blog", href: "/blog" },
        { title: "Rehberler", href: "/guides" },
        { title: "Topluluk", href: "/community" },
        { title: "Durum", href: "/status" },
      ],
    },
    {
      title: "Destek",
      links: [
        { title: "Yardım Merkezi", href: "/support" },
        { title: "İletişim", href: "/contact" },
        { title: "Gizlilik", href: "/privacy" },
        { title: "Şartlar", href: "/terms" },
      ],
    },
  ] satisfies FooterLinkGroup[],
  socialLinks: {
    twitter: "https://twitter.com/hittags",
    github: "https://github.com/hittags",
    linkedin: "https://www.linkedin.com/company/hittags",
  },
} as const;

export type SiteConfig = typeof siteConfig;
