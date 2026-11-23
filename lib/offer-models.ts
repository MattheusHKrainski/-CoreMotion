import type { ExternalOffer } from './types';
const normalize=(value:string)=>value.toLowerCase().replace(/\s+/g,' ').trim();
export function offerVoltage(title:string):string|null {
 const match=title.match(/\b(110|127|220)\s*v\b/i);
 return match?`${match[1]}V`:null;
}
function modelKey(offer:Pick<ExternalOffer,'id'|'title'|'store_name'|'source_url'>):string {
 const voltage=offerVoltage(offer.title);
 if(!voltage)return `item:${offer.id}`;
 // Both retailer route and model title must match after removing ONLY voltage.
 // Never merge sizes, colours, different sellers or a different model number.
 return [normalize(offer.store_name),normalize(offer.title.replace(/\b(110|127|220)\s*v\b/gi,'')),normalize(offer.source_url.replace(/(?:110|127|220)v/gi,'voltage'))].join('|');
}
export function voltageVariants(offer:Pick<ExternalOffer,'id'|'title'|'store_name'|'source_url'>,all:ExternalOffer[]):ExternalOffer[] {
 if(!offerVoltage(offer.title))return [];
 return all.filter(item=>item.is_active!==false&&modelKey(item)===modelKey(offer)).sort((a,b)=>Number(offerVoltage(a.title)?.replace('V',''))-Number(offerVoltage(b.title)?.replace('V','')));
}
export function uniqueOfferModels(offers:ExternalOffer[]):ExternalOffer[] {
 const groups=new Map<string,ExternalOffer[]>();
 for(const offer of offers){const key=modelKey(offer);groups.set(key,[...(groups.get(key)||[]),offer]);}
 return [...groups.values()].map(items=>{
  if(items.length<2 || new Set(items.map(item=>offerVoltage(item.title))).size<2)return items[0];
  const first=items.reduce((a,b)=>a.price<=b.price?a:b);
  return {...first,title:first.title.replace(/\b(110|127|220)\s*v\b/gi,'').replace(/\s+/g,' ').trim(),voltage_variants:items.map(item=>({id:item.id,label:offerVoltage(item.title)!,price:item.price}))};
 });
}
