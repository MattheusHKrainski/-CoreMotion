import React from 'react';
import { ExternalLink } from 'lucide-react';
import { moderationTarget } from '@/lib/moderation-target';
import type { ReportCategory } from '@/services/moderation';
export default function ModerationTargetLink({category,targetId}:{category:ReportCategory;targetId:string}) {
 const target=moderationTarget(category,targetId);
 if(!target)return null;
 return <a href={target.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-red-400 hover:border-red-500 hover:text-red-300">{target.label}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5"/><span className="sr-only"> (abre em outra aba)</span></a>;
}
