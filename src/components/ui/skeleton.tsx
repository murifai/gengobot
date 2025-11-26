import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-secondary-background animate-pulse rounded-base border-2 border-border',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
