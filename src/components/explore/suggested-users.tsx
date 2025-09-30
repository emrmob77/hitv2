"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SuggestedUser {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  isFollowing?: boolean;
}

interface SuggestedUsersProps {
  users: SuggestedUser[];
}

export function SuggestedUsers({ users }: SuggestedUsersProps) {
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(
    users.reduce((acc, user) => {
      acc[user.username] = user.isFollowing || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleFollow = (username: string) => {
    setFollowStates((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  return (
    <div className="sticky top-[580px] rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="mb-3 text-base font-semibold text-neutral-900">
        Suggested Users
      </h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.username}
            className="flex items-center justify-between"
          >
            <div className="flex min-w-0 flex-1 items-center">
              <Link href={`/${user.username}`} className="mr-2 flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || user.username}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300">
                    <span className="text-xs font-semibold text-neutral-600">
                      {(user.displayName || user.username)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/${user.username}`}
                  className="block truncate text-sm font-medium text-neutral-900 hover:text-neutral-700"
                >
                  {user.displayName || user.username}
                </Link>
                {user.bio && (
                  <div className="truncate text-xs text-neutral-500">
                    {user.bio}
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant={followStates[user.username] ? "outline" : "default"}
              onClick={() => handleFollow(user.username)}
              className={`ml-2 flex-shrink-0 text-xs ${
                followStates[user.username]
                  ? "text-neutral-700"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              {followStates[user.username] ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
