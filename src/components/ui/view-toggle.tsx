'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        'flex gap-0.5 p-0.5 bg-secondary-background rounded-base border-2 border-border',
        className
      )}
    >
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'p-2 rounded-base transition-colors',
          view === 'list'
            ? 'bg-main text-main-foreground'
            : 'hover:bg-muted-foreground/10 text-foreground'
        )}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'p-2 rounded-base transition-colors',
          view === 'grid'
            ? 'bg-main text-main-foreground'
            : 'hover:bg-muted-foreground/10 text-foreground'
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
