import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Subscribers | HitTags',
  description: 'Manage your subscribers and view subscriber-only content',
};

export default async function SubscribersPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get subscriptions where current user is the subscriber (people I'm subscribed to)
  const { data: subscriptions } = await supabase
    .from('subscriptions_user')
    .select(
      `
      id,
      status,
      created_at,
      profiles!subscriptions_user_creator_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        is_premium
      )
    `
    )
    .eq('subscriber_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get subscribers to current user (people subscribed to me)
  const { data: subscribers } = await supabase
    .from('subscriptions_user')
    .select(
      `
      id,
      status,
      created_at,
      profiles!subscriptions_user_subscriber_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio
      )
    `
    )
    .eq('creator_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get subscriber-only content feed from creators I'm subscribed to
  const creatorIds = subscriptions?.map((sub: any) => sub.profiles.id) || [];

  let feedItems: any[] = [];
  if (creatorIds.length > 0) {
    // Get bookmarks
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select(
        `
        id,
        title,
        description,
        url,
        image_url,
        created_at,
        like_count,
        privacy_level,
        slug,
        user_id,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `
      )
      .in('user_id', creatorIds)
      .eq('privacy_level', 'subscribers')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get exclusive posts
    const { data: posts } = await supabase
      .from('exclusive_posts')
      .select(
        `
        id,
        title,
        content,
        created_at,
        like_count,
        view_count,
        visibility,
        user_id,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `
      )
      .in('user_id', creatorIds)
      .in('visibility', ['subscribers', 'premium'])
      .order('created_at', { ascending: false })
      .limit(10);

    // Combine and sort by date
    feedItems = [
      ...(bookmarks || []).map((b) => ({ ...b, type: 'bookmark' })),
      ...(posts || []).map((p) => ({ ...p, type: 'post' })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const subscriptionCount = subscriptions?.length || 0;
  const subscriberCount = subscribers?.length || 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscribers</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscriptions and view exclusive content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionCount}</div>
            <p className="text-xs text-muted-foreground">Creators you follow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberCount}</div>
            <p className="text-xs text-muted-foreground">People subscribed to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Content</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedItems.length}</div>
            <p className="text-xs text-muted-foreground">Exclusive items available</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Subscriber Feed</TabsTrigger>
          <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
          <TabsTrigger value="subscribers">My Subscribers</TabsTrigger>
        </TabsList>

        {/* Subscriber Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exclusive Content Feed</CardTitle>
              <CardDescription>
                Subscriber-only content from creators you follow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No exclusive content yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Subscribe to creators to see their exclusive content here
                  </p>
                  <Link
                    href="/explore"
                    className="text-sm text-primary hover:underline"
                  >
                    Discover Creators
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedItems.map((item: any) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.profiles?.avatar_url} />
                        <AvatarFallback>
                          {(item.profiles?.display_name || item.profiles?.username)
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${item.profiles?.username}`}
                            className="font-semibold hover:underline"
                          >
                            {item.profiles?.display_name || item.profiles?.username}
                          </Link>
                          <Badge variant="secondary" className="text-xs">
                            {item.type === 'bookmark' ? 'Bookmark' : 'Post'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <Link
                          href={
                            item.type === 'bookmark'
                              ? `/bookmark/${item.id}/${item.slug || item.id}`
                              : `/dashboard/posts/${item.id}`
                          }
                          className="block"
                        >
                          <h3 className="font-medium hover:text-primary">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          {item.type === 'post' && item.content && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {item.content.substring(0, 150)}...
                            </p>
                          )}
                        </Link>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{item.like_count || 0} likes</span>
                          {item.view_count && <span>{item.view_count} views</span>}
                        </div>
                      </div>

                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Subscriptions</CardTitle>
              <CardDescription>Creators you're subscribed to</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={sub.profiles?.avatar_url} />
                          <AvatarFallback>
                            {(sub.profiles?.display_name || sub.profiles?.username)
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/${sub.profiles?.username}`}
                            className="font-semibold hover:underline"
                          >
                            {sub.profiles?.display_name || sub.profiles?.username}
                          </Link>
                          {sub.profiles?.bio && (
                            <p className="text-sm text-muted-foreground">
                              {sub.profiles.bio}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Subscribed {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {sub.profiles?.is_premium && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No subscriptions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start subscribing to creators to see their exclusive content
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Subscribers</CardTitle>
              <CardDescription>People subscribed to your content</CardDescription>
            </CardHeader>
            <CardContent>
              {subscribers && subscribers.length > 0 ? (
                <div className="space-y-4">
                  {subscribers.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={sub.profiles?.avatar_url} />
                          <AvatarFallback>
                            {(sub.profiles?.display_name || sub.profiles?.username)
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/${sub.profiles?.username}`}
                            className="font-semibold hover:underline"
                          >
                            {sub.profiles?.display_name || sub.profiles?.username}
                          </Link>
                          {sub.profiles?.bio && (
                            <p className="text-sm text-muted-foreground">
                              {sub.profiles.bio}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Subscribed {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No subscribers yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Create premium content to attract subscribers
                  </p>
                  {profile?.is_premium && (
                    <Link
                      href="/dashboard/posts/new"
                      className="text-sm text-primary hover:underline"
                    >
                      Create Premium Post
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
