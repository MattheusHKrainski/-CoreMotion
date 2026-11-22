import { readFileSync } from 'node:fs';

const rows=[1,2,3].flatMap(i=>JSON.parse(readFileSync('.github/audit-snapshots/catalog-media-0'+i+'.json','utf8')));
const eligible=rows.filter(r=>r.source_url.includes('www.vollo.com.br/')||r.source_url.includes('www.penalty.com.br/'));
const clean=t=>String(t||'').replace(/<style[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<script[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();
const slug=u=>new URL(u).pathname.replace(/\/p\/?$/,'').replace(/^\/|\/$/g,'').toLowerCase();
const shops=['https://www.vollo.com.br','https://www.penalty.com.br'];
const matches=[],stats={};let pos=0;
async function lookup(row){
 const site=row.source_url.includes('www.vollo.com.br/')?shops[0]:shops[1];
 const terms=[row.title.replace(/[–—\-]+/g,' ').replace(/\s+/g,' ').trim().slice(0,75),slug(row.source_url).replace(/-/g,' ')];
 for(const term of [...new Set(terms)]){
  try{
   const response=await fetch(site+'/api/catalog_system/pub/products/search?ft='+encodeURIComponent(term)+'&_from=0&_to=9',{
    headers:{accept:'application/json','user-agent':'Mozilla/5.0 (CoreMotion product photo verification)'},signal:AbortSignal.timeout(14000)
   });
   if(!response.ok)continue;
   const products=await response.json();if(!Array.isArray(products))continue;
   const target=products.find(x=>{try{return slug(x.link)===slug(row.source_url)}catch{return false}});
   if(!target)continue;
   const exactSku=(target.items||[]).find(item=>(item.images||[]).some(img=>img.imageUrl===row.image_url));
   if(!exactSku)return {id:row.id,matchedProduct:true,matchedCover:false};
   const images=[...new Set((exactSku.images||[]).map(x=>x.imageUrl).filter(x=>typeof x==='string'&&x.startsWith('https://')))].slice(0,12);
   if(!images.includes(row.image_url))return {id:row.id,matchedProduct:true,matchedCover:false};
   const description=clean(target.description).slice(0,1300);
   if(images.length>(row.image_urls||[]).length || (description.length>=90&&/preço de referência consultado na loja|disponibilidade sujeita à confirmação/i.test(row.description))){
    return {id:row.id,source_url:row.source_url,image_url:row.image_url,existingDescription:row.description,images,description,matchedProduct:true,matchedCover:true};
   }
   return {id:row.id,matchedProduct:true,matchedCover:true,noImprovement:true};
  }catch{continue}
 }
 return {id:row.id,matchedProduct:false};
}
async function worker(){
 while(pos<eligible.length){
  const row=eligible[pos++],result=await lookup(row);
  const label=result.images?.length?'correct-version':result.matchedCover?'no-change':result.matchedProduct?'wrong-cover':'not-found';
  stats[label]=(stats[label]||0)+1;
  if(result.images?.length)matches.push(result);
 }
}
await Promise.all(Array.from({length:7},()=>worker()));
console.log('CATALOG_EXACT_GALLERY_SUMMARY '+JSON.stringify({scanned:eligible.length,stats,improvements:matches.length,withMorePhotos:matches.filter(m=>m.images.length>1).length,withDescriptions:matches.filter(m=>m.description.length>=90).length}));
for(const row of matches)console.log('CATALOG_EXACT_GALLERY_MATCH '+JSON.stringify(row));
