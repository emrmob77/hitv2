import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MetadataGenerator } from '@/lib/seo/metadata';
import { StructuredDataGenerator } from '@/lib/seo/structured-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BookmarkDetailPreview } from '@/components/bookmarks/bookmark-detail-preview';
import { BookmarkDetailSidebar } from '@/components/bookmarks/bookmark-detail-sidebar';
import { BookmarkComments } from '@/components/bookmarks/bookmark-comments';

interface Props {
  params: {
    id: string;
    slug: string;
  };
}

async function getBookmark(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select(
        `
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          bio
        ),
        bookmark_tags (
          tags (
            id,
            name,
            slug
          )
        )
      `
      )
      .eq('id', id)
      .eq('privacy_level', 'public')
      .single();

    if (error || !bookmark) {
      return null;
    }

    return bookmark;
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bookmark = await getBookmark(params.id);

  if (!bookmark) {
    return {
      title: 'Bookmark Not Found | HitTags',
    };
  }

  const username = bookmark.profiles?.username;
  return MetadataGenerator.generateBookmarkMetadata(bookmark, username);
}

export default async function BookmarkDetailPage({ params }: Props) {
  const bookmark = await getBookmark(params.id);

  if (!bookmark) {
    notFound();
  }

  // Check if slug matches, redirect if not
  const correctSlug = bookmark.slug || bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (params.slug !== correctSlug) {
    redirect(`/bookmarks/${params.id}/${correctSlug}`);
  }

  const structuredData = StructuredDataGenerator.generateBookmarkSchema(bookmark);

  // Extract tags from bookmark_tags relation
  const tags = bookmark.bookmark_tags?.map((bt: any) => ({
    name: bt.tags.name,
    slug: bt.tags.slug,
  })) || [];

  // Mock data for comments and sidebar (replace with real data from API)
  const mockComments = [
    {
      id: '1',
      content: "This is incredibly useful! I've been looking for something like this to standardize our design process. The checklist format makes it easy to follow.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 5,
      isLiked: false,
      author: {
        username: 'alexrivera',
        displayName: 'Alex Rivera',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=789',
      },
    },
    {
      id: '2',
      content: 'Great resource! Would love to see a version specifically for mobile design systems too.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 12,
      isLiked: true,
      author: {
        username: 'emmathompson',
        displayName: 'Emma Thompson',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=321',
      },
      replies: [
        {
          id: '3',
          content: "@Emma Thompson That's a great idea! I'm actually working on a mobile-specific version. Will share it soon!",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          likes: 8,
          isLiked: false,
          author: {
            username: bookmark.profiles?.username || 'unknown',
            displayName: bookmark.profiles?.display_name || null,
            avatarUrl: bookmark.profiles?.avatar_url || null,
          },
          isAuthor: true,
        },
      ],
    },
  ];

  const sidebarData = {
    stats: {
      views: bookmark.view_count || 1234,
      likes: bookmark.like_count || 24,
      saves: 156,
      comments: mockComments.length + 1,
      shares: 38,
    },
    collections: [
      {
        id: '1',
        name: 'Design Resources',
        slug: 'design-resources',
        bookmarkCount: 234,
      },
      {
        id: '2',
        name: 'UI Tools',
        slug: 'ui-tools',
        bookmarkCount: 87,
      },
      {
        id: '3',
        name: 'Inspiration',
        slug: 'inspiration',
        bookmarkCount: 156,
      },
    ],
    relatedBookmarks: [
      {
        id: '1',
        title: 'Figma Design Tokens',
        slug: 'figma-design-tokens',
        description: 'Complete guide to design tokens in Figma',
        imageUrl: null,
        likes: 89,
        saves: 234,
      },
      {
        id: '2',
        title: 'Component Library Best Practices',
        slug: 'component-library-best-practices',
        description: 'Building scalable component libraries',
        imageUrl: null,
        likes: 156,
        saves: 298,
      },
      {
        id: '3',
        title: 'Design System Documentation',
        slug: 'design-system-documentation',
        description: 'How to document your design system',
        imageUrl: null,
        likes: 67,
        saves: 123,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-700">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/explore" className="hover:text-neutral-700">
              Explore
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neutral-900">{bookmark.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Bookmark Preview */}
              <BookmarkDetailPreview
                id={bookmark.id}
                title={bookmark.title}
                description={bookmark.description}
                url={bookmark.url}
                domain={bookmark.domain}
                imageUrl={bookmark.image_url}
                createdAt={bookmark.created_at}
                viewCount={bookmark.view_count || 1234}
                likeCount={bookmark.like_count || 24}
                author={{
                  username: bookmark.profiles?.username || 'unknown',
                  displayName: bookmark.profiles?.display_name || null,
                  avatarUrl: bookmark.profiles?.avatar_url || null,
                  bio: bookmark.profiles?.bio || null,
                }}
                tags={tags}
                isLiked={false}
                isBookmarked={false}
              />

              {/* Comments */}
              <BookmarkComments
                comments={mockComments}
                totalComments={mockComments.length + 1}
                currentUser={undefined}
              />
            </div>

            {/* Sidebar */}
            <BookmarkDetailSidebar {...sidebarData} />
          </div>
        </div>
      </main>
    </>
  );
}
