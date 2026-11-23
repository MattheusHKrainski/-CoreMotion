import {quickStorageKey} from './quick-access';
type Kind='athlete'|'store';
/** Ignore responses that began before a confirmed deletion; later reads remain authoritative. */
export class CatalogReadFence {
 private revision=0;
 private deleted=new Map<string,number>();
 begin(){return this.revision;}
 remove(id:string){this.deleted.set(id,++this.revision);}
 filter<T extends {id:string}>(rows:T[],started:number):T[]{return rows.filter(row=>(this.deleted.get(row.id)||0)<=started);}
}
export const productReadFence=new CatalogReadFence();
export const offerReadFence=new CatalogReadFence();
const key=(kind:Kind)=>quickStorageKey(`coremotion_deleted_catalog_v1_${kind}`);
export function localCatalogRows<T extends {id:string}>(rows:T[],kind:Kind,storage?:Pick<Storage,'getItem'>):T[]{
 if(!storage&&typeof window==='undefined')return rows;
 try{const raw=JSON.parse((storage||localStorage).getItem(key(kind))||'[]');const ids=new Set(Array.isArray(raw)?raw.filter(id=>typeof id==='string'):[]);return rows.filter(row=>!ids.has(row.id));}catch{return rows;}
}
/** Only called for offline examples. Never suppress real server rows with browser state. */
export function rememberLocalDeletion(id:string,kind:Kind,storage:Pick<Storage,'getItem'|'setItem'>=localStorage):void{
 const raw=JSON.parse(storage.getItem(key(kind))||'[]');
 storage.setItem(key(kind),JSON.stringify([...new Set([...(Array.isArray(raw)?raw:[]),id])]));
}
