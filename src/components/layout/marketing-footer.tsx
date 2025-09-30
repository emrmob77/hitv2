import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">HitTags</h2>
            <p className="text-sm text-neutral-600">
              Organize, discover, and share the best bookmarks with the world.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/explore" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-neutral-600 hover:text-neutral-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-neutral-600">
              © {new Date().getFullYear()} HitTags. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-700"
              >
                <i className="fa-brands fa-twitter text-xl" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-700"
              >
                <i className="fa-brands fa-github text-xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-700"
              >
                <i className="fa-brands fa-linkedin text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
