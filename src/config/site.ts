import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookMarked,
  Crown,
  FolderClosed,
  LayoutDashboard,
  Settings,
  Sparkles,
  Tags,
} from "lucide-react";

export type MainNavItem = {
  title: string;
  href: string;
  description?: string;
  badge?: string;
};

export type FooterLinkGroup = {
  title: string;
  links: { title: string; href: string }[];
};

export type AppNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
};

export const siteConfig = {
  name: "HitTags",
  description:
    "HitTags, modern web içeriğini keşfetmek, kaydetmek ve paylaşmak için SEO-first yaklaşımı ile tasarlanmış global sosyal bookmark platformudur.",
  url: "https://hittags.com",
  ogImage: "https://hittags.com/og-image.jpg",
  mainNav: [
    { title: "Keşfet", href: "/explore" },
    { title: "Trend", href: "/trending", badge: "Güncel" },
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
  appNav: [
    {
      title: "Kontrol Paneli",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Kişiselleştirilmiş özet ve metrikler",
    },
    {
      title: "Bookmarklar",
      href: "/dashboard/bookmarks",
      icon: BookMarked,
      description: "Kaydettiğin tüm linkleri yönet",
    },
    {
      title: "Koleksiyonlar",
      href: "/dashboard/collections",
      icon: FolderClosed,
      description: "İş birliğine açık kürasyon listeleri",
    },
    {
      title: "Etiketler",
      href: "/dashboard/tags",
      icon: Tags,
      description: "Trend olan temalar ve SEO verileri",
    },
    {
      title: "Analitik",
      href: "/dashboard/analytics",
      icon: BarChart3,
      description: "Performans, trafik ve dönüşüm raporları",
    },
    {
      title: "Premium Studio",
      href: "/dashboard/premium",
      icon: Crown,
      badge: "Yeni",
      description: "URL'siz premium içerik üretici araçları",
    },
    {
      title: "Ayarlar",
      href: "/dashboard/settings",
      icon: Settings,
      description: "Profil, güvenlik ve entegrasyonlar",
    },
  ] satisfies AppNavItem[],
  cta: {
    primary: { title: "Ücretsiz Başlayın", href: "/signup" },
    secondary: { title: "Demo Talep Et", href: "/contact" },
  },
  highlights: {
    heroStats: [
      { label: "Aktif Kullanıcı", value: "48K+" },
      { label: "Küratör Koleksiyonu", value: "12K" },
      { label: "Ortalama Kaydetme Süresi", value: "2 dk" },
    ],
    features: [
      {
        title: "SEO-first mimari",
        description:
          "SSR, SSG ve ISR kombinasyonu ile tag ve koleksiyon sayfalarında maksimum görünürlük elde edin.",
      },
      {
        title: "Topluluk odaklı kürasyon",
        description:
          "Takip, beğeni ve yorum akışlarıyla içerik keşfini hızlandırın, kişiselleştirilmiş feed oluşturun.",
      },
      {
        title: "Premium içerik stüdyosu",
        description:
          "URL'siz içerik yayınlayın, medya yükleyin ve abonelik modelleriyle gelir elde edin.",
      },
    ],
    workflow: [
      {
        title: "Kaydet",
        description:
          "Tarayıcı eklentileri ve paylaşım menüsü ile tek tıklamada bookmark ekleyin.",
      },
      {
        title: "Organize et",
        description:
          "Etiketler, koleksiyonlar ve AI destekli otomasyonlarla aradığınızı saniyeler içinde bulun.",
      },
      {
        title: "Paylaş & Analiz et",
        description:
          "Trend algoritmaları, link analitiği ve performans raporlarıyla değer yaratın.",
      },
    ],
    testimonials: [
      {
        name: "Lara Yılmaz",
        role: "Growth Lead @Monochrome",
        quote:
          "HitTags sayesinde içerik kürasyon ekibimiz 5 kata kadar daha hızlı koleksiyon hazırlıyor ve SEO trafiğimiz %32 arttı.",
      },
      {
        name: "Deniz Arman",
        role: "Ürün Tasarımcısı",
        quote:
          "Premium Studio, abonelerime tavsiye listelerini video ve dokümanlarla paylaşmamı sağladı. Gelirlerim ikiye katlandı.",
      },
    ],
  },
  socialLinks: {
    twitter: "https://twitter.com/hittags",
    github: "https://github.com/hittags",
    linkedin: "https://www.linkedin.com/company/hittags",
  },
  badges: {
    roadmap: { title: "Roadmap", href: "/roadmap", label: "Yakında" },
    changelog: { title: "Changelog", href: "/changelog" },
  },
  marketing: {
    announcement: {
      label: "Yeni lansman",
      href: "/blog/seo-first-bookmark-platform",
      text: "SEO-first bookmark deneyimi şimdi beta'da",
    },
    secondaryCta: {
      title: "Fiyatlandırmayı gör",
      href: "/pricing",
    },
    heroBadge: {
      icon: Sparkles,
      text: "Editörlerin seçimi",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
