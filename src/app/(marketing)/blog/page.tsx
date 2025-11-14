import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Calendar, User, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - HitTags',
  description: 'Latest news, updates, and insights from the HitTags team.',
};

const posts = [
  {
    title: 'Introducing AI-Powered Bookmark Organization',
    excerpt: 'Learn how our new AI features can automatically categorize and tag your bookmarks, saving you hours of manual work.',
    author: 'Sarah Kim',
    date: 'November 10, 2025',
    category: 'Product Updates',
    image: '/blog/ai-organization.jpg',
  },
  {
    title: '10 Tips for Better Bookmark Management',
    excerpt: 'Master the art of organizing your digital content with these proven strategies from power users.',
    author: 'Michael Chen',
    date: 'November 8, 2025',
    category: 'Tips & Tricks',
    image: '/blog/tips.jpg',
  },
  {
    title: 'Building a Remote-First Company Culture',
    excerpt: 'How we built a thriving remote team across 20+ countries and what we learned along the way.',
    author: 'Emma Wilson',
    date: 'November 5, 2025',
    category: 'Company',
    image: '/blog/remote-culture.jpg',
  },
];

export default function BlogPage() {
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
              <BookOpen className="mr-2 h-4 w-4 text-blue-600" />
              Blog
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Stories & Updates
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-slate-600">
              Latest news, product updates, and insights from the HitTags team.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {posts.map((post) => (
              <article
                key={post.title}
                className="group overflow-hidden rounded-3xl border-2 border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl"
              >
                <div className="grid gap-8 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100" />
                  </div>
                  <div className="flex flex-col justify-center p-8 md:col-span-3 md:p-12">
                    <div className="mb-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                      <Link href="#">{post.title}</Link>
                    </h2>
                    <p className="mb-6 text-lg text-slate-600">{post.excerpt}</p>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <span className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {post.date}
                      </span>
                    </div>
                    <div className="mt-6">
                      <Link
                        href="#"
                        className="inline-flex items-center font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Read more
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600">More articles coming soon!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
