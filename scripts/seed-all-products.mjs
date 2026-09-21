import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const additionalProducts = [
  {
    title: 'Tênis de Corrida AlphaFly Next% 2 (Usado 45km)',
    description: 'Tênis utilizado exclusivamente em 2 provas de 21k e um treino longo. Solado com desgaste mínimo (< 5%), cápsulas de Zoom Air 100% íntegras. Tamanho 42 BR. Acompanha caixa original.',
    price: 850.00,
    original_price: 2199.00,
    category: 'Calçados',
    sport: 'Corrida',
    condition: 'como_novo',
    product_type: 'c2c',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
    seller_name: 'Carlos Eduardo Ramos',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    stock: 1,
    views: 2100,
    likes_count: 94,
    location: 'Campinas, SP',
    brand: 'Nike',
    tags: ['Venda Direta', '42 BR', 'Carbono']
  },
  {
    title: 'Ciclocomputador GPS Garmin Edge 530 + Suporte Frontal',
    description: 'Aparelho em excelente estado estético e operacional. Bateria com autonomia de mais de 16 horas. Sem riscos na tela (película de vidro aplicada desde o primeiro dia).',
    price: 1100.00,
    original_price: 2400.00,
    category: 'Tecnologia & Wearables',
    sport: 'Ciclismo',
    condition: 'usado_excelente',
    product_type: 'c2c',
    images: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80'],
    seller_name: 'Juliana Vasconcelos',
    seller_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    stock: 1,
    views: 1450,
    likes_count: 82,
    location: 'Ribeirão Preto, SP',
    brand: 'Garmin',
    tags: ['GPS', 'Strava Live', 'Película']
  },
  {
    title: 'Quadro Road Carbono Disc Tamanho 54cm',
    description: 'Quadro em carbono Toray T800 compatível com freios a disco Flat Mount e eixos passantes 12x142mm / 12x100mm. Acompanha garfo carbono, canote e movimento central Shimano.',
    price: 3200.00,
    original_price: 5800.00,
    category: 'Equipamentos',
    sport: 'Ciclismo',
    condition: 'usado_excelente',
    product_type: 'c2c',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'],
    seller_name: 'Felipe Martins',
    seller_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    stock: 1,
    views: 890,
    likes_count: 51,
    location: 'Porto Alegre, RS',
    brand: 'Trek / Emonda',
    tags: ['54cm', 'Disc Brake', 'Carbono']
  },
  {
    title: 'Kettlebell de Competição 24kg em Aço Maciço',
    description: 'Padrão olímpico de competição com alça de 33mm em aço sem verniz para melhor aderência de magnésio. Cor verde oficial. Sem amassados ou ferrugem.',
    price: 310.00,
    original_price: 490.00,
    category: 'Equipamentos',
    sport: 'Crossfit & Funcional',
    condition: 'usado_bom',
    product_type: 'c2c',
    images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80'],
    seller_name: 'Rodrigo Brandão',
    seller_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    stock: 1,
    views: 520,
    likes_count: 29,
    location: 'Rio de Janeiro, RJ',
    brand: 'Rogue Fitness',
    tags: ['24kg', 'Competição', 'Retirada RJ']
  },
  {
    title: 'Rolo de Treino Smart Interativo Wahoo KICKR v5 Direct Drive',
    description: 'Simula inclinações de até 20% com precisão de potência de +/- 1%. Conexão ANT+ FE-C e Bluetooth Smart com calibração automática.',
    price: 6800.00,
    original_price: 9200.00,
    category: 'Equipamentos',
    sport: 'Ciclismo',
    condition: 'como_novo',
    product_type: 'c2c',
    images: ['https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80'],
    seller_name: 'Lucas Pinho',
    seller_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    stock: 1,
    views: 1890,
    likes_count: 110,
    location: 'São Paulo, SP',
    brand: 'Wahoo',
    tags: ['Direct Drive', 'Zwift Ready', 'Silencioso']
  },
  {
    title: 'Óculos Esportivo Fotocromático Oakley Radar EV Path',
    description: 'Lente fotocromática que escurece automaticamente conforme a intensidade dos raios solares. Armação O Matter super leve com borrachas Unobtainium.',
    price: 790.00,
    original_price: 1350.00,
    category: 'Acessórios',
    sport: 'Ciclismo',
    condition: 'usado_excelente',
    product_type: 'c2c',
    images: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80'],
    seller_name: 'Fernanda Leite',
    seller_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    stock: 1,
    views: 940,
    likes_count: 73,
    location: 'Curitiba, PR',
    brand: 'Oakley',
    tags: ['Fotocromático', 'Ciclismo & Corrida', 'Radar EV']
  }
];

async function seedRemaining() {
  await client.connect();
  for (const p of additionalProducts) {
    const exists = await client.query('SELECT id FROM public.products WHERE title = $1', [p.title]);
    if (exists.rows.length === 0) {
      await client.query(`
        INSERT INTO public.products (
          title, description, price, original_price, category, sport, condition,
          product_type, images, seller_name, seller_avatar, stock, views, likes_count,
          location, brand, tags, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'active')
      `, [
        p.title, p.description, p.price, p.original_price, p.category, p.sport,
        p.condition, p.product_type, p.images, p.seller_name, p.seller_avatar,
        p.stock, p.views, p.likes_count, p.location, p.brand, p.tags
      ]);
    }
  }
  const count = await client.query('SELECT count(*) FROM public.products');
  console.log(`Total products in Supabase: ${count.rows[0].count}`);
  await client.end();
}

seedRemaining().catch(console.error);
