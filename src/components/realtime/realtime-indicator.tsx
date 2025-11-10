'use client';

import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  showText?: boolean;
  className?: string;
}

export function RealtimeIndicator({ isConnected, showText = false, className = '' }: RealtimeIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
          {showText && <span className="text-xs text-green-600 dark:text-green-400">Live</span>}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-gray-400" />
          {showText && <span className="text-xs text-gray-500">Offline</span>}
        </>
      )}
    </div>
  );
}
