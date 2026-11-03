import type { Product } from '@/lib/types';
import { CATALOG_EXPANSION } from './catalog-expansion';

/** Initial catalog, not a verification of ownership, authenticity or current inventory.
 * Names describe the pictured item; unverified model/brand claims were removed.
 */
const REVIEWED_ATHLETE_LISTINGS: Product[] = [
  {
    "id": "c2c-luvas-boxe-everlast-14oz",
    "title": "Par de Luvas de Boxe Vermelhas com Bandagens",
    "description": "Luvas vermelhas com fechamento por velcro e bandagens pretas mostradas ao lado. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 140,
    "category": "Artes Marciais",
    "sport": "Boxe",
    "condition": "usado_bom",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/luvas-boxe-casa.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Henrique Tavares",
    "location": "Curitiba, PR",
    "shipping_available": true,
    "stock": 1,
    "views": 412,
    "likes_count": 34,
    "status": "active",
    "created_at": "2026-10-22T15:30:00.000Z",
    "tags": [
      "Boxe",
      "Artes Marciais"
    ]
  },
  {
    "id": "c2c-garmin-forerunner-255",
    "title": "Relógio GPS Garmin Preto com Cabo de Carregamento",
    "description": "Relógio esportivo Garmin preto acompanhado do cabo mostrado na imagem. Confirme o modelo e a autonomia com o anunciante. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 850,
    "category": "Tecnologia & Wearables",
    "sport": "Corrida",
    "condition": "seminovo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/relogio-garmin-mesa.jpg"
    ],
    "seller_id": "user-c2c-2",
    "seller_name": "Mariana Alencar",
    "location": "São Paulo, SP",
    "shipping_available": true,
    "stock": 1,
    "views": 685,
    "likes_count": 61,
    "status": "active",
    "created_at": "2026-10-22T15:10:00.000Z",
    "tags": [
      "Corrida",
      "Tecnologia & Wearables"
    ],
    "brand": "Garmin"
  },
  {
    "id": "c2c-joelheira-volei-nova",
    "title": "Par de Joelheiras de Vôlei Pretas",
    "description": "Par de joelheiras pretas. Confirme o tamanho e a composição do acolchoamento com o anunciante. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 60,
    "category": "Acessórios",
    "sport": "Vôlei",
    "condition": "novo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/joelheira-volei-cama.jpg"
    ],
    "seller_id": "user-c2c-2",
    "seller_name": "Letícia Bastos",
    "location": "Belo Horizonte, MG",
    "shipping_available": true,
    "stock": 1,
    "views": 294,
    "likes_count": 27,
    "status": "active",
    "created_at": "2026-10-22T14:50:00.000Z",
    "tags": [
      "Vôlei",
      "Acessórios"
    ]
  },
  {
    "id": "c2c-raquete-beach-tennis-3k",
    "title": "Raquete de Beach Tennis Preta com Capa",
    "description": "Raquete de beach tennis preta e capa visível na imagem. Material, peso e medidas devem ser confirmados com o anunciante. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 280,
    "category": "Equipamentos",
    "sport": "Beach Tennis",
    "condition": "usado_excelente",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/raquete-beach-tennis-casa.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Gustavo Peçanha",
    "location": "Florianópolis, SC",
    "shipping_available": true,
    "stock": 1,
    "views": 378,
    "likes_count": 39,
    "status": "active",
    "created_at": "2026-10-22T14:30:00.000Z",
    "tags": [
      "Beach Tennis",
      "Equipamentos"
    ]
  },
  {
    "id": "c2c-halteres-ferro-20kg",
    "title": "Par de Halteres Ajustáveis com Anilhas",
    "description": "Dois halteres ajustáveis com anilhas. Confira o peso total, as roscas e as travas antes de negociar. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 220,
    "category": "Equipamentos",
    "sport": "Musculação",
    "condition": "usado_bom",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/halteres-ferro-chao.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Daniel Siqueira",
    "location": "Porto Alegre, RS",
    "shipping_available": true,
    "stock": 1,
    "views": 519,
    "likes_count": 48,
    "status": "active",
    "created_at": "2026-10-22T14:10:00.000Z",
    "tags": [
      "Musculação",
      "Equipamentos"
    ]
  },
  {
    "id": "c2c-oculos-natacao-speedo-novo",
    "title": "Óculos de Natação Espelhados com Acessórios",
    "description": "Óculos espelhados, estojo transparente e acessórios visíveis na imagem. Confirme quais peças acompanham o anúncio. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 70,
    "category": "Acessórios",
    "sport": "Natação",
    "condition": "novo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/oculos-natacao-novo.jpg"
    ],
    "seller_id": "user-c2c-2",
    "seller_name": "Priscila Fontes",
    "location": "Salvador, BA",
    "shipping_available": true,
    "stock": 1,
    "views": 263,
    "likes_count": 22,
    "status": "active",
    "created_at": "2026-10-22T13:50:00.000Z",
    "tags": [
      "Natação",
      "Acessórios"
    ]
  },
  {
    "id": "c2c-regata-basquete-lakers-g",
    "title": "Regata de Basquete Lakers 23 Amarela",
    "description": "Regata amarela com inscrição Lakers e número 23. Confirme medidas, material e procedência; a foto não comprova autenticidade. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 100,
    "category": "Vestuário",
    "sport": "Basquete",
    "condition": "seminovo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/regata-basquete-cabide.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Matheus Queiroz",
    "location": "Campinas, SP",
    "shipping_available": true,
    "stock": 1,
    "views": 441,
    "likes_count": 43,
    "status": "active",
    "created_at": "2026-10-22T13:30:00.000Z",
    "tags": [
      "Basquete",
      "Vestuário"
    ]
  },
  {
    "id": "c2c-capacete-giro-mips-m",
    "title": "Capacete de Ciclismo Preto",
    "description": "Capacete de ciclismo preto. Confirme modelo, ajuste, integridade e histórico de impactos antes de qualquer uso. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 100,
    "category": "Acessórios",
    "sport": "Ciclismo",
    "condition": "seminovo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/capacete-ciclismo-mesa.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Fábio Rezende",
    "location": "Curitiba, PR",
    "shipping_available": true,
    "stock": 1,
    "views": 318,
    "likes_count": 29,
    "status": "active",
    "created_at": "2026-10-22T13:10:00.000Z",
    "tags": [
      "Ciclismo",
      "Acessórios"
    ]
  },
  {
    "id": "c2c-kit-protecao-karate-m",
    "title": "Kit de Proteção para Karatê Azul",
    "description": "Par de luvas e protetores de canela e pé azuis. Confirme numeração e itens incluídos. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 140,
    "category": "Artes Marciais",
    "sport": "Karatê",
    "condition": "como_novo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/kit-protecao-karate-tatame.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Marcelo Nishimura",
    "location": "Londrina, PR",
    "shipping_available": true,
    "stock": 1,
    "views": 247,
    "likes_count": 19,
    "status": "active",
    "created_at": "2026-10-22T12:50:00.000Z",
    "tags": [
      "Karatê",
      "Artes Marciais"
    ]
  },
  {
    "id": "c2c-raqueteira-wilson-3x",
    "title": "Raqueteira Preta e Vermelha com Alças",
    "description": "Bolsa raqueteira preta e vermelha com alças. As raquetes na foto não fazem parte do preço; confirme capacidade e medidas. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 130,
    "category": "Acessórios",
    "sport": "Tênis",
    "condition": "usado_bom",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/c2c/raqueteira-wilson-chao.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Eduardo Paiva",
    "location": "Rio de Janeiro, RJ",
    "shipping_available": true,
    "stock": 1,
    "views": 289,
    "likes_count": 24,
    "status": "active",
    "created_at": "2026-10-22T12:30:00.000Z",
    "tags": [
      "Tênis",
      "Acessórios"
    ]
  },
  {
    "id": "c2c-tenis-nike-pegasus-40-41",
    "title": "Tênis Esportivo Nike Vermelho",
    "description": "Tênis Nike vermelho com logo e sola em detalhes claros. Não há confirmação do modelo Pegasus; confira numeração e desgaste com o anunciante. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 160,
    "category": "Calçados",
    "sport": "Corrida",
    "condition": "usado_bom",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/nike-pegasus-1.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Carlos Eduardo Ramos",
    "location": "Campinas, SP",
    "shipping_available": true,
    "stock": 1,
    "views": 534,
    "likes_count": 46,
    "status": "active",
    "created_at": "2026-10-22T12:10:00.000Z",
    "tags": [
      "Corrida",
      "Calçados"
    ],
    "brand": "Nike"
  },
  {
    "id": "c2c-tenis-asics-nimbus-26-42",
    "title": "Tênis Esportivo Nike Cinza com Detalhes Pretos",
    "description": "Tênis Nike cinza com detalhes pretos. O produto da imagem não é Asics; confirme modelo e numeração antes de negociar. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 180,
    "category": "Calçados",
    "sport": "Treino",
    "condition": "como_novo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/asics-gel-nimbus-1.jpg"
    ],
    "seller_id": "user-c2c-2",
    "seller_name": "Renato Vasconcelos",
    "location": "Goiânia, GO",
    "shipping_available": true,
    "stock": 1,
    "views": 612,
    "likes_count": 55,
    "status": "active",
    "created_at": "2026-10-22T11:50:00.000Z",
    "tags": [
      "Treino",
      "Calçados"
    ],
    "brand": "Nike"
  },
  {
    "id": "c2c-camisa-selecao-torcedor-g",
    "title": "Camiseta Esportiva Amarela com Detalhes Verdes",
    "description": "Camiseta amarela com gola e acabamentos verdes e bandeira do Brasil. Confirme medidas e composição; não há comprovação de licenciamento oficial. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 65,
    "category": "Vestuário",
    "sport": "Futebol",
    "condition": "como_novo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/brasil-camisa-amarela.png"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Thiago Nogueira",
    "location": "Recife, PE",
    "shipping_available": true,
    "stock": 1,
    "views": 391,
    "likes_count": 35,
    "status": "active",
    "created_at": "2026-10-22T11:30:00.000Z",
    "tags": [
      "Futebol",
      "Vestuário"
    ]
  },
  {
    "id": "c2c-jaqueta-corta-vento-running",
    "title": "Jaqueta Esportiva Preta com Capuz",
    "description": "Jaqueta preta com capuz e fechamento frontal. Não há comprovação de impermeabilidade; confirme tamanho e tecido. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 85,
    "category": "Vestuário",
    "sport": "Corrida",
    "condition": "como_novo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/jaqueta-corta-vento.jpg"
    ],
    "seller_id": "user-c2c-2",
    "seller_name": "Marina Duarte",
    "location": "Curitiba, PR",
    "shipping_available": true,
    "stock": 1,
    "views": 312,
    "likes_count": 28,
    "status": "active",
    "created_at": "2026-10-22T11:10:00.000Z",
    "tags": [
      "Corrida",
      "Vestuário"
    ]
  },
  {
    "id": "c2c-mochila-impermeavel-28l",
    "title": "Mochila Esportiva Preta com Bolsos Frontais",
    "description": "Mochila preta com vários bolsos e alças acolchoadas. Confirme dimensões e capacidade; marca e impermeabilidade não foram comprovadas. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 95,
    "category": "Acessórios",
    "sport": "Treino",
    "condition": "usado_excelente",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/mochila-esportiva.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "Vitor Camargo",
    "location": "Joinville, SC",
    "shipping_available": true,
    "stock": 1,
    "views": 276,
    "likes_count": 23,
    "status": "active",
    "created_at": "2026-10-22T10:50:00.000Z",
    "tags": [
      "Treino",
      "Acessórios"
    ]
  },
  {
    "id": "c2c-smartband-monitor-cardiaco",
    "title": "Pulseira Fitness Preta com Tela Colorida",
    "description": "Pulseira fitness preta com tela colorida. Confirme modelo, compatibilidade do aplicativo, bateria e funções disponíveis. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 65,
    "category": "Tecnologia & Wearables",
    "sport": "Treino",
    "condition": "usado_bom",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/smartband-fitness-1.jpg"
    ],
    "seller_id": "user-c2c-2",
    "seller_name": "Camila Peixoto",
    "location": "Brasília, DF",
    "shipping_available": true,
    "stock": 1,
    "views": 229,
    "likes_count": 18,
    "status": "active",
    "created_at": "2026-10-22T10:30:00.000Z",
    "tags": [
      "Treino",
      "Tecnologia & Wearables"
    ]
  },
  {
    "id": "c2c-garrafa-termica-inox-750ml",
    "title": "Garrafa Esportiva Verde com Tampa de Rosca",
    "description": "Garrafa verde com tampa de rosca. Confirme material e volume; não há comprovação da marca Stanley ou de isolamento térmico. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 35,
    "category": "Acessórios",
    "sport": "Treino",
    "condition": "novo",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/garrafa-termica-1.jpg"
    ],
    "seller_id": "user-c2c-1",
    "seller_name": "André Nogueira",
    "location": "Santos, SP",
    "shipping_available": true,
    "stock": 1,
    "views": 198,
    "likes_count": 16,
    "status": "active",
    "created_at": "2026-10-22T10:10:00.000Z",
    "tags": [
      "Treino",
      "Acessórios"
    ]
  },
  {
    "id": "c2c-bone-nike-aerobill-preto",
    "title": "Boné Esportivo Branco",
    "description": "Boné branco com aba curva. Não há marca visível; confirme ajuste, tecido e conservação. Imagem de referência: solicite fotos atuais e confirme conservação e disponibilidade pelo contato do anúncio.",
    "price": 25,
    "category": "Acessórios",
    "sport": "Corrida",
    "condition": "usado_excelente",
    "usage_time": "Conservação a confirmar com o anunciante",
    "product_type": "c2c",
    "image_is_reference": true,
    "images": [
      "/products/bone-aerobill-1.jpg"
    ],
    "seller_id": "user-c2c-2",
    "seller_name": "Juliana Vasconcelos",
    "location": "Florianópolis, SC",
    "shipping_available": true,
    "stock": 1,
    "views": 215,
    "likes_count": 21,
    "status": "active",
    "created_at": "2026-10-22T09:50:00.000Z",
    "tags": [
      "Corrida",
      "Acessórios"
    ]
  }
];

export const ADDED_ATHLETE_LISTINGS: Product[] = CATALOG_EXPANSION.map((item, index) => ({
  id: `c2c-${item.key}`, title: item.title,
  description: item.description + ' Imagem de referência do modelo, obtida na galeria da loja. Solicite fotos atuais e confirme conservação e disponibilidade antes de negociar.',
  price: item.athletePrice, category: item.category, sport: item.sport, brand: item.brand,
  condition: 'seminovo', usage_time: 'Conservação a confirmar com o anunciante', product_type: 'c2c',
  image_is_reference: true, images: [item.athlete_image], seller_id: 'catalog-athlete-contact', seller_name: 'Anunciante CoreMotion',
  location: 'Curitiba, PR', shipping_available: true, stock: 1, views: 0, likes_count: 0,
  status: 'active', tags: [item.sport, item.category],
  created_at: new Date(Date.UTC(2026, 10, 3, 12, 0, 0) - index * 1000).toISOString(),
}));

export const ATHLETE_C2C_LISTINGS: Product[] = [...ADDED_ATHLETE_LISTINGS, ...REVIEWED_ATHLETE_LISTINGS];
