import { readFileSync, existsSync } from 'node:fs';

const rows=[1,2,3].flatMap(i=>JSON.parse(readFileSync('.github/audit-snapshots/catalog-media-0'+i+'.json','utf8')));
const users=JSON.parse(readFileSync('.github/audit-snapshots/catalog-media-04.json','utf8'));
if(rows.length!==885||users.length!==26) throw Error('Catalog snapshot count changed');
const host=url=>{try{return new URL(url).hostname}catch{return'local'}};
const items=new Map();
for(const row of rows)for(const [i,url]of [...new Set([row.image_url,...(row.image_urls||[])])].entries()){
 if(!url)continue;const ref=items.get(url)||{ids:[],primary:0};
 ref.ids.push(row.id);if(i===0)ref.primary++;items.set(url,ref);
}
for(const row of users)for(const [i,url]of (row.images||[]).entries()){
 if(url.startsWith('/')){
   if(!existsSync('public'+url))console.log('CATALOG_MEDIA_LOCAL_MISSING '+JSON.stringify({id:row.id,url}));
   continue;
 }
 const ref=items.get(url)||{ids:[],primary:0};ref.ids.push(row.id);if(i===0)ref.primary++;items.set(url,ref);
}
const photos=[...items].filter(([url])=>url.startsWith('https://'));
const statuses=new Map(), problems=[];
let position=0;
async function check(url){
 const get=async method=>{
  try {
   const response=await fetch(url,{
    method,redirect:'follow',signal:AbortSignal.timeout(12000),
    headers:{accept:'image/avif,image/webp,image/*,*/*;q=0.8','user-agent':'Mozilla/5.0 (CoreMotion catalog image QA)',...(method==='GET'?{'range':'bytes=0-511'}:{})}
   });
   const contentType=(response.headers.get('content-type')||'').toLowerCase();
   const result={status:response.status,type:contentType,redirected:response.url!==url};
   if(method==='GET'&&response.body)await response.body.cancel();
   return result;
  }catch(e){return{status:0,error:String(e).slice(0,120)}}
 };
 let test=await get('HEAD');
 if(!(test.status>=200&&test.status<300&&test.type?.startsWith('image/')))test=await get('GET');
 const good=test.status>=200&&test.status<300&&test.type?.startsWith('image/');
 const code=good?'ok':test.status===404||test.status===410?'broken':(test.status>=200&&test.status<300&&test.type?.includes('html'))?'html':'unverified';
 return {code,status:test.status,type:test.type||'',error:test.error||''};
}
const concurrency=16;
async function worker(){
 while(position<photos.length){
  const idx=position++;const [url,ref]=photos[idx],r=await check(url);
  const key=host(url)+'|'+r.code;
  statuses.set(key,(statuses.get(key)||0)+1);
  if(r.code!=='ok')problems.push({url,id:ref.ids[0],count:ref.ids.length,primary:ref.primary>0,status:r.status,type:r.type,classification:r.code,error:r.error});
 }
}
await Promise.all(Array.from({length:concurrency},()=>worker()));
const summary={products:rows.length,c2c:users.length,distinctPhotos:photos.length,mainPhotos:rows.length,
  results:Object.fromEntries(['ok','broken','html','unverified'].map(v=>[v,[...statuses].filter(([k])=>k.endsWith('|'+v)).reduce((a,[,n])=>a+n,0)])),
  byHost:Object.fromEntries([...new Set(photos.map(([url])=>host(url)))].map(h=>[h,{ok:statuses.get(h+'|ok')||0,broken:statuses.get(h+'|broken')||0,html:statuses.get(h+'|html')||0,unverified:statuses.get(h+'|unverified')||0}]))};
console.log('CATALOG_MEDIA_SUMMARY '+JSON.stringify(summary));
for(const issue of problems.slice(0,350))console.log('CATALOG_MEDIA_ISSUE '+JSON.stringify(issue));
console.log('CATALOG_MEDIA_ISSUES_TOTAL '+problems.length);
