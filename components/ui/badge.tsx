// ============================================================================
// CORE MOTIOM — BADGE (shadcn/ui)
// ============================================================================
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-red-500/40 bg-red-500/10 text-red-200',
        secondary: 'border-[#2A3140] bg-[#12151C] text-[#CBD5E1]',
        outline: 'border-[#2A3140] text-[#E5E7EB]',
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
