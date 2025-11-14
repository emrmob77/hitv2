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
  Play,
  Zap,
  Shield,
  Globe,
  Star,
  Sparkles,
  Rocket,
  BarChart3,
  Heart,
  MessageCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'HitTags - Organize, Discover & Share Your Web Bookmarks',
  description: 'The modern social bookmark platform that helps you save, organize and discover the best content on the web. Join thousands of content curators and researchers worldwide.',
};

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute -right-4 top-40 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-pink-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
              New: AI-powered bookmark organization is here!
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center">
            <h1 className="mb-6 text-6xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Organize & Discover
              </span>
              <br />
              <span className="text-slate-900">Your Web Bookmarks</span>
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600">
              The modern social bookmark platform for content curators, researchers, and web enthusiasts.
              Save, organize, and share the best content on the web with powerful tools and intelligent features.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
              >
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 border-2 border-slate-300 px-8 text-lg font-semibold hover:border-slate-400 hover:bg-slate-50"
              >
                <Link href="/explore">
                  <Play className="mr-2 h-5 w-5" />
                  Explore Platform
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900">50K+</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Bookmark className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900">2M+</div>
                <div className="text-sm text-slate-600">Bookmarks Saved</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900">15K+</div>
                <div className="text-sm text-slate-600">Collections</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <Rocket className="mr-2 h-4 w-4" />
              Powerful Features
            </div>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">Everything you need to manage bookmarks</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Designed for content curators, researchers, and anyone who loves to save and share great content.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-8 transition-all hover:border-blue-200 hover:shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 blur-2xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Bookmark className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Smart Bookmarking</h3>
                <p className="text-slate-600">
                  Automatically extract metadata, tags, and descriptions from any URL. Save time with intelligent content recognition.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-8 transition-all hover:border-purple-200 hover:shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 blur-2xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Social Discovery</h3>
                <p className="text-slate-600">
                  Follow other users, discover trending content, and share your collections with a global community of curators.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-8 transition-all hover:border-pink-200 hover:shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 opacity-10 blur-2xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                  <Tags className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Advanced Tagging</h3>
                <p className="text-slate-600">
                  Organize with smart tags, create custom collections, and find content instantly with powerful search.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-8 transition-all hover:border-orange-200 hover:shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 blur-2xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Trending Insights</h3>
                <p className="text-slate-600">
                  Stay ahead with trending topics, popular bookmarks, and community insights about what's hot right now.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-8 transition-all hover:border-green-200 hover:shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 opacity-10 blur-2xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <Share2 className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Easy Sharing</h3>
                <p className="text-slate-600">
                  Share individual bookmarks or entire collections across social platforms and collaborate with your team.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-8 transition-all hover:border-indigo-200 hover:shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-10 blur-2xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Advanced Analytics</h3>
                <p className="text-slate-600">
                  Track engagement, analyze trends, and understand your audience with comprehensive analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500 opacity-10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500 opacity-10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-white">99.9%</div>
              <div className="text-sm text-blue-200">Uptime</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-white">150+</div>
              <div className="text-sm text-blue-200">Countries</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-white">4.9/5</div>
              <div className="text-sm text-blue-200">User Rating</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-white">24/7</div>
              <div className="text-sm text-blue-200">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
              <MessageCircle className="mr-2 h-4 w-4" />
              Testimonials
            </div>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">Loved by content curators worldwide</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              See what our users have to say about their experience with HitTags.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-slate-700">
                "HitTags has completely transformed how I organize my research. The tagging system is brilliant and the social features help me discover amazing content I wouldn't have found otherwise."
              </p>
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white">
                  SK
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah Kim</div>
                  <div className="text-sm text-slate-600">UX Researcher</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-slate-700">
                "As a content creator, I save dozens of links daily. HitTags makes it effortless to organize everything and share curated collections with my audience. Game changer!"
              </p>
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-lg font-bold text-white">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Michael Johnson</div>
                  <div className="text-sm text-slate-600">Content Creator</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-slate-700">
                "The team collaboration features are outstanding. We use HitTags to share research across our entire department. It's become an essential tool for our workflow."
              </p>
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-lg font-bold text-white">
                  AL
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Anna Lee</div>
                  <div className="text-sm text-slate-600">Team Lead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <Zap className="mr-2 h-5 w-5 text-yellow-300" />
            <span className="text-sm font-semibold text-white">Start organizing in seconds</span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to organize your digital life?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100">
            Join thousands of users who are already saving time and discovering amazing content with HitTags. No credit card required.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 border-2 border-white bg-white px-8 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
            >
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 border-2 border-white bg-transparent px-8 text-lg font-semibold text-white hover:bg-white/10"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-300" />
              Free 14-day trial
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-300" />
              No credit card
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-300" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
