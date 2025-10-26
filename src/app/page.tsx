import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  Users,
  Tags,
  TrendingUp,
  Share2,
  Smartphone,
  Check,
  ArrowRight,
  Play
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Organize, Discover & Share Your Web Bookmarks',
  description: 'HitTags is the social bookmark platform that helps you save, organize and discover the best content on the web. Join thousands of content curators and researchers.',
};

export default function HomePage() {
  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <section className="flex h-[600px] items-center bg-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-5xl font-bold text-neutral-900">
            Organize, Discover & Share
            <br />
            <span className="text-neutral-600">Your Web Bookmarks</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-neutral-600">
            HitTags is the social bookmark platform that helps you save, organize and discover the best content on the web. Join thousands of content curators and researchers.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" className="text-lg">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/explore">
                <Play className="mr-2 h-5 w-5" />
                Explore Platform
              </Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center space-x-8 text-neutral-500">
            <div className="text-center">
              <div className="text-2xl font-semibold text-neutral-900">50K+</div>
              <div className="text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-neutral-900">2M+</div>
              <div className="text-sm">Bookmarks Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-neutral-900">15K+</div>
              <div className="text-sm">Collections</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-neutral-900">Everything you need to manage bookmarks</h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              Powerful features designed for content curators, researchers, and anyone who loves to save and share great content.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <Bookmark className="h-6 w-6 text-neutral-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Smart Bookmarking</h3>
              <p className="text-neutral-600">
                Automatically extract metadata, tags, and descriptions from any URL. Save time with intelligent content recognition.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <Users className="h-6 w-6 text-neutral-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Social Discovery</h3>
              <p className="text-neutral-600">
                Follow other users, discover trending content, and share your collections with the community.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <Tags className="h-6 w-6 text-neutral-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Advanced Tagging</h3>
              <p className="text-neutral-600">
                Organize with smart tags, create custom collections, and find content instantly with powerful search.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <TrendingUp className="h-6 w-6 text-neutral-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Trending Insights</h3>
              <p className="text-neutral-600">
                Stay ahead with trending topics, popular bookmarks, and community insights about what's hot.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <Share2 className="h-6 w-6 text-neutral-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Easy Sharing</h3>
              <p className="text-neutral-600">
                Share individual bookmarks or entire collections across social platforms and with your team.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <Smartphone className="h-6 w-6 text-neutral-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Cross-Platform</h3>
              <p className="text-neutral-600">
                Access your bookmarks anywhere with browser extensions, mobile apps, and API integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-600 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to organize your bookmarks?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-neutral-100">
            Join thousands of users who are already saving time and discovering amazing content with HitTags.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" variant="secondary" className="text-lg">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-neutral-700 text-lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
