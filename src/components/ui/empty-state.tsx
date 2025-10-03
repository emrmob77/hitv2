import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 rounded-full bg-neutral-100 p-3">
        <Icon className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-neutral-600">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
