"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface CategoryPillsProps {
  categories: Array<{ slug: string; label: string }>;
  activeCategory: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  'all': '🏷️',
  'web-development': '💻',
  'design': '🎨',
  'marketing': '📊',
  'productivity': '🎯',
  'business': '💼',
  'technology': '⚡',
  'education': '🎓',
  'creative': '✨',
};

export function CategoryPills({ categories, activeCategory }: CategoryPillsProps) {
  const searchParams = useSearchParams();

  const createUrl = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    if (categorySlug !== 'all') {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }

    const queryString = params.toString();
    return queryString ? `/tags?${queryString}` : '/tags';
  };

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-neutral-700">
        Browse by Category:
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          const icon = CATEGORY_ICONS[category.slug] || '📌';

          return (
            <Link
              key={category.slug}
              href={createUrl(category.slug)}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:shadow-md'
              }`}
            >
              <span>{icon}</span>
              <span>{category.label}</span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
