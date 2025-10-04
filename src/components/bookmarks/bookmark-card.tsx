import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Bookmark, Share2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BookmarkCardProps {
  bookmark: any;
  showAuthor?: boolean;
}

export function BookmarkCard({ bookmark, showAuthor = true }: BookmarkCardProps) {
  const profile = bookmark.profiles;
  const tags = bookmark.bookmark_tags?.map((bt: any) => bt.tags).filter(Boolean) || [];
  const displayName = profile?.display_name || profile?.username || 'Unknown';
  const timeAgo = bookmark.created_at ? formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true }) : '';

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Preview/Favicon */}
          <div className="flex-shrink-0">
            {bookmark.favicon_url ? (
              <img
                src={bookmark.favicon_url}
                alt=""
                className="h-16 w-16 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23e5e7eb" width="64" height="64"/%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-200">
                <Bookmark className="h-6 w-6 text-neutral-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/bookmark/${bookmark.id}/${bookmark.slug || 'bookmark'}`}
                  className="mb-1 block text-lg font-semibold text-neutral-900 hover:text-neutral-700 line-clamp-1"
                >
                  {bookmark.title}
                </Link>
                {showAuthor && profile && (
                  <Link
                    href={`/${profile.username}`}
                    className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={profile.avatar_url} alt={displayName} />
                      <AvatarFallback className="text-xs">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{displayName}</span>
                  </Link>
                )}
              </div>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-neutral-500 hover:text-neutral-900"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {bookmark.description && (
              <p className="mb-3 text-sm text-neutral-600 line-clamp-2">
                {bookmark.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-neutral-500">{timeAgo}</span>
                {bookmark.domain && (
                  <span className="text-xs text-neutral-500">{bookmark.domain}</span>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag: any) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        #{tag.name}
                      </Badge>
                    ))}
                    {tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{bookmark.like_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bookmark className="h-4 w-4" />
                  <span>{bookmark.view_count || 0}</span>
                </div>
                <button className="flex items-center space-x-1 hover:text-neutral-900">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
