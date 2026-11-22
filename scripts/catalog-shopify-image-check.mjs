// Try verified official image URLs, without substituting unrelated photos.
import {readFileSync} from 'node:fs';
const all=[1,2,3].flatMap(i=>JSON.parse(readFileSync('.github/audit-snapshots/catalog-media-0'+i+'.json','utf8')));
const list=all.filter(r=>r.image_url.startsWith('https://cdn.shopify.com/'));
const probe=async url=>{
 const method='GET';
 try{
  const res=await fetch(url,{method,redirect:'follow',headers:{accept:'image/avif,image/webp,image/*,*/*;q=0.8',range:'bytes=0-511','user-agent':'Mozilla/5.0 (CoreMotion image compatibility QA)'},signal:AbortSignal.timeout(12000)});
  const valid=res.ok&&(res.headers.get('content-type')||'').startsWith('image/');
  if(res.body)await res.body.cancel();
  return {status:res.status,valid,type:res.headers.get('content-type')};
 }catch(error){return{status:0,valid:false,error:String(error).slice(0,130)}}
};
let index=0;const stats={};const replacements=[];
async function worker(){
 while(index<list.length){
  const product=list[index++];
  const original=new URL(product.image_url),filename=original.pathname.split('/').at(-1)||'';
  const store=product.id.startsWith('hb-br-')?'https://www.hb.com.br':'https://www.clubedoremo.com.br';
  const options=[
    store+'/cdn/shop/files/'+encodeURIComponent(filename)+'?'+original.searchParams.toString(),
    store+'/cdn/shop/files/'+encodeURIComponent(filename),
    'https://cdn.shopify.com'+original.pathname,
    original.href.replace(/&width=\d+/g,'')
  ];
  const attempts=[];let good=null;
  for(const url of [...new Set(options)]){
   const r=await probe(url);attempts.push({url,status:r.status,type:r.type});
   if(r.valid){good=url;break;}
  }
  stats[good?'recovered':'unverified']=(stats[good?'recovered':'unverified']||0)+1;
  if(good)replacements.push({id:product.id,from:product.image_url,to:good});
  console.log('CATALOG_SHOPIFY_IMAGE '+JSON.stringify({id:product.id,recovered:good,attempts:attempts.map(a=>({status:a.status,url:a.url.slice(0,125)}))}));
 }
}
await Promise.all(Array.from({length:4},()=>worker()));
console.log('CATALOG_SHOPIFY_SUMMARY '+JSON.stringify({tested:list.length,stats}));
