'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon, ExternalLinkIcon } from 'lucide-react';

interface AffiliateLinkItemProps {
  link: {
    id: string;
    short_code: string;
    affiliate_url: string;
    commission_rate: number;
    total_clicks: number;
    total_earnings: number;
    bookmark?: {
      title: string;
      url: string;
    } | null;
  };
  baseUrl: string;
}

export function AffiliateLinkItem({ link, baseUrl }: AffiliateLinkItemProps) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${baseUrl}/a/${link.short_code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-neutral-50">
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-neutral-900">
          {link.bookmark?.title || 'Untitled'}
        </h4>

        {/* Short Link */}
        <div className="mt-2 flex items-center gap-2">
          <code className="rounded bg-neutral-100 px-2 py-1 text-xs font-mono text-neutral-700">
            {shortUrl}
          </code>
          <button
            onClick={handleCopy}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? (
              <CheckIcon className="h-3 w-3 text-green-600" />
            ) : (
              <CopyIcon className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Affiliate URL */}
        <a
          href={link.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          Target: {link.affiliate_url.substring(0, 50)}...
          <ExternalLinkIcon className="h-3 w-3" />
        </a>

        <div className="mt-2 flex gap-4 text-xs text-neutral-600">
          <span>{link.total_clicks || 0} clicks</span>
          <span>•</span>
          <span>{link.commission_rate}% commission</span>
          <span>•</span>
          <span className="font-medium text-green-600">
            ${(link.total_earnings || 0).toFixed(2)} earned
          </span>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/affiliate/${link.id}`}>View Details</Link>
      </Button>
    </div>
  );
}
