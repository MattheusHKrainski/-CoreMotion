import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-red-600/20 text-red-400 border-red-500/30',
        secondary: 'border-transparent bg-[#1D2230] text-slate-300',
        destructive: 'border-transparent bg-red-900/40 text-red-300 border-red-700/50',
        outline: 'text-slate-300 border-white/10',
        success: 'border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        warning: 'border-transparent bg-amber-500/10 text-amber-400 border-amber-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
