import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-base text-sm font-medium ring-offset-white transition-all [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          'text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
        destructive:
          'bg-destructive text-white border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
        outline:
          'border-2 border-border bg-background shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
        secondary:
          'bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-main underline-offset-4 hover:underline',
        noShadow: 'text-main-foreground bg-main border-2 border-border',
        neutral:
          'bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
        reverse:
          'text-main-foreground bg-main border-2 border-border hover:-translate-x-1 hover:-translate-y-1 hover:shadow-shadow',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 rounded-base gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 rounded-base px-8 has-[>svg]:px-4',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
