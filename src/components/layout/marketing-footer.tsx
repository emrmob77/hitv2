import Link from "next/link";
import {
  Twitter,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Bookmark,
  Heart,
  Sparkles
} from "lucide-react";

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Bookmark className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">HitTags</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              The modern social bookmark platform for organizing, discovering, and sharing the best content on the web. Join thousands of content curators worldwide.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all hover:bg-blue-500 hover:text-white hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all hover:bg-slate-700 hover:text-white hover:scale-110"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all hover:bg-blue-600 hover:text-white hover:scale-110"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-white">Stay Updated</h3>
              <div className="mt-3 flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-l-lg border-0 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="rounded-r-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
            {/* Product */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/explore"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Explore
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trending"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Trending
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Features
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/features/bookmarking"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Smart Bookmarking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features/collaboration"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Collaboration
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features/analytics"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features/api"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    API Access
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/help"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community-guidelines"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Guidelines
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="group flex items-center text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>© {currentYear} HitTags.</span>
            <span className="flex items-center">
              Made with <Heart className="mx-1 h-4 w-4 fill-red-500 text-red-500" /> for the web
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Powered by Next.js & Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
