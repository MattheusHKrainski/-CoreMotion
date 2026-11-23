const MAX_AGE=24*60*60*1000;
export function positionKey(pathname:string,view:string):string {
 return `coremotion:position:${pathname==='/'?'/?view='+encodeURIComponent(view):pathname}`;
}
export function savedPosition(raw:string|null,now=Date.now()):number|null {
 try {const value=JSON.parse(raw||'null');return value&&typeof value.y==='number'&&Number.isFinite(value.y)&&value.y>=0&&value.y<=10000000&&typeof value.at==='number'&&Number.isFinite(value.at)&&now-value.at>=0&&now-value.at<MAX_AGE?value.y:null;}catch{return null;}
}
