'use client';

import Link from 'next/link';
import {
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Bookmark,
  BarChart3,
  FolderKanban,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOutAction } from '@/lib/auth/actions';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface UserDropdownProps {
  userProfile: UserProfile | null;
  avatarLabel: string;
}

export function UserDropdown({ userProfile, avatarLabel }: UserDropdownProps) {
  const displayName = userProfile?.display_name || userProfile?.username || 'User';
  const username = userProfile?.username || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
        >
          <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-neutral-300 transition-all">
            <AvatarImage
              src={userProfile?.avatar_url || undefined}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {avatarLabel}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {username && (
              <p className="text-xs leading-none text-muted-foreground">
                @{username}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${username}`} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/bookmarks" className="cursor-pointer">
              <Bookmark className="mr-2 h-4 w-4" />
              <span>Bookmarks</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/collections" className="cursor-pointer">
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>Collections</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/tags" className="cursor-pointer">
              <Tag className="mr-2 h-4 w-4" />
              <span>Tags</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/analytics" className="cursor-pointer">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center text-red-600 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
