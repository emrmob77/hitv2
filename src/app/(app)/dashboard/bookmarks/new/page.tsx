import Link from 'next/link';
import { Metadata } from 'next';

import { BookmarkCreateForm } from '@/components/bookmarks/bookmark-form';

export const metadata: Metadata = {
  title: 'Add Bookmark',
};

export default function NewBookmarkPage() {
  return (
    <div className="space-y-6 pt-2 pb-12 lg:pt-0">
      <nav className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/dashboard" className="font-medium text-neutral-500 transition hover:text-neutral-700">
          Dashboard
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="font-semibold text-neutral-900">Add bookmark</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-900">Add new bookmark</h1>
        <p className="max-w-2xl text-sm text-neutral-600">
          Capture must-read links, enrich them with metadata, and ship them into collections your audience will love.
        </p>
      </header>

      <BookmarkCreateForm />
    </div>
  );
}
