import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Reusable empty state: icon + title + message + optional action. */
export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-14 text-center', className)}>
      <span className="flex size-12 items-center justify-center border border-border bg-accent text-primary">
        {icon}
      </span>
      <p className="font-semibold">{title}</p>
      {message && <p className="max-w-sm text-sm text-muted-foreground">{message}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
