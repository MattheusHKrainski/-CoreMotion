// ============================================================================
// CORE MOTIOM — INPUT (shadcn/ui)
// ============================================================================
import * as React from 'react';
import { cn } from '@/lib/utils';

/* ===========================================================
   COMPONENTE INPUT
=========================================================== */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-[#2A3140] bg-[#0E1017] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D11] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
