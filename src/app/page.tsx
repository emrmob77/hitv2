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
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Globe,
  BarChart3,
  FolderOpen,
  Star,
  CheckCircle2,
  Chrome,
  Database,
  Link as LinkIcon,
  Target,
  Microscope,
  Briefcase
} from 'lucide-react';
import { MarketingHeader } from '@/components/layout/marketing-header';
import { MarketingFooter } from '@/components/layout/marketing-footer';

export const metadata: Metadata = {
  title: 'HitTags - Smart Bookmark Manager for Modern Web',
  description: 'The ultimate social bookmark platform. Save, organize, discover and monetize web content. Features: Smart bookmarking, Collections, Affiliate links, Analytics & more.',
  keywords: 'bookmarks, bookmark manager, social bookmarking, content curation, affiliate links, link management',
  openGraph: {
    title: 'HitTags - Smart Bookmark Manager',
    description: 'Save, organize and monetize your web bookmarks with HitTags',
    type: 'website',
  }
};

export default function HomePage() {
  return (
    <div className="marketing-html min-h-screen">
      <div className="data-html flex min-h-screen flex-col">
        <MarketingHeader />
        <main className="flex-1">
          {/* Hero Section - Modern gradient background */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-blue-100 opacity-50 blur-3xl" />
              <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-purple-100 opacity-50 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-pink-100 opacity-50 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
                {/* Left column - Text content */}
                <div className="flex flex-col justify-center">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5 w-fit">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">New: Browser Extension Available</span>
                  </div>

                  <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                    Your Bookmarks,
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Supercharged
                    </span>
                  </h1>

                  <p className="mb-8 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
                    The all-in-one platform to save, organize, discover and <strong>monetize</strong> web content.
                    Join thousands of content creators, researchers and marketers.
                  </p>

                  {/* Key features list */}
                  <div className="mb-8 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Smart AI tagging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Affiliate link management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Real-time collaboration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Advanced analytics</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Button asChild size="lg" className="text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all">
                      <Link href="/signup">
                        Start Free - No Credit Card
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-base border-2 hover:bg-gray-50">
                      <Link href="/explore">
                        <Globe className="mr-2 h-5 w-5" />
                        Explore Public Bookmarks
                      </Link>
                    </Button>
                  </div>

                  {/* Trust indicators */}
                  <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span><strong>4.9/5</strong> user rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span><strong>50K+</strong> active users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-purple-600" />
                      <span><strong>2M+</strong> bookmarks</span>
                    </div>
                  </div>
                </div>

                {/* Right column - Visual showcase */}
                <div className="relative hidden lg:flex items-center justify-center">
                  <div className="relative">
                    {/* Main card - mock browser/dashboard */}
                    <div className="relative rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-12 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100" />
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-24 rounded-lg bg-gray-100" />
                          <div className="h-24 rounded-lg bg-gray-100" />
                          <div className="h-24 rounded-lg bg-gray-100" />
                        </div>
                        <div className="h-8 rounded-lg bg-gray-100" />
                        <div className="h-8 w-2/3 rounded-lg bg-gray-100" />
                      </div>
                    </div>

                    {/* Floating elements */}
                    <div className="absolute -right-4 -top-4 rounded-xl bg-green-500 p-3 shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 rounded-xl bg-purple-500 p-3 shadow-lg">
                      <LinkIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="border-y border-gray-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                <div className="text-center">
                  <div className="mb-2 text-4xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-4xl font-bold text-gray-900">2M+</div>
                  <div className="text-sm text-gray-600">Bookmarks Saved</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-4xl font-bold text-gray-900">15K+</div>
                  <div className="text-sm text-gray-600">Collections</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-4xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid - Enhanced */}
          <section className="bg-gray-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900">
                  Everything You Need in One Place
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  Powerful features designed for modern content management
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature Cards */}
                <FeatureCard
                  icon={<Bookmark className="h-6 w-6 text-slate-700" />}
                  title="Smart Bookmarking"
                  description="Auto-extract metadata, thumbnails, and descriptions. Browser extension for one-click saves."
                />
                <FeatureCard
                  icon={<FolderOpen className="h-6 w-6 text-slate-700" />}
                  title="Collections & Tags"
                  description="Organize with unlimited collections, smart tags, and AI-powered categorization."
                />
                <FeatureCard
                  icon={<LinkIcon className="h-6 w-6 text-slate-700" />}
                  title="Affiliate Link Manager"
                  description="Create, track and monetize affiliate links with built-in analytics and QR codes."
                />
                <FeatureCard
                  icon={<Users className="h-6 w-6 text-slate-700" />}
                  title="Social Discovery"
                  description="Follow users, discover trending content, and share collections with your community."
                />
                <FeatureCard
                  icon={<BarChart3 className="h-6 w-6 text-slate-700" />}
                  title="Advanced Analytics"
                  description="Track clicks, engagement, and ROI with comprehensive analytics dashboard."
                />
                <FeatureCard
                  icon={<Zap className="h-6 w-6 text-slate-700" />}
                  title="Developer API"
                  description="RESTful API, GraphQL, webhooks, and Zapier integration for automation."
                />
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900">
                  Trusted by Professionals Worldwide
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  From individual creators to enterprise teams
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <UseCaseCard
                  icon={<Target className="h-6 w-6 text-slate-700" />}
                  title="Content Creators"
                  description="Build your brand with curated collections. Share valuable content and monetize your expertise through affiliate partnerships."
                  features={["Custom link pages", "Revenue tracking", "Engagement metrics"]}
                />
                <UseCaseCard
                  icon={<Microscope className="h-6 w-6 text-slate-700" />}
                  title="Research Teams"
                  description="Streamline academic research with smart organization. Collaborate seamlessly and maintain comprehensive citation databases."
                  features={["Advanced categorization", "Team collaboration", "Export citations"]}
                />
                <UseCaseCard
                  icon={<Briefcase className="h-6 w-6 text-slate-700" />}
                  title="Enterprise Marketing"
                  description="Coordinate marketing campaigns at scale. Track performance metrics and optimize content strategy with data-driven insights."
                  features={["Campaign management", "Performance analytics", "Team workspaces"]}
                />
              </div>
            </div>
          </section>

          {/* Integration Section */}
          <section className="bg-gray-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900">
                  Works Everywhere You Do
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  Access your bookmarks on any device, anytime
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center transition-all hover:border-gray-300 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200">
                    <Chrome className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">Browser Extension</h3>
                  <p className="text-sm text-gray-600">Chrome, Firefox, Edge</p>
                </div>
                <div className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center transition-all hover:border-gray-300 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">Mobile Apps</h3>
                  <p className="text-sm text-gray-600">iOS & Android</p>
                </div>
                <div className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center transition-all hover:border-gray-300 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200">
                    <Database className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">API Access</h3>
                  <p className="text-sm text-gray-600">REST & GraphQL</p>
                </div>
                <div className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center transition-all hover:border-gray-300 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">Integrations</h3>
                  <p className="text-sm text-gray-600">Zapier, Webhooks</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section - Enhanced */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                Ready to Transform Your Bookmarks?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
                Join 50,000+ users who are already organizing and monetizing their content with HitTags.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="text-base shadow-xl hover:scale-105 transition-transform">
                  <Link href="/signup">
                    Start Free - No Credit Card
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-base text-white hover:bg-white/10"
                >
                  <Link href="/pricing">
                    <Star className="mr-2 h-5 w-5" />
                    View Pricing
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-white/75">
                Free plan available • No credit card required • Upgrade anytime
              </p>
            </div>
          </section>
        </main>
        <MarketingFooter />
      </div>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 transition-all hover:border-gray-300 hover:shadow-lg">
      {/* Icon container - consistent minimal design */}
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
        {icon}
      </div>

      {/* Content */}
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function UseCaseCard({ icon, title, description, features }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 transition-all hover:border-gray-300 hover:shadow-lg">
      {/* Icon container */}
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
        {icon}
      </div>

      {/* Content */}
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-600 leading-relaxed">{description}</p>

      {/* Features list - minimal style */}
      <div className="space-y-2 border-t border-gray-100 pt-6">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
