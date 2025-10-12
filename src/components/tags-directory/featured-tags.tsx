"use client";

import { useRouter } from 'next/navigation';
import { Hash, Users, BookmarkIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedTagsProps {
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    usage_count: number;
  }>;
  currentUserId?: string;
}

export function FeaturedTags({ tags }: FeaturedTagsProps) {
  const router = useRouter();

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {tags.map((tag) => {
        const tagColor = tag.color || '#6B7280';

        return (
          <div
            key={tag.id}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            onClick={() => router.push(`/tag/${tag.slug}`)}
          >
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: `linear-gradient(135deg, ${tagColor} 0%, ${tagColor}dd 100%)`,
              }}
            />

            {/* Featured Badge */}
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
              <Star className="h-3 w-3 fill-current" />
              FEATURED
            </div>

            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${tagColor} 0%, ${tagColor}dd 100%)`,
                  }}
                >
                  <Hash className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Tag Name */}
              <h3 className="mb-2 text-center text-2xl font-bold text-neutral-900 group-hover:text-indigo-600">
                #{tag.name}
              </h3>

              {/* Description */}
              {tag.description && (
                <p className="mb-4 line-clamp-2 text-center text-sm text-neutral-600">
                  {tag.description}
                </p>
              )}

              {/* Stats */}
              <div className="mb-4 flex items-center justify-center gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-1">
                  <BookmarkIcon className="h-4 w-4" />
                  <span className="font-semibold">{tag.usage_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">
                    {Math.floor(tag.usage_count / 10).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/tag/${tag.slug}`);
                }}
              >
                Explore This Tag →
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
