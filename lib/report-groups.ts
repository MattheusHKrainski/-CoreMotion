import type { ModerationReport } from '@/services/moderation';
export function groupReports(reports:ModerationReport[]) {
 const groups=new Map<string,{key:string;name:string;reports:ModerationReport[]}>();
 for(const report of reports){
  const key=report.owner_id?`owner:${report.owner_id}`:`content:${report.category}:${report.target_id}`;
  const group=groups.get(key)||{key,name:report.owner_name||report.target_title,reports:[]};
  group.reports.push(report);groups.set(key,group);
 }
 return [...groups.values()];
}
export function reportUpdateUnread(report:ModerationReport):boolean {
 return !report.reviewed_at || !report.reporter_read_at || Date.parse(report.reporter_read_at)<Date.parse(report.reviewed_at);
}
