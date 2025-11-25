import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'border-border bg-muted text-foreground [a&]:hover:bg-muted/80',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        primary: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        success:
          'border-transparent bg-green-600 text-white [a&]:hover:bg-green-700 dark:bg-green-500 dark:text-green-950',
        warning:
          'border-transparent bg-amber-500 text-amber-950 [a&]:hover:bg-amber-600 dark:bg-amber-400 dark:text-amber-950',
        danger:
          'border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 dark:bg-red-500 dark:text-red-950',
      },
      size: {
        default: 'px-2 py-0.5 text-xs',
        sm: 'px-1.5 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
