import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-body text-sm font-semibold tracking-[0.04em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-4 py-2',
        lg: 'h-12 px-7 py-3',
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        hero: 'rounded-full px-6 py-3 text-base font-semibold !text-white bg-[#14332d] hover:bg-[#1a4039]',
        heroSecondary: 'rounded-full px-6 py-3 text-base font-semibold text-foreground border border-foreground/15 bg-white/50 hover:bg-white/70',
        ghost: 'text-foreground/60 hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);

Button.displayName = 'Button';

export { Button, buttonVariants };
