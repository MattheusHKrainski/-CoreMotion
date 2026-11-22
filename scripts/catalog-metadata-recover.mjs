// Targeted read-only manufacturer metadata audit. Never infer arbitrary sizes or cross-color images.
import {readFileSync} from 'node:fs';
const rows=[1,2,3].flatMap(i=>JSON.parse(readFileSync('.github/audit-snapshots/catalog-media-0'+i+'.json','utf8')));
const target=rows.filter(r=>
 (r.description||'').trim().toLowerCase()===r.title.trim().toLowerCase()||
 (!r.variant_options?.length&&/^(Calçados|Vestuário|Roupas)$/.test(r.category))
);
const clean=t=>String(t||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();
const normUrl=url=>{try{return new URL(url).pathname.toLowerCase().replace(/\/p\/?$/,'').replace(/^\/|\/$/g,'')}catch{return''}};
const allowed=new Set(['www.fila.com.br','www.mizuno.com.br','www.umbro.com.br','www.olympikus.com.br']);
const results=[],summary={};let cursor=0;
const sizeFromSku=(name,category)=>{
 const str=clean(name),pattern=/(?:[\s/]|-)(PP|P|M|G|GG|XG|XGG|EG|EGG|GGG|GGGG|2GG|3GG|ÚNICO|UNICO|(?:[2-4]\d)(?:-[2-4]\d)?|(?:0?[6-9]|1[0-8]))\s*$/i;
 const match=str.match(pattern);if(!match)return null;
 const value=match[1].toUpperCase();
 if(category==='Calçados' && !/^\d{2}(?:-\d{2})?$/.test(value))return null;
 if(category!=='Calçados' && (value==='ÚNICO'||value==='UNICO'))return null;
 return value;
};
async function query(row){
 let host;try{host=new URL(row.source_url).hostname}catch{return{id:row.id,reason:'invalid-url'}}
 if(!allowed.has(host))return{id:row.id,reason:'other-system'};
 const terms=[row.title.replace(/[–—\-]+/g,' ').replace(/\s+/g,' ').trim(),normUrl(row.source_url).replace(/-/g,' ')];
 for(const term of [...new Set(terms)]){
  try{
   const res=await fetch('https://'+host+'/api/catalog_system/pub/products/search?ft='+encodeURIComponent(term.slice(0,90))+'&_from=0&_to=9',{headers:{accept:'application/json','user-agent':'Mozilla/5.0 (CoreMotion official product metadata QA)'},signal:AbortSignal.timeout(12000)});
   if(!res.ok)continue;
   const data=await res.json();if(!Array.isArray(data))continue;
   const p=data.find(r=>normUrl(r.link)===normUrl(row.source_url));if(!p)continue;
   const variants=(p.items||[]).filter(item=>(item.images||[]).some(img=>img.imageUrl===row.image_url));
   const sizes=[...new Set(variants.filter(item=>(item.sellers||[]).some(s=>Number(s.commertialOffer?.Price)>0&&s.commertialOffer?.IsAvailable!==false))
     .map(item=>sizeFromSku(item.name||item.nameComplete,row.category)).filter(Boolean))];
   const description=clean(p.description).slice(0,1200);
   return{id:row.id,source_url:row.source_url,expected_main:row.image_url,expected_description:row.description,expected_sizes:row.variant_options||[],description,sizes,skuCount:variants.length,reason:'matched'};
  }catch{continue}
 }
 return{id:row.id,reason:'not-found'};
}
async function worker(){
 while(cursor<target.length){
  const row=target[cursor++],r=await query(row);
  summary[r.reason]=(summary[r.reason]||0)+1;
  if(r.reason==='matched')results.push(r);
 }
}
await Promise.all(Array.from({length:6},()=>worker()));
console.log('CATALOG_METADATA_SUMMARY '+JSON.stringify({targeted:target.length,results:results.length,summary,descriptions:results.filter(x=>x.description.length>=90).length,sizes:results.filter(x=>x.sizes.length).length}));
for(const row of results)console.log('CATALOG_METADATA_MATCH '+JSON.stringify(row));
