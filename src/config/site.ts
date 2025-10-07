import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookMarked,
  DollarSign,
  FileText,
  FolderClosed,
  LayoutDashboard,
  Link2,
  Settings,
  Sparkles,
  Tags,
  Rss,
  Activity,
  Star,
  Heart,
  Bookmark,
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
    "HitTags is a global social bookmarking platform designed with a SEO-first mindset to help you discover, save, and share the best content on the web.",
  url: "https://hittags.com",
  ogImage: "/api/og",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Explore", href: "/explore" },
    { title: "Trending", href: "/trending", badge: "New" },
    { title: "Pricing", href: "/pricing" },
    { title: "Sign in", href: "/login" },
  ] satisfies MainNavItem[],
  footerLinks: [
    {
      title: "Product",
      links: [
        { title: "Features", href: "/features" },
        { title: "Pricing", href: "/pricing" },
        { title: "API", href: "/api" },
        { title: "Browser Extension", href: "/extensions" },
      ],
    },
    {
      title: "Resources",
      links: [
        { title: "Blog", href: "/blog" },
        { title: "Guides", href: "/guides" },
        { title: "Community", href: "/community" },
        { title: "Status", href: "/status" },
      ],
    },
    {
      title: "Support",
      links: [
        { title: "Help Center", href: "/support" },
        { title: "Contact", href: "/contact" },
        { title: "Privacy", href: "/privacy" },
        { title: "Terms", href: "/terms" },
      ],
    },
  ] satisfies FooterLinkGroup[],
  appNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Personalised overview and live metrics",
    },
    {
      title: "Feed",
      href: "/dashboard/feed",
      icon: Rss,
      description: "Bookmarks from people you follow",
    },
    {
      title: "Activity",
      href: "/dashboard/activity",
      icon: Activity,
      description: "See what your network is doing",
    },
    {
      title: "Bookmarks",
      href: "/dashboard/bookmarks",
      icon: BookMarked,
      description: "Manage every link you&apos;ve captured",
    },
    {
      title: "Saved",
      href: "/dashboard/saved",
      icon: Bookmark,
      description: "Bookmarks you've saved",
    },
    {
      title: "Collections",
      href: "/dashboard/collections",
      icon: FolderClosed,
      description: "Collaborative curation lists",
    },
    {
      title: "Tags",
      href: "/dashboard/tags",
      icon: Tags,
      description: "Trending topics and SEO signals",
    },
    {
      title: "Premium Posts",
      href: "/dashboard/posts",
      icon: FileText,
      badge: "Pro",
      description: "Create exclusive content for subscribers",
    },
    {
      title: "Link Groups",
      href: "/dashboard/link-groups",
      icon: Link2,
      badge: "Pro",
      description: "Your personal link-in-bio pages",
    },
    {
      title: "Affiliate Links",
      href: "/dashboard/affiliate",
      icon: DollarSign,
      badge: "Pro",
      description: "Track affiliate links and earnings",
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      description: "Performance, traffic, and conversion reports",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      description: "Profile, security, and integrations",
    },
  ] satisfies AppNavItem[],
  cta: {
    primary: { title: "Start for free", href: "/signup" },
    secondary: { title: "Request a demo", href: "/contact" },
  },
  highlights: {
    heroStats: [
      { label: "Active users", value: "48K+" },
      { label: "Curated collections", value: "12K" },
      { label: "Average save time", value: "2 min" },
    ],
    features: [
      {
        title: "SEO-first architecture",
        description:
          "Combine SSR, SSG, and ISR to maximise visibility across tag and collection pages.",
      },
      {
        title: "Community-powered curation",
        description:
          "Accelerate discovery with follows, likes, and comments, and deliver personalised feeds.",
      },
      {
        title: "Premium content studio",
        description:
          "Publish URL-free drops, upload media, and monetise with subscription models.",
      },
    ],
    workflow: [
      {
        title: "Save",
        description:
          "Add bookmarks with a single click using the browser extension or share sheet.",
      },
      {
        title: "Organise",
        description:
          "Find anything in seconds with tags, collections, and AI-assisted automation.",
      },
      {
        title: "Share & analyse",
        description:
          "Unlock value with trending algorithms, link analytics, and performance insights.",
      },
    ],
    testimonials: [
      {
        name: "Lara Yılmaz",
        role: "Growth Lead @Monochrome",
        quote:
          "HitTags helped our curation team ship collections 5x faster while lifting organic traffic by 32%.",
      },
      {
        name: "Deniz Arman",
        role: "Product Designer",
        quote:
          "Premium Studio let me share recommendation packs with video and docs—my subscriber revenue doubled in weeks.",
      },
    ],
  },
  socialLinks: {
    twitter: "https://twitter.com/hittags",
    github: "https://github.com/hittags",
    linkedin: "https://www.linkedin.com/company/hittags",
  },
  badges: {
    roadmap: { title: "Roadmap", href: "/roadmap", label: "Coming soon" },
    changelog: { title: "Changelog", href: "/changelog" },
  },
  marketing: {
    announcement: {
      label: "New launch",
      href: "/blog/seo-first-bookmark-platform",
      text: "The SEO-first bookmarking experience is now in beta",
    },
    secondaryCta: {
      title: "See pricing",
      href: "/pricing",
    },
    heroBadge: {
      icon: Sparkles,
      text: "Editors&apos; choice",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
