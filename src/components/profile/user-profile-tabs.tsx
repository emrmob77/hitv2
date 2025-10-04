'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, Folder, Heart, Users } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { BookmarkCard } from '@/components/bookmark/bookmark-card';
import { CollectionCard } from '@/components/collections/collection-card';

interface UserProfileTabsProps {
  username: string;
  userId: string;
  isOwnProfile: boolean;
}

export function UserProfileTabs({ username, userId, isOwnProfile }: UserProfileTabsProps) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const supabase = createSupabaseBrowserClient();

    // Fetch public bookmarks
    const { data: bookmarksData } = await supabase
      .from('bookmarks')
      .select('*, bookmark_tags(tags(*)), profiles(username, display_name, avatar_url)')
      .eq('user_id', userId)
      .eq('privacy_level', 'public')
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch public collections
    const { data: collectionsData } = await supabase
      .from('collections')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('user_id', userId)
      .eq('privacy_level', 'public')
      .order('created_at', { ascending: false })
      .limit(20);

    setBookmarks(bookmarksData || []);
    setCollections(collectionsData || []);
    setLoading(false);
  };

  return (
    <Tabs defaultValue="bookmarks" className="w-full">
      <TabsList className="mb-6 w-full justify-start rounded-xl border border-neutral-200 bg-white p-0">
        <TabsTrigger
          value="bookmarks"
          className="rounded-l-xl data-[state=active]:bg-neutral-100"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Bookmarks
        </TabsTrigger>
        <TabsTrigger value="collections" className="data-[state=active]:bg-neutral-100">
          <Folder className="mr-2 h-4 w-4" />
          Collections
        </TabsTrigger>
        <TabsTrigger value="likes" className="data-[state=active]:bg-neutral-100">
          <Heart className="mr-2 h-4 w-4" />
          Likes
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className="rounded-r-xl data-[state=active]:bg-neutral-100"
        >
          <Users className="mr-2 h-4 w-4" />
          Following
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bookmarks" className="space-y-4">
        {loading ? (
          <div className="text-center text-neutral-500">Loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">No bookmarks yet</h3>
            <p className="text-sm text-neutral-600">
              {isOwnProfile
                ? 'Start adding bookmarks to build your collection'
                : `${username} hasn't added any public bookmarks yet`}
            </p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))
        )}
      </TabsContent>

      <TabsContent value="collections" className="space-y-4">
        {loading ? (
          <div className="text-center text-neutral-500">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <Folder className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">No collections yet</h3>
            <p className="text-sm text-neutral-600">
              {isOwnProfile
                ? 'Create collections to organize your bookmarks'
                : `${username} hasn't created any public collections yet`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="likes">
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-lg font-medium text-neutral-900">Liked bookmarks</h3>
          <p className="text-sm text-neutral-600">Coming soon...</p>
        </div>
      </TabsContent>

      <TabsContent value="following">
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-lg font-medium text-neutral-900">Following</h3>
          <p className="text-sm text-neutral-600">Coming soon...</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
