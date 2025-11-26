'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type DockProps = {
  children: React.ReactNode;
  className?: string;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  label?: string;
};

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

function Dock({ children, className }: DockProps) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="toolbar"
      aria-label="Application dock"
    >
      {children}
    </div>
  );
}

function DockItem({ children, className, onClick, label }: DockItemProps) {
  const button = (
    <Button variant="outline" size="icon" onClick={onClick} className={cn('relative', className)}>
      {children}
    </Button>
  );

  if (label) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function DockIcon({ children, className }: DockIconProps) {
  return <div className={cn('flex items-center justify-center', className)}>{children}</div>;
}

// Keep DockLabel for backwards compatibility but it's no longer needed
function DockLabel(_props: { children: React.ReactNode; className?: string }) {
  return null;
}

export { Dock, DockIcon, DockItem, DockLabel };
