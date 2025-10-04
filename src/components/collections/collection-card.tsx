import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Folder, Bookmark } from 'lucide-react';

interface CollectionCardProps {
  collection: any;
  showAuthor?: boolean;
}

export function CollectionCard({ collection, showAuthor = true }: CollectionCardProps) {
  const profile = collection.profiles;
  const displayName = profile?.display_name || profile?.username || 'Unknown';
  const bookmarkCount = collection.bookmark_count || 0;

  return (
    <Link href={`/collections/${profile?.username}/${collection.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
              <Folder className="h-6 w-6 text-neutral-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900 line-clamp-1">{collection.name}</h3>
              {showAuthor && profile && (
                <div className="flex items-center space-x-1 text-sm text-neutral-600">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="line-clamp-1">{displayName}</span>
                </div>
              )}
            </div>
          </div>

          {collection.description && (
            <p className="mb-3 text-sm text-neutral-600 line-clamp-2">
              {collection.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-neutral-500">
            <div className="flex items-center space-x-1">
              <Bookmark className="h-4 w-4" />
              <span>{bookmarkCount} {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}</span>
            </div>
            {collection.privacy_level && (
              <span className="capitalize">{collection.privacy_level}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
