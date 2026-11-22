// Temporary acquisition diagnostics for publicly accessible supplier catalog endpoints.
// No credentials, customer data, or request bursts.
const suppliers = [
 ['penalty','https://www.penalty.com.br/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['umbro','https://www.umbro.com.br/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['fila','https://www.fila.com.br/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['olympikus','https://www.olympikus.com.br/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['mizuno','https://www.mizuno.com.br/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['havaianas','https://havaianas.com.br/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['puma','https://br.puma.com/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['centauro','https://www.centauro.com.br/api/catalog_system/pub/products/search?_from=0&_to=4'],
 ['hb','https://www.hb.com.br/products.json?limit=5'],
];
for(const [name,url] of suppliers) {
 try {
  const response=await fetch(url,{headers:{'accept':'application/json','user-agent':'Mozilla/5.0 (CoreMotion educational catalog review)'},signal:AbortSignal.timeout(11000)});
  const body=await response.text();
  let parsed;try{parsed=JSON.parse(body)}catch{parsed=null}
  const items=Array.isArray(parsed)?parsed:parsed?.products||[];
  console.log('CATALOG_PROBE '+JSON.stringify({name,status:response.status,length:body.length,count:items.length,samples:items.slice(0,2).map(p=>({id:p.productId||p.id,title:p.productName||p.title,link:p.link||p.handle,images:p.items?.[0]?.images?.length||p.images?.length}))}));
 } catch(err){console.log('CATALOG_PROBE '+JSON.stringify({name,error:String(err).slice(0,200)}))}
}
