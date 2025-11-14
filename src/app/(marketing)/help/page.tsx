import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  MessageSquare,
  Video,
  FileText,
  Search,
  Sparkles,
  HelpCircle,
  Zap,
  Users,
  Settings
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center - HitTags',
  description: 'Find answers to your questions and learn how to get the most out of HitTags.',
};

const categories = [
  {
    icon: Zap,
    title: 'Getting Started',
    description: 'Learn the basics and set up your account',
    articles: 12,
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: BookOpen,
    title: 'Bookmarking',
    description: 'Master saving and organizing bookmarks',
    articles: 18,
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Work with teams and share collections',
    articles: 10,
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    description: 'Manage your profile and preferences',
    articles: 15,
    color: 'from-green-500 to-green-600',
  },
];

const popularArticles = [
  'How to create your first bookmark',
  'Organizing bookmarks with tags',
  'Sharing collections with your team',
  'Setting up browser extensions',
  'Using keyboard shortcuts',
  'Managing privacy settings',
];

export default function HelpPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <HelpCircle className="mr-2 h-4 w-4 text-blue-600" />
              Help Center
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                How can we help?
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-xl text-slate-600">
              Search our knowledge base or browse categories to find answers to your questions.
            </p>

            {/* Search */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search for help..."
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-12 pr-4 text-lg shadow-lg transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Browse by Category
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Find what you're looking for</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.title}
                href="#"
                className="group rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} shadow-lg transition-transform group-hover:scale-110`}>
                  <category.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{category.title}</h3>
                <p className="mb-4 text-sm text-slate-600">{category.description}</p>
                <div className="text-sm font-semibold text-blue-600">
                  {category.articles} articles →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <FileText className="mr-2 h-4 w-4" />
              Popular Articles
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Most viewed this week</h2>
          </div>

          <div className="space-y-3">
            {popularArticles.map((article, index) => (
              <Link
                key={article}
                href="#"
                className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1 text-lg font-semibold text-slate-900">{article}</div>
                <div className="text-blue-600">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border-2 border-slate-100 bg-white p-12 shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Still need help?</h2>
            <p className="mb-8 text-lg text-slate-600">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
