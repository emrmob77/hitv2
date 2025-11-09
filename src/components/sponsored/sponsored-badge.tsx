'use client';

import { AlertCircle } from 'lucide-react';

interface SponsoredBadgeProps {
  disclosureText?: string;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function SponsoredBadge({
  disclosureText = 'Sponsored',
  className = '',
  variant = 'default',
}: SponsoredBadgeProps) {
  if (variant === 'minimal') {
    return (
      <span className={`text-xs text-gray-500 ${className}`}>
        {disclosureText}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}
    >
      <AlertCircle className="h-3 w-3" />
      <span>{disclosureText}</span>
    </div>
  );
}
