import { productPath } from '@/lib/commerce';
import type { ReportCategory } from '@/services/moderation';
export function moderationTarget(category:ReportCategory,id:string):{href:string;label:string}|null {
 if(!id.trim())return null;
 if(category==='athlete_listing')return {href:productPath('athlete',id),label:'Ver anúncio'};
 if(category==='external_offer')return {href:productPath('core',id),label:'Ver anúncio'};
 if(category==='community')return {href:'/?view=community&post='+encodeURIComponent(id),label:'Ver publicação'};
 return null;
}
