"use client";

import Link from "next/link";
import { Hash, Users, Calendar, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagHeaderProps {
  name: string;
  description: string | null;
  bookmarkCount: number;
  followerCount: number;
  createdAt: string;
  color: string;
}

export function TagHeader({
  name,
  description,
  bookmarkCount,
  followerCount,
  createdAt,
  color,
}: TagHeaderProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: color }}
          >
            <Hash className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-neutral-900">
              #{name}
            </h1>
            {description && (
              <p className="mb-4 max-w-2xl text-neutral-600">{description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-neutral-500">
              <span className="flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                {bookmarkCount.toLocaleString()} bookmarks
              </span>
              <span className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {followerCount.toLocaleString()} followers
              </span>
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Created {formattedDate}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800">
            <Plus className="mr-2 h-4 w-4" />
            Follow Tag
          </Button>
          <Button
            variant="outline"
            className="rounded-lg border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </section>
  );
}
