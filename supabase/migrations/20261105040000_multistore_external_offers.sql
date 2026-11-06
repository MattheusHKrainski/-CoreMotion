-- Curated batch checked on 2026-11-05; preserve edited/inactive offers and later deletions.
CREATE TABLE IF NOT EXISTS public.catalog_seed_batches (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT NOW());
REVOKE ALL ON public.catalog_seed_batches FROM anon, authenticated;
WITH claimed AS (
 INSERT INTO public.catalog_seed_batches(id) VALUES ('offers-multi-store-2026-11-05')
 ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.external_offers
 (id,title,description,store_name,category,sport,price,original_price,image_url,source_url,is_active,created_at)
SELECT seed.id,seed.title,seed.description,seed.store_name,seed.category,seed.sport,seed.price,seed.original_price,seed.image_url,seed.source_url,seed.is_active,seed.created_at
FROM jsonb_to_recordset($multi_store$[
  {
    "id": "offer-centauro-penalty-vp5000-946720",
    "title": "Bola de Vôlei Penalty VP 5000 Amarela e Roxa",
    "description": "Referência 946720. Bola de vôlei com 18 gomos, revestimento PU Super Soft e tecnologia Ultra Fusion. Enviada vazia; bomba não incluída. Confira preço, vendedor e estoque na loja.",
    "store_name": "Centauro",
    "category": "Equipamentos",
    "sport": "Vôlei",
    "price": 170.91,
    "source_url": "https://www.centauro.com.br/bola-de-volei-penalty-vp-5000-946720.html",
    "image_url": "https://imgcentauro-a.akamaihd.net/1024x1024/94672020A5.jpg",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T12:00:00.000Z"
  },
  {
    "id": "offer-centauro-natural-halter-m0075c",
    "title": "Halter Natural Fitness Emborrachado 3 kg — Unidade",
    "description": "Referência M0075C. Um halter de ferro fundido com revestimento em PVC, peso de 3 kg e medidas aproximadas de 24 × 7 × 7 cm. Vendido por unidade, não é um par. Confira cor, vendedor e condições na loja.",
    "store_name": "Centauro",
    "category": "Equipamentos",
    "sport": "Musculação",
    "price": 32.47,
    "source_url": "https://www.centauro.com.br/halter-de-3--kg-emborrachado-peso-para-musculacao-academia-----natural-fitness-m0075c-mktp.html",
    "image_url": "https://imgcentauro-a.akamaihd.net/1500x1500/M0075C06A1.jpg",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T11:59:59.000Z"
  },
  {
    "id": "offer-adidas-garrafa-kv8999",
    "title": "Garrafa Metálica Adidas com Canudo 600 ml Preta",
    "description": "Referência KV8999. Garrafa de aço inoxidável de 600 ml com canudo, na cor preta. Confira disponibilidade e condições de pagamento no site da Adidas.",
    "store_name": "Adidas",
    "category": "Acessórios",
    "sport": "Treinamento funcional",
    "price": 199.99,
    "source_url": "https://www.adidas.com.br/garrafa-metalica-canudo-0_6-l/KV8999.html",
    "image_url": "https://assets.adidas.com/images/w_500,f_auto,q_auto/18a3c3982a364fe1a81d5c275eea88b9_9366/Garrafa_Metalica_Canudo_06_l_Preto_KV8999_01_00_standard.jpg",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T11:59:58.000Z"
  },
  {
    "id": "offer-adidas-camiseta-kd5453",
    "title": "Camiseta Adidas Workout Essentials Base Branca",
    "description": "Referência KD5453, cor White. Camiseta da linha Training. A fotografia mostra a camiseta vestida pelo modelo; os demais itens do look não estão incluídos. Confira medidas, tamanhos e disponibilidade na loja.",
    "store_name": "Adidas",
    "category": "Vestuário",
    "sport": "Musculação",
    "price": 129.99,
    "source_url": "https://www.adidas.com.br/camiseta-workout-essentials-base/KD5453.html",
    "image_url": "https://assets.adidas.com/images/w_500,f_auto,q_auto/ff5cff3c2c0342e2820f6a877288fe46_9366/CAMISETA_WORKOUT_ESSENTIALS_BASE_Branco_KD5453_21_model.jpg",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T11:59:57.000Z"
  },
  {
    "id": "offer-olympikus-estilo2-43359278",
    "title": "Tênis Olympikus Estilo 2 Verde",
    "description": "Referência 43359278_3-834. Tênis para treino e rotina diária, cabedal em Jacquard e tecnologias Evasense e Supporter. Preço cadastrado sem exigir Pix; numeração, desconto à vista e estoque devem ser conferidos na loja.",
    "store_name": "Olympikus",
    "category": "Calçados",
    "sport": "Treinamento funcional",
    "price": 199.99,
    "original_price": 259.99,
    "source_url": "https://www.olympikus.com.br/tenis-olympikus-estilo-2-unissex-43359278-3-834/p",
    "image_url": "https://vulcabras.vtexassets.com/arquivos/ids/281992-800-800/43359278_3-834-01.jpg?v=638260848481370000&width=800&height=800",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T11:59:56.000Z"
  },
  {
    "id": "offer-olympikus-corremax-43758365",
    "title": "Tênis Olympikus Corre Max Cinza",
    "description": "Referência 43758365_3-016. Tênis de corrida com entressola Eleva Pro Max, borracha Gripper e palmilha Ortholite. Preço cadastrado sem exigir Pix; confira numeração, disponibilidade e condições de pagamento na loja.",
    "store_name": "Olympikus",
    "category": "Calçados",
    "sport": "Corrida",
    "price": 389.99,
    "original_price": 549.99,
    "source_url": "https://www.olympikus.com.br/tenis-olympikus-corre-max-43758365-3-016/p",
    "image_url": "https://vulcabras.vtexassets.com/arquivos/ids/292744-800-800/43758365-01.jpg?v=638780163321700000&width=800&height=800",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T11:59:55.000Z"
  },
  {
    "id": "offer-netshoes-wilson-drvpro-d25-5434-042",
    "title": "Bola de Basquete Wilson NBA DRV Pro Laranja",
    "description": "Referência D25-5434-042. Bola de borracha para quadras externas; tamanho oficial 7 segundo o vendedor. Oferta de lojista parceiro na Netshoes. Preço cadastrado sem exigir Pix. Confira vendedor, frete e disponibilidade antes de comprar.",
    "store_name": "Netshoes",
    "category": "Equipamentos",
    "sport": "Basquete",
    "price": 174.24,
    "original_price": 198,
    "source_url": "https://www.netshoes.com.br/p/bola-de-basquete-wilson-nba-drv-pro-laranja-D25-5434-042",
    "image_url": "https://static.netshoes.com.br/produtos/bola-de-basquete-wilson-nba-drv-pro/42/D25-5434-042/D25-5434-042_zoom1.jpg?ts=1788435986&ims=544x",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T11:59:54.000Z"
  },
  {
    "id": "offer-netshoes-adidas-trionda-fba-7868-014",
    "title": "Bola de Futebol Adidas Trionda Copa 2026 Club Branca",
    "description": "Referência FBA-7868-014. Versão Club para uso recreativo e treinos, em TPU com costura à máquina. Não é a versão Pro de jogo. Oferta da loja Adidas na Netshoes. Preço cadastrado sem exigir Pix; confira as condições na página do produto.",
    "store_name": "Netshoes",
    "category": "Equipamentos",
    "sport": "Futebol",
    "price": 139.99,
    "original_price": 179.99,
    "source_url": "https://www.netshoes.com.br/p/bola-de-futebol-campo-adidas-trionda-copa-do-mundo-2026-club-branco-FBA-7868-014",
    "image_url": "https://static.netshoes.com.br/produtos/bola-de-futebol-campo-adidas-trionda-copa-do-mundo-2026-club/14/FBA-7868-014/FBA-7868-014_zoom1.jpg?ts=1783965329&ims=544x",
    "is_active": true,
    "is_demo": false,
    "created_at": "2026-11-05T11:59:53.000Z"
  }
]$multi_store$::jsonb) AS seed(
 id text,title text,description text,store_name text,category text,sport text,price numeric,original_price numeric,image_url text,source_url text,is_active boolean,created_at timestamptz
)
WHERE EXISTS(SELECT 1 FROM claimed)
 AND NOT EXISTS(SELECT 1 FROM public.external_offers existing WHERE existing.source_url=seed.source_url)
ON CONFLICT(id) DO NOTHING;
