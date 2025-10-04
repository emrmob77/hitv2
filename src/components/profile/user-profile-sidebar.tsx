import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, Github, Globe } from 'lucide-react';

interface UserProfileSidebarProps {
  profile: any;
  stats: {
    bookmarks: number;
    collections: number;
    followers: number;
    following: number;
  };
}

export function UserProfileSidebar({ profile, stats }: UserProfileSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Social Links */}
      {(profile.twitter_handle || profile.github_handle || profile.website_url) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.twitter_handle && (
              <a
                href={`https://twitter.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Twitter className="h-4 w-4" />
                <span>@{profile.twitter_handle}</span>
              </a>
            )}

            {profile.github_handle && (
              <a
                href={`https://github.com/${profile.github_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Github className="h-4 w-4" />
                <span>@{profile.github_handle}</span>
              </a>
            )}

            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Globe className="h-4 w-4" />
                <span>{profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Public Bookmarks</span>
            <Badge variant="secondary">{stats.bookmarks}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Collections</span>
            <Badge variant="secondary">{stats.collections}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Total Followers</span>
            <Badge variant="secondary">{stats.followers}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Achievements / Badges */}
      {profile.plan_type !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.plan_type === 'pro' && (
                <Badge variant="default">Pro Member</Badge>
              )}
              {profile.plan_type === 'enterprise' && (
                <Badge variant="default">Enterprise Member</Badge>
              )}
              {stats.bookmarks >= 100 && (
                <Badge variant="secondary">100+ Bookmarks</Badge>
              )}
              {stats.followers >= 50 && (
                <Badge variant="secondary">50+ Followers</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
