'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import {
  EyeIcon,
  MousePointerClickIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  BarChartIcon,
} from 'lucide-react';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

interface LinkGroupCardProps {
  group: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    view_count: number;
    click_count: number;
    created_at: string;
    username?: string;
  };
  baseUrl?: string;
}

export function LinkGroupCard({ group, baseUrl = DEFAULT_BASE_URL }: LinkGroupCardProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const publicUrl = `${baseUrl}/l/${group.username}/${group.slug}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-neutral-300">
      <CardContent className="p-6">
        <Link href={`/dashboard/link-groups/${group.id}`}>
          <h3 className="mb-2 text-xl font-semibold text-neutral-900 line-clamp-1 transition-colors hover:text-neutral-700">
            {group.name}
          </h3>
        </Link>

        {group.description && (
          <p className="mb-4 text-sm text-neutral-600 line-clamp-2">{group.description}</p>
        )}

        <div className="mb-4 flex items-center gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-1.5">
            <EyeIcon className="h-4 w-4" />
            <span>{group.view_count}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MousePointerClickIcon className="h-4 w-4" />
            <span>{group.click_count}</span>
          </div>
        </div>

        {group.is_active && group.username ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="mb-1.5 text-xs font-medium text-neutral-600">Public URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate text-xs text-blue-600">{publicUrl}</code>
                <button
                  onClick={handleCopy}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors"
                  title={copied ? 'Copied!' : 'Copy URL'}
                >
                  {copied ? (
                    <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/l/${group.username}/${group.slug}`} target="_blank">
                  <ExternalLinkIcon className="mr-2 h-3 w-3" />
                  View
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/dashboard/link-groups/${group.id}`}>
                  <BarChartIcon className="mr-2 h-3 w-3" />
                  Stats
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-xs text-amber-700">Inactive - Not visible to public</p>
          </div>
        )}

        <p className="mt-4 text-xs text-neutral-400">
          Created {new Date(group.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
