// Official VTEX product pages: get actual alternate images, without guessing similar SKUs.
import { readFileSync } from 'node:fs';
const rows=[1,2,3].flatMap(i=>JSON.parse(readFileSync('.github/audit-snapshots/catalog-media-0'+i+'.json','utf8')));
const eligible=rows.filter(r=>r.source_url.includes('www.vollo.com.br/')||r.source_url.includes('www.penalty.com.br/'));
const sites={Vollo:'https://www.vollo.com.br',Penalty:'https://www.penalty.com.br'};
const slug=u=>new URL(u).pathname.replace(/\/p\/?$/,'').replace(/^\/|\/$/g,'').toLowerCase();
const normalize=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const outputs=[], stats={};
let pos=0;
async function lookup(row){
 const site=row.source_url.includes('www.vollo.com.br/')?sites.Vollo:sites.Penalty;
 let count=0;
 const query=row.title.replace(/[–—\-]+/g,' ').replace(/\s+/g,' ').trim().slice(0,75);
 const variants=[query,slug(row.source_url).replace(/-/g,' ')].filter((x,i,a)=>a.indexOf(x)===i);
 for(const term of variants){
  if(++count>2)break;
  try{
   const url=site+'/api/catalog_system/pub/products/search?ft='+encodeURIComponent(term)+'&_from=0&_to=9';
   const res=await fetch(url,{headers:{accept:'application/json','user-agent':'Mozilla/5.0 (CoreMotion catalog QA)'},signal:AbortSignal.timeout(13000)});
   if(!(res.status===200||res.status===206))continue;
   const products=await res.json();if(!Array.isArray(products))continue;
   const target=products.find(x=>{try{return slug(x.link)===slug(row.source_url)}catch{return false}});
   if(!target)continue;
   const candidates=(target.items||[]).flatMap(item=>item.images||[]);
   const all=[...new Set(candidates.map(x=>x.imageUrl).filter(x=>typeof x==='string'&&x.startsWith('https://')))];
   const sizes=[...new Set((target.items||[]).filter(item=>(item.sellers||[]).some(s=>Number(s.commertialOffer?.Price)>0&&s.commertialOffer?.IsAvailable!==false)).map(item=>item.name).filter(Boolean))];
   if(all.length && (all.length>(row.image_urls||[]).length||(!row.variant_options?.length&&sizes.length))){
    return {id:row.id,url:row.source_url,images:all.slice(0,12),sizes:sizes.slice(0,25),sourceProductId:target.productId,main:row.image_url};
   }
   return {id:row.id,found:true,noImprovement:true,images:[],sizes:[]};
  }catch(e){continue}
 }
 return {id:row.id,found:false};
}
async function worker(){
 while(pos<eligible.length){
  const i=pos++,row=eligible[i],data=await lookup(row),key=data.images?.length?'gallery':data.found?'found-no-change':'not-found';
  stats[key]=(stats[key]||0)+1;
  if(data.images?.length)outputs.push(data);
 }
}
await Promise.all(Array.from({length:7},()=>worker()));
console.log('CATALOG_GALLERY_SUMMARY '+JSON.stringify({scanned:eligible.length,stats,found:outputs.length}));
for(const row of outputs)console.log('CATALOG_GALLERY_MATCH '+JSON.stringify(row));
