"use client";

import Link from "next/link";

interface RelatedTag {
  name: string;
  slug: string;
  bookmarkCount: number;
}

interface TopContributor {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bookmarkCount: number;
}

interface PopularDomain {
  domain: string;
  bookmarkCount: number;
}

interface TagSidebarProps {
  statistics: {
    totalBookmarks: number;
    thisWeek: number;
    followers: number;
    avgLikes: number;
  };
  relatedTags: RelatedTag[];
  topContributors: TopContributor[];
  popularDomains: PopularDomain[];
}

export function TagSidebar({
  statistics,
  relatedTags,
  topContributors,
  popularDomains,
}: TagSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Tag Statistics */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Tag Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Total Bookmarks</span>
            <span className="text-sm font-semibold text-neutral-900">
              {statistics.totalBookmarks.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">This Week</span>
            <span className="text-sm font-semibold text-neutral-900">
              +{statistics.thisWeek}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Followers</span>
            <span className="text-sm font-semibold text-neutral-900">
              {statistics.followers.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Avg. Likes</span>
            <span className="text-sm font-semibold text-neutral-900">
              {statistics.avgLikes}
            </span>
          </div>
        </div>
      </div>

      {/* Related Tags */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Related Tags
        </h3>
        <div className="space-y-3">
          {relatedTags.map((tag) => (
            <div
              key={tag.slug}
              className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 hover:bg-neutral-100"
            >
              <Link
                href={`/tag/${tag.slug}`}
                className="flex items-center space-x-3"
              >
                <span className="text-sm font-medium text-neutral-900">
                  #{tag.name}
                </span>
                <span className="text-xs text-neutral-500">
                  {tag.bookmarkCount.toLocaleString()} bookmarks
                </span>
              </Link>
              <button className="text-xs font-medium text-neutral-600 hover:text-neutral-800">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Top Contributors
        </h3>
        <div className="space-y-4">
          {topContributors.map((contributor) => (
            <div
              key={contributor.username}
              className="flex items-center space-x-3"
            >
              {contributor.avatarUrl ? (
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.displayName || contributor.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300">
                  <span className="text-sm font-semibold text-neutral-600">
                    {(contributor.displayName || contributor.username)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <Link
                  href={`/${contributor.username}`}
                  className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                >
                  {contributor.displayName || contributor.username}
                </Link>
                <div className="text-xs text-neutral-500">
                  {contributor.bookmarkCount} bookmarks
                </div>
              </div>
              <button className="text-xs font-medium text-neutral-600 hover:text-neutral-800">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Domains */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Popular Domains
        </h3>
        <div className="space-y-3">
          {popularDomains.map((item) => (
            <div
              key={item.domain}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-neutral-700">{item.domain}</span>
              <span className="text-xs text-neutral-500">
                {item.bookmarkCount} bookmarks
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
