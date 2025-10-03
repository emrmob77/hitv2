import { AlertTriangleIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading data. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <AlertTriangleIcon className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-neutral-600">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
