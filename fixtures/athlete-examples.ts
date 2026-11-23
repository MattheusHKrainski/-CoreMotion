import type {Product} from '@/lib/types';
/** Visual examples only. Never merged into the real Supabase catalog. */
const items=[
 ['bola-treino','Bola para treino de vôlei','Vôlei','Equipamentos','/products/bola-volei.jpg',65],
 ['raquete-treino','Raquete para aulas de tênis','Tênis','Equipamentos','/products/raquete-tenis.jpg',120],
 ['kimono-treino','Kimono para treinos de jiu-jitsu','Jiu-Jitsu','Vestuário','/products/kimono-jiujitsu.jpg',150],
 ['mochila-treino','Mochila para levar equipamentos','Multiesportes','Acessórios','/products/mochila-esportiva.jpg',75],
 ['corta-vento-treino','Jaqueta corta-vento para corrida','Corrida','Vestuário','/products/jaqueta-corta-vento.jpg',95],
 ['bermuda-treino','Bermuda para treinos de academia','Musculação','Vestuário','/products/bermuda-compressao-1.jpg',40],
 ['camiseta-treino','Camiseta esportiva para treinar','Multiesportes','Vestuário','/products/dry-fit-shirt-1.jpg',35],
 ['pulseira-treino','Pulseira para acompanhar atividades','Corrida','Tecnologia & Wearables','/products/smartband-fitness-1.jpg',85],
] as const;
export const ATHLETE_EXAMPLES:Product[]=items.map(([key,title,sport,category,image,price],index)=>({
 id:`example-athlete-${key}`,title:`Exemplo fictício — ${title}`,
 description:'Exemplo fictício de anúncio, criado apenas para demonstrar a página. Foto de referência ilustrativa; preço simulado, sem vendedor real, estoque ou negociação disponível.',
 price,category,sport,condition:'usado_bom',product_type:'c2c',image_is_reference:true,images:[image],
 seller_id:`fictional-example-${index+1}`,seller_name:`Atleta fictício ${index+1}`,location:'Local ilustrativo',
 shipping_available:false,stock:0,views:0,likes_count:0,status:'active',created_at:'2026-10-22T12:00:00.000Z',tags:['Exemplo fictício',sport],
}));
