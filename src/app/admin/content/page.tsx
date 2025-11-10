/**
 * Admin Content Management Page
 *
 * Manage all content including bookmarks, collections, and featured content
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bookmark,
  FolderOpen,
  Search,
  MoreVertical,
  Trash2,
  Star,
  Eye,
  EyeOff,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  url?: string;
  description?: string;
  user_email: string;
  is_public: boolean;
  is_featured: boolean;
  views_count: number;
  likes_count: number;
  created_at: string;
  type: 'bookmark' | 'collection';
}

export default function AdminContentPage() {
  const [bookmarks, setBookmarks] = useState<ContentItem[]>([]);
  const [collections, setCollections] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('bookmarks');

  // Stats
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    publicBookmarks: 0,
    totalCollections: 0,
    publicCollections: 0,
    featuredContent: 0,
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [bookmarksRes, collectionsRes] = await Promise.all([
        fetch('/api/admin/content/bookmarks'),
        fetch('/api/admin/content/collections'),
      ]);

      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks || []);
      }

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData.collections || []);
      }

      calculateStats();
    } catch (error) {
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    setStats({
      totalBookmarks: bookmarks.length,
      publicBookmarks: bookmarks.filter((b) => b.is_public).length,
      totalCollections: collections.length,
      publicCollections: collections.filter((c) => c.is_public).length,
      featuredContent:
        bookmarks.filter((b) => b.is_featured).length +
        collections.filter((c) => c.is_featured).length,
    });
  };

  const toggleFeatured = async (id: string, type: 'bookmark' | 'collection', isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/content/${type}s/${id}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !isFeatured }),
      });

      if (response.ok) {
        toast.success(isFeatured ? 'Removed from featured' : 'Added to featured');
        fetchContent();
      } else {
        toast.error('Failed to update featured status');
      }
    } catch (error) {
      toast.error('Error updating featured status');
    }
  };

  const toggleVisibility = async (
    id: string,
    type: 'bookmark' | 'collection',
    isPublic: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/content/${type}s/${id}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !isPublic }),
      });

      if (response.ok) {
        toast.success(isPublic ? 'Made private' : 'Made public');
        fetchContent();
      } else {
        toast.error('Failed to update visibility');
      }
    } catch (error) {
      toast.error('Error updating visibility');
    }
  };

  const deleteContent = async (id: string, type: 'bookmark' | 'collection') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const response = await fetch(`/api/admin/content/${type}s/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${type} deleted`);
        fetchContent();
      } else {
        toast.error(`Failed to delete ${type}`);
      }
    } catch (error) {
      toast.error(`Error deleting ${type}`);
    }
  };

  // Filter content
  const filteredBookmarks = bookmarks.filter(
    (item) =>
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollections = collections.filter(
    (item) =>
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContentTable = (items: ContentItem[], type: 'bookmark' | 'collection') => {
    if (loading) {
      return <p className="text-center text-muted-foreground">Loading...</p>;
    }

    if (items.length === 0) {
      return (
        <div className="py-12 text-center">
          {type === 'bookmark' ? (
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          ) : (
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          )}
          <p className="font-medium">No {type}s found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {type === 'bookmark' && <TableHead>URL</TableHead>}
            <TableHead>Owner</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    )}
                    {item.is_featured && (
                      <Badge variant="secondary" className="mt-1">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              {type === 'bookmark' && (
                <TableCell>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {item.url?.substring(0, 40)}...
                  </a>
                </TableCell>
              )}
              <TableCell>
                <code className="text-xs">{item.user_email}</code>
              </TableCell>
              <TableCell className="text-xs">
                <div className="space-y-1">
                  <div>{item.views_count} views</div>
                  <div>{item.likes_count} likes</div>
                </div>
              </TableCell>
              <TableCell>
                {item.is_public ? (
                  <Badge variant="default" className="bg-green-600">
                    <Eye className="mr-1 h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <EyeOff className="mr-1 h-3 w-3" />
                    Private
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-xs" suppressHydrationWarning>
                {new Date(item.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toggleFeatured(item.id, type, item.is_featured)}
                    >
                      {item.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleVisibility(item.id, type, item.is_public)}
                    >
                      {item.is_public ? 'Make Private' : 'Make Public'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteContent(item.id, type)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage bookmarks, collections, and featured content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookmarks}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.publicBookmarks} public
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCollections}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.publicCollections} public
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Featured Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.featuredContent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookmarks.reduce((acc, b) => acc + b.views_count, 0) +
                collections.reduce((acc, c) => acc + c.views_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookmarks.reduce((acc, b) => acc + b.likes_count, 0) +
                collections.reduce((acc, c) => acc + c.likes_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>View and manage all content on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="bookmarks">
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmarks ({filteredBookmarks.length})
              </TabsTrigger>
              <TabsTrigger value="collections">
                <FolderOpen className="mr-2 h-4 w-4" />
                Collections ({filteredCollections.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bookmarks" className="mt-4">
              {renderContentTable(filteredBookmarks, 'bookmark')}
            </TabsContent>
            <TabsContent value="collections" className="mt-4">
              {renderContentTable(filteredCollections, 'collection')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
