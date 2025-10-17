import Link from 'next/link';
import { Bell, Settings, Shield, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';

export async function AdminHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user?.id)
    .single();

  const avatarUrl =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${user?.id}`;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo & Badge */}
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">HitTags</h1>
                <Badge variant="secondary" className="mt-0.5 text-[10px] font-medium">
                  Admin Panel
                </Badge>
              </div>
            </Link>
          </div>

          {/* Right side - Actions & User */}
          <div className="flex items-center space-x-2">
            {/* Back to Site */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden text-neutral-600 hover:text-neutral-900 sm:flex"
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-neutral-900">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-900">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Info */}
            <div className="ml-2 flex items-center space-x-3 rounded-lg border border-neutral-200 bg-neutral-50/50 py-1.5 pl-3 pr-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Admin Avatar"
                className="h-8 w-8 rounded-full ring-2 ring-white"
              />
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-medium text-neutral-900">
                  {profile?.display_name || profile?.username || 'Admin'}
                </span>
                <span className="text-xs text-neutral-500">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
