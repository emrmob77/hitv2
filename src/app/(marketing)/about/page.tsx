import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Target,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Heart,
  Globe,
  Zap,
  Shield,
  Rocket
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - HitTags',
  description: 'Learn about HitTags mission to revolutionize how people organize, discover, and share web bookmarks.',
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
              About HitTags
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              Building the future of
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                web bookmarking
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-slate-600">
              We're on a mission to help millions of people organize, discover, and share the best content on the web.
              Join us in revolutionizing how the world saves and shares knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
                <Target className="mr-2 h-4 w-4" />
                Our Mission
              </div>
              <h2 className="mb-6 text-4xl font-bold text-slate-900">
                Empowering content curators worldwide
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                HitTags was founded with a simple belief: the web is full of amazing content, but it's getting harder to organize and rediscover what matters most. We set out to build a platform that makes bookmarking not just functional, but delightful.
              </p>
              <p className="text-lg leading-relaxed text-slate-600">
                Today, we serve over 50,000 users across 150+ countries, helping researchers, content creators, and knowledge workers save time and discover great content every day.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900">50K+</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>

              <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900">150+</div>
                <div className="text-sm text-slate-600">Countries</div>
              </div>

              <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900">2M+</div>
                <div className="text-sm text-slate-600">Bookmarks</div>
              </div>

              <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900">99.9%</div>
                <div className="text-sm text-slate-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
              <Heart className="mr-2 h-4 w-4" />
              Our Values
            </div>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">What drives us every day</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Our core values guide everything we do, from product decisions to how we treat our community.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">User First</h3>
              <p className="text-slate-600">
                Every feature we build starts with understanding our users' needs. Your feedback shapes our roadmap.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Privacy & Security</h3>
              <p className="text-slate-600">
                Your data is yours. We use industry-leading security practices and never sell your information.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                <Rocket className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Innovation</h3>
              <p className="text-slate-600">
                We're constantly pushing boundaries with AI, automation, and new ways to organize information.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Open & Inclusive</h3>
              <p className="text-slate-600">
                We're building for everyone, everywhere. HitTags is accessible and welcoming to all.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Quality</h3>
              <p className="text-slate-600">
                We sweat the details. Every pixel, every interaction is crafted with care and attention.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Community</h3>
              <p className="text-slate-600">
                We're building more than software—we're fostering a community of passionate curators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Join us on our mission
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100">
            Whether you're a user, partner, or looking to join our team, we'd love to hear from you.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 border-2 border-white bg-white px-8 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
            >
              <Link href="/careers">View Open Positions</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 border-2 border-white bg-transparent px-8 text-lg font-semibold text-white hover:bg-white/10"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
