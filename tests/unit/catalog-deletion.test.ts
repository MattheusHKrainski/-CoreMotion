import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CatalogReadFence,localCatalogRows,rememberLocalDeletion} from '@/lib/catalog-deletion';
const memory=()=>{const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)||null,setItem:(key:string,value:string)=>{data.set(key,value);}};};
it('exclusão local sobrevive à reconstrução dos exemplos sem afetar outros produtos',()=>{
 const storage=memory(),rows=[{id:'deleted'},{id:'kept'}];
 rememberLocalDeletion('deleted','athlete',storage);
 assert.deepEqual(localCatalogRows(rows,'athlete',storage),[{id:'kept'}]);
 assert.deepEqual(localCatalogRows([...rows],'athlete',storage),[{id:'kept'}]);
 assert.deepEqual(localCatalogRows(rows,'store',storage),rows);
 rememberLocalDeletion('deleted','store',storage);
 assert.deepEqual(localCatalogRows(rows,'store',storage),[{id:'kept'}]);
});
it('uma leitura antiga não recoloca um produto excluído e uma restauração explícita pode reaparecer',()=>{
 const fence=new CatalogReadFence(),rows=[{id:'deleted'},{id:'kept'}];
 const oldRead=fence.begin();fence.remove('deleted');
 assert.deepEqual(fence.filter(rows,oldRead),[{id:'kept'}]);
 const afterRestoreRead=fence.begin();
 assert.deepEqual(fence.filter(rows,afterRestoreRead),rows);
});
it('consulta de produto não substitui falha do banco por exemplo e lista vazia limpa estado antigo',()=>{
 const service=readFileSync('services/products.ts','utf8');
 assert.match(service,/!isSupabaseConfigured && DEMO_MODE \? localCatalogRows/);
 assert.match(service,/productReadFence.filter/);
 const store=readFileSync('lib/store.tsx','utf8');
 assert.doesNotMatch(store,/if \(allProducts.length > 0\) setProducts/);
 assert.match(store,/rememberLocalDeletion\(id,'store'\)/);
 assert.match(store,/offerReadFence.filter/);
});
it('ícones do rodapé usam os links fornecidos em novas abas protegidas',()=>{
 const footer=readFileSync('components/shared/Footer.tsx','utf8');
 assert.match(footer,/href="https:\/\/www.instagram.com\/coremotion_ofc\?utm_source=qr&knvt=MWhnZ3g3bXlnYWs5Yw=="/);
 assert.match(footer,/href="https:\/\/youtube.com\/shorts\/SmPnzW26o3Y\?si=NVimI5eVQPgWp7vs"/);
 assert.doesNotMatch(footer,/#redes-sociais/);
 assert.equal((footer.match(/target="_blank" rel="noopener noreferrer"/g)||[]).length,2);
});
