import { TagCard } from './tag-card';

interface TagsGridProps {
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    usage_count: number;
    follower_count?: number;
    is_trending: boolean;
    isFollowing?: boolean;
    growthRate?: number;
  }>;
  currentUserId?: string;
}

export function TagsGrid({ tags, currentUserId }: TagsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <TagCard key={tag.id} tag={tag} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
