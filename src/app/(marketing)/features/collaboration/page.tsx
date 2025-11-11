import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Share2, MessageSquare, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Team Collaboration - HitTags Features',
  description: 'Collaborate with your team on shared bookmark collections.',
};

export default function CollaborationFeaturePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <Users className="mr-2 h-4 w-4 text-blue-600" />
              Team Collaboration
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Work Together
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-xl text-slate-600">
              Share collections, collaborate with teams, and build knowledge bases together.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/auth/sign-up">Start Collaborating</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Share2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">Shared Collections</h3>
              <p className="text-slate-600">
                Create collections and share them with team members or the public.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">Access Control</h3>
              <p className="text-slate-600">
                Fine-grained permissions for viewers, editors, and admins.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">Comments & Feedback</h3>
              <p className="text-slate-600">
                Discuss bookmarks with your team through threaded comments.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">Team Workspaces</h3>
              <p className="text-slate-600">
                Organize your team's bookmarks in dedicated workspaces.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
