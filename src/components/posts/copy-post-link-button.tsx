'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon, CheckIcon, CopyIcon } from 'lucide-react';

interface CopyPostLinkButtonProps {
  username: string;
  slug: string;
  visibility: string;
}

export function CopyPostLinkButton({ username, slug, visibility }: CopyPostLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  if (visibility !== 'public') {
    return null; // Only show for public posts
  }

  const publicUrl = `${window.location.origin}/p/${username}/${slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openLink = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? (
          <>
            <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy Link
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={openLink}>
        <ExternalLinkIcon className="mr-2 h-4 w-4" />
        View Public
      </Button>
    </div>
  );
}
