"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SuggestedUser {
  id?: string;
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
  const { toast } = useToast();
  const router = useRouter();
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(
    users.reduce((acc, user) => {
      acc[user.username] = user.isFollowing || false;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleFollow = useCallback(
    async (user: SuggestedUser) => {
      if (!user.id) {
        toast({
          title: "Unable to follow",
          description: "Missing user identifier.",
          variant: "destructive",
        });
        return;
      }

      setLoadingStates((prev) => ({ ...prev, [user.username]: true }));

      try {
        const response = await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ following_id: user.id }),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update follow state");
        }

        setFollowStates((prev) => ({
          ...prev,
          [user.username]: Boolean(data.isFollowing),
        }));

        router.refresh();
      } catch (error: any) {
        console.error("Suggested user follow error:", error);
        toast({
          title: "Follow failed",
          description: error?.message || "We couldn't update the follow state.",
          variant: "destructive",
        });
      } finally {
        setLoadingStates((prev) => ({ ...prev, [user.username]: false }));
      }
    },
    [router, toast]
  );

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
              onClick={() => handleFollow(user)}
              disabled={loadingStates[user.username]}
              className={`ml-2 flex-shrink-0 text-xs ${
                followStates[user.username]
                  ? "text-neutral-700"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              {loadingStates[user.username]
                ? "Processing..."
                : followStates[user.username]
                ? "Following"
                : "Follow"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
