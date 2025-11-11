/**
 * Admin User Detail Page
 * View and manage individual user details
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bookmark,
  FolderOpen,
  Activity,
  ArrowLeft,
  Ban,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  // Await params in Next.js 15
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  // Check admin auth
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    redirect('/auth/sign-in?redirect=/admin/users/' + id);
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser.id)
    .single();

  if (!adminProfile?.is_admin) {
    redirect('/');
  }

  // Fetch user details
  const { data: userProfile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !userProfile) {
    notFound();
  }

  // Get email from auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(id);

  // Get user's bookmarks
  const { data: bookmarks, count: bookmarksCount, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('id, title, url, created_at, is_public', { count: 'exact' })
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (bookmarksError) {
    console.error('Error fetching bookmarks:', bookmarksError);
  }

  // Get user's collections
  const { data: collections, count: collectionsCount, error: collectionsError } = await supabase
    .from('collections')
    .select('id, name, description, created_at, is_public', { count: 'exact' })
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (collectionsError) {
    console.error('Error fetching collections:', collectionsError);
  }

  console.log('Debug - User ID:', id);
  console.log('Debug - Bookmarks count:', bookmarksCount);
  console.log('Debug - Collections count:', collectionsCount);

  const email = authUser?.user?.email || userProfile.email || 'N/A';
  const fullName = userProfile.full_name || userProfile.display_name || 'N/A';

  return (
    <div className="container max-w-6xl py-8">
      {/* Back Button */}
      <Link href="/admin/users">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </Link>

      {/* User Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {userProfile.avatar_url || userProfile.profile_image_url ? (
            <img
              src={userProfile.avatar_url || userProfile.profile_image_url}
              alt={fullName}
              className="h-20 w-20 rounded-full"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-10 w-10" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{fullName}</h1>
            <p className="text-muted-foreground">{email}</p>
            <div className="mt-2 flex gap-2">
              {userProfile.is_admin && (
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  Admin
                </Badge>
              )}
              {userProfile.is_suspended ? (
                <Badge variant="destructive">
                  <Ban className="mr-1 h-3 w-3" />
                  Suspended
                </Badge>
              ) : (
                <Badge className="bg-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {userProfile.subscription_tier || 'free'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookmarksCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Member Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium" suppressHydrationWarning>
              {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium" suppressHydrationWarning>
              {userProfile.last_sign_in_at || userProfile.updated_at
                ? new Date(
                    userProfile.last_sign_in_at || userProfile.updated_at
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{userProfile.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-sm">{userProfile.username || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="text-sm">{fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bio</p>
              <p className="text-sm">{userProfile.bio || 'No bio'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bookmarks Created</span>
              <span className="font-medium">{bookmarksCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collections Created</span>
              <span className="font-medium">{collectionsCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account Status</span>
              <span className="font-medium">
                {userProfile.is_suspended ? 'Suspended' : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subscription</span>
              <span className="font-medium capitalize">
                {userProfile.subscription_tier || 'free'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookmarks */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Bookmarks</CardTitle>
        </CardHeader>
        <CardContent>
          {bookmarks && bookmarks.length > 0 ? (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{bookmark.title}</p>
                    <p className="text-xs text-muted-foreground">{bookmark.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={bookmark.is_public ? 'default' : 'outline'}>
                      {bookmark.is_public ? 'Public' : 'Private'}
                    </Badge>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No bookmarks yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Collections */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Collections</CardTitle>
        </CardHeader>
        <CardContent>
          {collections && collections.length > 0 ? (
            <div className="space-y-3">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{collection.name}</p>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground">{collection.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={collection.is_public ? 'default' : 'outline'}>
                      {collection.is_public ? 'Public' : 'Private'}
                    </Badge>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {new Date(collection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No collections yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
