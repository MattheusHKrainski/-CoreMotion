import pg from 'pg';
import { pgSsl } from './lib/pg-ssl.mjs';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: pgSsl()
});

const storesToSeed = [
  {
    name: 'Perfil de loja demonstrativo 01',
    slug: 'velocita-performance',
    description: 'Perfil B2C demonstrativo para Corrida & Maratona. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80',
    category: 'Corrida & Maratona',
    is_verified: false,
    verification_status: 'none',
    cnpj: '18.421.902/0001-44',
    contact_email: 'lojista-demo-01@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Jardins, São Paulo - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 02',
    slug: 'keep-running-brasil',
    description: 'Perfil B2C demonstrativo para Corrida & Performance. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
    category: 'Corrida & Performance',
    is_verified: false,
    verification_status: 'none',
    cnpj: '24.119.832/0001-90',
    contact_email: 'lojista-demo-02@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Vila Madalena, São Paulo - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 03',
    slug: 'spaceman-bike-lab',
    description: 'Perfil B2C demonstrativo para Ciclismo & Triatlo. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80',
    category: 'Ciclismo & Triatlo',
    is_verified: false,
    verification_status: 'none',
    cnpj: '31.204.551/0001-12',
    contact_email: 'lojista-demo-03@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Pinheiros, São Paulo - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 04',
    slug: 'dux-nutrition-official',
    description: 'Perfil B2C demonstrativo para Nutrição & Suplementos. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
    category: 'Nutrição & Suplementos',
    is_verified: false,
    verification_status: 'none',
    cnpj: '21.094.331/0001-08',
    contact_email: 'lojista-demo-04@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'São Paulo - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 05',
    slug: 'aquatri-specialist',
    description: 'Perfil B2C demonstrativo para Triatlo & Natação. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200&q=80',
    category: 'Triatlo & Natação',
    is_verified: false,
    verification_status: 'none',
    cnpj: '19.822.401/0001-33',
    contact_email: 'lojista-demo-05@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Jurerê Internacional, Florianópolis - SC',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 06',
    slug: 'top-run-curitiba',
    description: 'Perfil B2C demonstrativo para Corrida & Performance. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?w=1200&q=80',
    category: 'Corrida & Performance',
    is_verified: false,
    verification_status: 'none',
    cnpj: '29.330.118/0001-72',
    contact_email: 'lojista-demo-06@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Batel, Curitiba - PR',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 07',
    slug: 'pedal-pro-rio',
    description: 'Perfil B2C demonstrativo para Ciclismo de Estrada. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80',
    category: 'Ciclismo de Estrada',
    is_verified: false,
    verification_status: 'none',
    cnpj: '15.912.482/0001-20',
    contact_email: 'lojista-demo-07@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Leblon, Rio de Janeiro - RJ',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 08',
    slug: 'montanha-trilha-brasil',
    description: 'Perfil B2C demonstrativo para Trail Running & Aventura. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    category: 'Trail Running & Aventura',
    is_verified: false,
    verification_status: 'none',
    cnpj: '28.109.444/0001-65',
    contact_email: 'lojista-demo-08@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Campos do Jordão - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 09',
    slug: 'wahoo-smart-trainers',
    description: 'Perfil B2C demonstrativo para Ciclismo & Tecnologia. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    category: 'Ciclismo & Tecnologia',
    is_verified: false,
    verification_status: 'none',
    cnpj: '33.910.102/0001-51',
    contact_email: 'lojista-demo-09@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Ribeirão Preto - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 10',
    slug: 'centauro-pro-casual',
    description: 'Perfil B2C demonstrativo para Multiesportes & Casual. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1200&q=80',
    category: 'Multiesportes & Casual',
    is_verified: false,
    verification_status: 'none',
    cnpj: '06.323.491/0001-83',
    contact_email: 'lojista-demo-10@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Barueri - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 11',
    slug: 'track-field-lifestyle',
    description: 'Perfil B2C demonstrativo para Vestuário & Casual Premium. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
    category: 'Vestuário & Casual Premium',
    is_verified: false,
    verification_status: 'none',
    cnpj: '60.404.992/0001-11',
    contact_email: 'lojista-demo-11@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Iguatemi, São Paulo - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 12',
    slug: 'endurance-lab-nutri',
    description: 'Perfil B2C demonstrativo para Nutrição Esportiva. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=1200&q=80',
    category: 'Nutrição Esportiva',
    is_verified: false,
    verification_status: 'none',
    cnpj: '37.810.229/0001-44',
    contact_email: 'lojista-demo-12@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Cambuí, Campinas - SP',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 13',
    slug: 'oakley-eyewear-sport',
    description: 'Perfil B2C demonstrativo para Acessórios & Óculos. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1200&q=80',
    category: 'Acessórios & Óculos',
    is_verified: false,
    verification_status: 'none',
    cnpj: '41.209.881/0001-90',
    contact_email: 'lojista-demo-13@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Savassi, Belo Horizonte - MG',
    rating: 0,
    sales_count: 0
  },
  {
    name: 'Perfil de loja demonstrativo 14',
    slug: 'casual-motion-street',
    description: 'Perfil B2C demonstrativo para Moda Casual & Street. Informações, vínculo com marcas, produtos, estoque e disponibilidade são ilustrativos e não verificados.',
    logo_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80',
    category: 'Moda Casual & Street',
    is_verified: false,
    verification_status: 'none',
    cnpj: '38.441.902/0001-77',
    contact_email: 'lojista-demo-14@exemplo.test',
    contact_phone: '(00) 00000-0000',
    location: 'Vila Mariana, São Paulo - SP',
    rating: 0,
    sales_count: 0
  }
];

async function main() {
  if (process.env.COREMOTIOM_ENABLE_RETIRED_STORE_SEED !== '1') {
    console.warn('Seed de perfis de loja e catálogo B2C aposentado; nenhum dado foi alterado.');
    return;
  }
  await client.connect();
  console.log('Connected to PostgreSQL database for extended catalog seed...');

  // 1. Seed or update stores
  const storeMap = {};
  for (const s of storesToSeed) {
    const existing = await client.query('SELECT id, slug FROM public.stores WHERE slug = $1', [s.slug]);
    let storeId;
    if (existing.rows.length > 0) {
      storeId = existing.rows[0].id;
      await client.query(`
        UPDATE public.stores 
        SET name = $1, description = $2, logo_url = $3, banner_url = $4,
            category = $5, is_verified = $6, verification_status = $7,
            cnpj = $8, contact_email = $9, contact_phone = $10, location = $11,
            rating = $12, sales_count = $13, updated_at = NOW()
        WHERE id = $14
      `, [
        s.name, s.description, s.logo_url, s.banner_url,
        s.category, s.is_verified, s.verification_status,
        s.cnpj, s.contact_email, s.contact_phone, s.location,
        s.rating, s.sales_count, storeId
      ]);
      console.log(`Updated store: ${s.name}`);
    } else {
      const ins = await client.query(`
        INSERT INTO public.stores (
          name, slug, description, logo_url, banner_url, category,
          is_verified, verification_status, cnpj, contact_email, contact_phone,
          location, rating, sales_count, products_count, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, 0, NOW(), NOW()
        ) RETURNING id
      `, [
        s.name, s.slug, s.description, s.logo_url, s.banner_url, s.category,
        s.is_verified, s.verification_status, s.cnpj, s.contact_email, s.contact_phone,
        s.location, s.rating, s.sales_count
      ]);
      storeId = ins.rows[0].id;
      console.log(`Inserted store: ${s.name} (${storeId})`);
    }
    storeMap[s.slug] = storeId;
  }

  // 2. Build massive realistic product catalog (Casual to Elite)
  const productsToSeed = [
    // --- CASUAL & ENTRADA (R$ 49 a R$ 450) ---
    {
      title: 'Meia de Compressão Graduada Dry-Fit CoreMotiom (Cano Médio)',
      description: 'Meia com compressão 15-20 mmHg que acelera o retorno venoso e reduz a vibração muscular durante corridas de rua e treinos na esteira. Costura frontal plana anti-bolhas.',
      price: 49.90,
      original_price: 69.90,
      category: 'Acessórios & Vestuário',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'keep-running-brasil',
      images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      brand: 'CoreMotiom Pro',
      tags: ['Compressão', 'Anti-bolhas', 'Dry-Fit', 'Corrida', 'Casual'],
      stock: 40,
      location: 'São Paulo - SP'
    },
    {
      title: 'Cinto Elástico Porta-Número & Géis com Bolsos Refletivos',
      description: 'Acessório indispensável para maratonas e provas de 10k/21k. Ajuste micrométrico na cintura, prendedor de número de peito e 6 elásticos para géis energéticos.',
      price: 59.90,
      original_price: 79.90,
      category: 'Acessórios & Vestuário',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'keep-running-brasil',
      images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80'],
      brand: 'Keep Running',
      tags: ['Porta-Número', 'Géis', 'Maratona', 'Acessórios'],
      stock: 35,
      location: 'São Paulo - SP'
    },
    {
      title: 'Garrafa Squeeze CamelBak Podium Chill 710ml Isolamento Térmico',
      description: 'Mantém a água ou isotônico gelado pelo dobro do tempo. Bico com válvula de silicone auto-vedante Jet Valve que impede vazamentos na bike ou na mão.',
      price: 99.00,
      original_price: 139.00,
      category: 'Acessórios & Vestuário',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'spaceman-bike-lab',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80'],
      brand: 'CamelBak',
      tags: ['Hidratação', 'Térmica', 'Bicicleta', 'Corrida'],
      stock: 25,
      location: 'São Paulo - SP'
    },
    {
      title: 'Pack 6x Géis Energéticos GU Energy Gel Sortidos (Carboidrato Rápido)',
      description: 'Pacote com 6 unidades em sabores clássicos (Frutas Vermelhas, Caramelo Salgado, Baunilha). 22g de carboidratos de absorção rápida + sódio e potássio.',
      price: 98.00,
      original_price: 120.00,
      category: 'Nutrição & Suplementos',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'endurance-lab-nutri',
      images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'],
      brand: 'GU Energy',
      tags: ['Nutrição', 'Géis', 'Endurance', 'Carboidratos'],
      stock: 50,
      location: 'Campinas - SP'
    },
    {
      title: 'Boné de Corrida Ultraleve Microperfurado com Proteção Solar UV50+',
      description: 'Tecido respirável de secagem rápida com aba flexível anti-deformação e faixa interna para absorção do suor da testa. Peso de apenas 45 gramas.',
      price: 89.90,
      original_price: 119.00,
      category: 'Acessórios & Vestuário',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'casual-motion-street',
      images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'],
      brand: 'Casual Motion',
      tags: ['Boné', 'UV50+', 'Leve', 'Casual', 'Streetwear'],
      stock: 30,
      location: 'São Paulo - SP'
    },
    {
      title: 'Camiseta Casual Esportiva Dry-Fit Respirável Anti-Odor',
      description: 'Camiseta de alta respirabilidade para corrida diária, academia ou uso casual pós-treino. Fibras com tratamento bacteriostático que evita odores.',
      price: 79.90,
      original_price: 109.90,
      category: 'Acessórios & Vestuário',
      sport: 'Multiesportes',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'centauro-pro-casual',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
      brand: 'Centauro Pro',
      tags: ['Camiseta', 'Dry-Fit', 'Casual', 'Treino Diário'],
      stock: 45,
      location: 'Barueri - SP'
    },
    {
      title: 'Tênis Olympikus Corre 3 (anúncio demonstrativo)',
      description: 'O tênis brasileiro mais aclamado pelos corredores. Entressola com tecnologia Eleva Pro para máxima impulsão e cabedal Oxitec super respirável. Drop 8mm, peso 210g.',
      price: 449.90,
      original_price: 499.90,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'velocita-performance',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'],
      brand: 'Olympikus',
      tags: ['Corre 3', 'Nacional', 'Amortecimento Leve', 'Rodagem'],
      stock: 18,
      location: 'São Paulo - SP'
    },
    {
      title: 'Tênis Asics Gel-Excite 10 Amortecimento Macio Masculino',
      description: 'Ideal para treinos diários de 5k a 10k, caminhadas ou uso casual diário. Amortecimento AmpliFoam+ combinado com cápsula de GEL traseira.',
      price: 389.90,
      original_price: 459.90,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'centauro-pro-casual',
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
      brand: 'Asics',
      tags: ['Gel-Excite', 'Iniciante', 'Conforto', 'Casual'],
      stock: 22,
      location: 'Barueri - SP'
    },
    {
      title: 'Whey Protein Isolado 100% Puro DUX Nutrition 900g (Baunilha)',
      description: 'Proteína pura de rápida absorção, zero gorduras trans e baixo carboidrato. 24g de proteína isolada e 5.5g de BCAAs por dose. Ideal para pós-treino e recovery muscular.',
      price: 239.90,
      original_price: 279.90,
      category: 'Nutrição & Suplementos',
      sport: 'Multiesportes',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'dux-nutrition-official',
      images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80'],
      brand: 'DUX Nutrition',
      tags: ['Whey Isolado', 'Recovery', 'Proteína', 'DUX'],
      stock: 60,
      location: 'São Paulo - SP'
    },
    {
      title: 'Creatina Creapure 100% Micronizada DUX Nutrition 300g',
      description: 'Selo alemão Creapure que atesta 99.9% de pureza laboratorial. Auxilia no aumento de força e potência muscular em sprints e treinos de alta intensidade.',
      price: 139.90,
      original_price: 169.90,
      category: 'Nutrição & Suplementos',
      sport: 'Multiesportes',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'dux-nutrition-official',
      images: ['https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=800&q=80'],
      brand: 'DUX Nutrition',
      tags: ['Creatina', 'Creapure', 'Força', 'Potência'],
      stock: 55,
      location: 'São Paulo - SP'
    },
    {
      title: 'Óculos Esportivo Solar Polarizado UV400 Ultraleve Modelo Force',
      description: 'Lente de policarbonato polarizada anti-reflexo que elimina o brilho excessivo do asfalto em dias ensolarados. Apoio nasal emborrachado hidrofílico.',
      price: 149.00,
      original_price: 210.00,
      category: 'Acessórios & Vestuário',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'oakley-eyewear-sport',
      images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'],
      brand: 'Sport Pro',
      tags: ['Óculos', 'Polarizado', 'UV400', 'Ciclismo', 'Corrida'],
      stock: 20,
      location: 'Belo Horizonte - MG'
    },
    {
      title: 'Bolsa de Selim Compacta para Bicicleta Speed e Gravel Impermeável',
      description: 'Capacidade para 2 câmaras de ar, espátulas e ferramenta multifuncional. Fixação firme por tiras de velcro de alta aderência sem oscilação.',
      price: 119.00,
      original_price: 159.00,
      category: 'Equipamentos',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'spaceman-bike-lab',
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'],
      brand: 'Spaceman Lab',
      tags: ['Bolsa Selim', 'Ferramentas', 'Impermeável', 'Bike'],
      stock: 15,
      location: 'São Paulo - SP'
    },

    // --- INTERMEDIÁRIOS & TREINO DIÁRIO (R$ 500 a R$ 1.400) ---
    {
      title: 'Tênis Asics Novablast 4 (Espuma FF BLAST PLUS ECO)',
      description: 'O tênis de treino mais elástico e confortável do momento. Geometria de efeito trampolim no calcanhar que entrega retorno de energia sem placa de carbono.',
      price: 899.99,
      original_price: 999.99,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'velocita-performance',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
      brand: 'Asics',
      tags: ['Novablast 4', 'Rodagem Longa', 'Amortecimento Macio', 'Asics'],
      stock: 14,
      location: 'São Paulo - SP'
    },
    {
      title: 'Tênis Nike Air Zoom Pegasus 41 Espuma ReactX',
      description: 'O clássico cavalo de batalha da Nike com nova entressola ReactX que proporciona 13% mais retorno de energia. Duas cápsulas Zoom Air no antepé e calcanhar.',
      price: 849.99,
      original_price: 949.99,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'keep-running-brasil',
      images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      brand: 'Nike',
      tags: ['Pegasus 41', 'Nike', 'Treino Diário', 'Versatilidade'],
      stock: 16,
      location: 'São Paulo - SP'
    },
    {
      title: 'Tênis Hoka Clifton 9 Amortecimento Máximo Ultraleve',
      description: 'Redução de peso com 3mm adicionais de altura na entressola. Espuma EVA moldada por compressão e geometria Meta-Rocker para transições fluidas.',
      price: 999.90,
      original_price: 1099.90,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'top-run-curitiba',
      images: ['https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80'],
      brand: 'Hoka',
      tags: ['Clifton 9', 'Hoka', 'Máximo Conforto', 'Rodagem'],
      stock: 10,
      location: 'Curitiba - PR'
    },
    {
      title: 'Cinta Cardíaca Peitoral Garmin HRM-Dual ANT+ & Bluetooth Smart',
      description: 'Transmissão em tempo real da frequência cardíaca com precisão médica para relógios Garmin, ciclo-computadores Edge e aplicativos Zwift/Strava. Bateria com duração de até 3,5 anos.',
      price: 590.00,
      original_price: 749.00,
      category: 'Tecnologia & Wearables',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'spaceman-bike-lab',
      images: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80'],
      brand: 'Garmin',
      tags: ['Garmin', 'Frequência Cardíaca', 'HRM-Dual', 'Bluetooth'],
      stock: 15,
      location: 'São Paulo - SP'
    },
    {
      title: 'Óculos de Ciclismo & Corrida Oakley Sutro Lentes Prizm Road',
      description: 'Design de escudo de alta proteção inspirado na vida urbana dos ciclistas. A tecnologia de lente Prizm Road realça detalhes da pista, buracos e marcações viárias.',
      price: 1090.00,
      original_price: 1390.00,
      category: 'Acessórios & Vestuário',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'oakley-eyewear-sport',
      images: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80'],
      brand: 'Oakley',
      tags: ['Oakley', 'Sutro', 'Prizm Road', 'Proteção Total'],
      stock: 8,
      location: 'Belo Horizonte - MG'
    },
    {
      title: 'Capacete Ciclismo Specialized Align II com Proteção Cerebral MIPS',
      description: 'Anúncio demonstrativo de capacete esportivo. Características, certificações, autenticidade e disponibilidade não são verificadas pela plataforma.',
      price: 549.00,
      original_price: 699.00,
      category: 'Equipamentos',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'pedal-pro-rio',
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80'],
      brand: 'Specialized',
      tags: ['Capacete', 'MIPS', 'Segurança', 'Specialized'],
      stock: 12,
      location: 'Rio de Janeiro - RJ'
    },
    {
      title: 'Mochila Colete de Hidratação Salomon Active Skin 4 com 2x Soft Flasks 500ml',
      description: 'Desenvolvida para provas de trilha e maratonas de rua que exigem hidratação constante. Sistema Sensifit que abraça as costas sem quicar durante a passada.',
      price: 699.00,
      original_price: 849.00,
      category: 'Trail Running & Aventura',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'montanha-trilha-brasil',
      images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'],
      brand: 'Salomon',
      tags: ['Salomon', 'Mochila Hidratação', 'Trail Run', 'Soft Flask'],
      stock: 9,
      location: 'Campos do Jordão - SP'
    },
    {
      title: 'Tênis Salomon Speedcross 6 Trilha & Lama com Garras Mud Contagrip',
      description: 'A lenda das trilhas técnicas. Cravos profundos de 5mm que cravam em lama, pedras soltas e terra molhada. Ajuste Quicklace que dispensa amarrações manuais.',
      price: 999.90,
      original_price: 1199.90,
      category: 'Calçados',
      sport: 'Trail',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'montanha-trilha-brasil',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      brand: 'Salomon',
      tags: ['Speedcross 6', 'Trail Técnico', 'Trilha', 'Salomon'],
      stock: 7,
      location: 'Campos do Jordão - SP'
    },

    // --- ALTA PERFORMANCE & CARBONO (R$ 1.500 a R$ 4.800) ---
    {
      title: 'Tênis Nike Vaporfly 3 com placa de carbono (anúncio demonstrativo)',
      description: 'O tênis líder dos pódios mundiais. Espuma ZoomX ultrarresponsiva com placa integral de fibra de carbono curvada que atua como uma catapulta a cada passada.',
      price: 1899.99,
      original_price: 2199.99,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'velocita-performance',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'],
      brand: 'Nike',
      tags: ['Vaporfly 3', 'Carbono', 'ZoomX', 'Recordes', 'Maratona'],
      stock: 12,
      location: 'São Paulo - SP'
    },
    {
      title: 'Tênis Nike Alphafly 3 Cápsulas Zoom Air Duplas (Versão Kelvin Kiptum)',
      description: 'O tênis do recorde mundial de maratona (2h00min35s). Construção anatômica Atomknit 3.0, base mais larga para estabilidade e transição rápida de calcanhar para antepé.',
      price: 2499.99,
      original_price: 2799.99,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'top-run-curitiba',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      brand: 'Nike',
      tags: ['Alphafly 3', 'Elite', 'Recorde Mundial', 'Placa Carbono'],
      stock: 6,
      location: 'Curitiba - PR'
    },
    {
      title: 'Tênis Asics Metaspeed Sky Paris (Edição Olímpica 183 gramas)',
      description: 'Projetado para atletas com passadas largas (stride runners). Entressola FF TURBO PLUS mais leve e com 8.2% mais retorno elástico do que as versões anteriores.',
      price: 2199.90,
      original_price: 2499.90,
      category: 'Calçados',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'velocita-performance',
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
      brand: 'Asics',
      tags: ['Metaspeed Paris', 'Olímpico', 'Placa Carbono', 'Sub 3h'],
      stock: 8,
      location: 'São Paulo - SP'
    },
    {
      title: 'Smartwatch GPS Garmin Forerunner 265 Tela Touch AMOLED',
      description: 'Métricas de corrida avançadas: dinâmica de passada, potência no pulso, prontidão para treino (Training Readiness) e status VFC (HRV). Tela AMOLED de alto brilho e bateria de até 13 dias.',
      price: 3299.00,
      original_price: 3899.00,
      category: 'Tecnologia & Wearables',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'spaceman-bike-lab',
      images: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
      brand: 'Garmin',
      tags: ['Garmin', 'Forerunner 265', 'AMOLED', 'GPS Tri-Band', 'VO2Max'],
      stock: 9,
      location: 'São Paulo - SP'
    },
    {
      title: 'Smartwatch GPS Garmin Forerunner 965 Bisel em Titânio + Mapas Topo',
      description: 'O ápice dos relógios esportivos para maratonistas e triatletas. Mapas topográficos coloridos pré-instalados, tela AMOLED de 1,4 polegadas e autonomia estendida para provas Ironman.',
      price: 4790.00,
      original_price: 5490.00,
      category: 'Tecnologia & Wearables',
      sport: 'Triatlo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'aquatri-specialist',
      images: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80'],
      brand: 'Garmin',
      tags: ['Forerunner 965', 'Titânio', 'Mapas Topo', 'Ironman', 'Garmin'],
      stock: 5,
      location: 'Florianópolis - SC'
    },
    {
      title: 'Wetsuit Roupa de Neoprene Triathlon Orca Athlex Float (Espessura Graduada)',
      description: 'Flutuabilidade otimizada nas pernas e quadril para manter a posição hidrodinâmica sem esforço. Braços com neoprene Yamamoto 39 de 1.5mm para amplitude total na braçada.',
      price: 2890.00,
      original_price: 3490.00,
      category: 'Equipamentos',
      sport: 'Natação',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'aquatri-specialist',
      images: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80'],
      brand: 'Orca',
      tags: ['Wetsuit', 'Neoprene', 'Natação', 'Ironman', 'Triathlon'],
      stock: 6,
      location: 'Florianópolis - SC'
    },
    {
      title: 'Caixa Gel de Carboidrato Maurten Gel 100 Hidrogel (12 unidades)',
      description: 'A tecnologia de hidrogel sueco adotada por Eliud Kipchoge. Permite ingerir até 100g de carboidratos por hora sem desconforto estomacal ou enjoos gastrointestinais.',
      price: 380.00,
      original_price: 440.00,
      category: 'Nutrição & Suplementos',
      sport: 'Corrida',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'endurance-lab-nutri',
      images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'],
      brand: 'Maurten',
      tags: ['Maurten', 'Hidrogel', 'Elite', 'Carboidratos'],
      stock: 24,
      location: 'Campinas - SP'
    },

    // --- BIKES, ROLOS & EQUIPAMENTOS GRANDES (R$ 5.490 a R$ 24.500) ---
    {
      title: 'Rolo de Treino Interativo Inteligente Wahoo KICKR Core Direct Drive',
      description: 'Simula inclinações de até 16% com potência de frenagem de 1800W e precisão de +/- 2%. Conexão nativa com Zwift, Rouvy e TrainerRoad via ANT+ FE-C e Bluetooth.',
      price: 5890.00,
      original_price: 6990.00,
      category: 'Equipamentos',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'wahoo-smart-trainers',
      images: ['https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'],
      brand: 'Wahoo Fitness',
      tags: ['Wahoo', 'KICKR Core', 'Zwift', 'Rolo Inteligente', 'Ciclismo Indoor'],
      stock: 8,
      location: 'Ribeirão Preto - SP'
    },
    {
      title: 'Bicicleta Gravel Sense Versa Evo 2026 Alumínio Hidroformado Shimano Sora',
      description: 'A bike definitiva para asfalto acidentado, estradas de terra e cicloturismo. Quadro em alumínio 6061 com garfo de carbono, freios a disco mecânicos e pneus 700x40c.',
      price: 5490.00,
      original_price: 6290.00,
      category: 'Bicicletas',
      sport: 'Gravel',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'pedal-pro-rio',
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'],
      brand: 'Sense Bike',
      tags: ['Gravel', 'Sense', 'Shimano Sora', 'Aventura'],
      stock: 4,
      location: 'Rio de Janeiro - RJ'
    },
    {
      title: 'Bicicleta Road Carbono Scott Addict 20 Disc Grupo Shimano 105 12 Velocidades',
      description: 'Geometria de endurance desenvolvida para longos percursos com menos fadiga nas costas e ombros. Cabeamento 100% interno integrado e rodas Syncros compatíveis com Tubeless.',
      price: 18900.00,
      original_price: 21900.00,
      category: 'Bicicletas',
      sport: 'Ciclismo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'spaceman-bike-lab',
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80', 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80'],
      brand: 'Scott',
      tags: ['Scott Addict', 'Carbono HMF', 'Shimano 105', 'Speed', 'Road Bike'],
      stock: 3,
      location: 'São Paulo - SP'
    },
    {
      title: 'Bicicleta Contra-Relógio & Triathlon Quintana Roo PRfive Carbon Disc',
      description: 'Máquina aero pura para provas de Ironman 70.3 e Full. Armazenamento QBox integrado no quadro, cockpit aero ajustável e rodas aero de carbono 60mm.',
      price: 24500.00,
      original_price: 29900.00,
      category: 'Bicicletas',
      sport: 'Triatlo',
      condition: 'novo',
      product_type: 'b2c',
      store_slug: 'aquatri-specialist',
      images: ['https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'],
      brand: 'Quintana Roo',
      tags: ['Triathlon TT', 'Ironman', 'Quintana Roo', 'Contra-Relógio'],
      stock: 2,
      location: 'Florianópolis - SC'
    }
  ];

  for (const p of productsToSeed) {
    const storeId = storeMap[p.store_slug];
    const storeObj = storesToSeed.find(s => s.slug === p.store_slug);

    // Check if product with this title exists
    const check = await client.query('SELECT id FROM public.products WHERE title = $1', [p.title]);
    if (check.rows.length === 0) {
      // These seeded listings are not internally reviewed; shipping stays enabled for the demo flow only.
      await client.query(`
        INSERT INTO public.products (
          id, title, description, price, original_price, category, sport,
          condition, product_type, images, store_id, store_name, is_verified_store,
          stock, views, likes_count, location, shipping_available, status, brand,
          tags, seller_name, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, false,
          $12, $13, $14, $15, true, 'active', $16,
          $17, $18, NOW(), NOW()
        )
      `, [
        p.title, p.description, p.price, p.original_price, p.category, p.sport,
        p.condition, p.product_type, p.images, storeId, storeObj?.name || 'Perfil de loja demonstrativo',
        p.stock, Math.floor(200 + Math.random() * 1500), Math.floor(15 + Math.random() * 80),
        p.location, p.brand, p.tags, storeObj?.name || 'Perfil de loja demonstrativo'
      ]);
      console.log(`Inserted product: ${p.title} (R$ ${p.price})`);
    } else {
      console.log(`Product already exists: ${p.title}`);
    }
  }

  // Update product counts on stores
  for (const s of storesToSeed) {
    const storeId = storeMap[s.slug];
    if (storeId) {
      const countRes = await client.query('SELECT count(*) FROM public.products WHERE store_id = $1', [storeId]);
      const count = parseInt(countRes.rows[0].count, 10);
      await client.query('UPDATE public.stores SET products_count = $1 WHERE id = $2', [count, storeId]);
    }
  }

  const finalStores = await client.query('SELECT count(*) FROM public.stores');
  const finalProducts = await client.query('SELECT count(*) FROM public.products');
  console.log(`\nDONE! Final Stores in DB: ${finalStores.rows[0].count} | Final Products in DB: ${finalProducts.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
