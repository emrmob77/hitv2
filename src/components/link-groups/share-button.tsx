'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  description?: string;
  url: string;
}

export function ShareButton({ title, description, url }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || `Check out ${title}`,
          url,
        });
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(url);
        }
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
    >
      <Share2 className="h-3.5 w-3.5" />
      <span>Share</span>
    </button>
  );
}
