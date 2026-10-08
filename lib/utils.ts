// ============================================================================
// CORE MOTIOM — UTILITÁRIO cn()
// Mescla classes Tailwind (clsx + tailwind-merge) — padrão shadcn/ui.
// ============================================================================
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/* ===========================================================
   CONCATENAR CLASSES TAILWIND
=========================================================== */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
