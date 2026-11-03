import pg from 'pg';
import { pgSsl } from './lib/pg-ssl.mjs';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: pgSsl()
});

async function seed() {
  if (process.env.COREMOTIOM_ENABLE_RETIRED_STORE_SEED !== '1') {
    console.warn('Seed de lojas e anúncios B2C aposentado; nenhum dado foi alterado. Use scripts/seed-all-products.mjs para exemplos C2C.');
    return;
  }
  await client.connect();
  console.log('Connected to Supabase DB for seeding...');

  // Check if stores already exist
  const existingStores = await client.query('SELECT count(*) FROM public.stores');
  if (parseInt(existingStores.rows[0].count, 10) === 0) {
    console.log('Seeding demo store profiles...');
    const stores = [
      {
        name: 'Perfil de loja demonstrativo 01',
        slug: 'motiom-pro-lab',
        description: 'Perfil B2C demonstrativo. Produtos, vínculo com marcas, disponibilidade e estoque são ilustrativos e não verificados.',
        logo_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80',
        banner_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80',
        category: 'Alta Performance',
        is_verified: false,
        verification_status: 'none',
        cnpj: '48.912.834/0001-92',
        contact_email: 'lojista-demo-01@exemplo.test',
        contact_phone: '(00) 00000-0000',
        location: 'São Paulo, SP',
        rating: 0,
        sales_count: 0,
        products_count: 2,
      },
      {
        name: 'Perfil de loja demonstrativo 02',
        slug: 'aerotrack-dynamics',
        description: 'Perfil B2C demonstrativo para ciclismo. Produtos, certificações e disponibilidade não são verificados pela plataforma.',
        logo_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80',
        banner_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80',
        category: 'Ciclismo & Triatlo',
        is_verified: false,
        verification_status: 'none',
        cnpj: '32.145.890/0001-11',
        contact_email: 'lojista-demo-02@exemplo.test',
        contact_phone: '(00) 00000-0000',
        location: 'Curitiba, PR',
        rating: 0,
        sales_count: 0,
        products_count: 1,
      },
      {
        name: 'Perfil de loja demonstrativo 03',
        slug: 'vortex-endurance',
        description: 'Perfil B2C demonstrativo para trail e outdoor. Informações e disponibilidade são ilustrativas.',
        logo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
        banner_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
        category: 'Trail & Outdoor',
        is_verified: false,
        verification_status: 'none',
        cnpj: '19.482.001/0001-44',
        contact_email: 'lojista-demo-03@exemplo.test',
        location: 'Belo Horizonte, MG',
        rating: 0,
        sales_count: 0,
        products_count: 1,
      },
      {
        name: 'Perfil de loja demonstrativo 04',
        slug: 'pulse-peak-tech',
        description: 'Perfil B2C demonstrativo para tecnologia esportiva. Informações e disponibilidade são ilustrativas.',
        logo_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
        banner_url: 'https://images.unsplash.com/photo-1510519138111-5778a0ff28ac?w=1200&q=80',
        category: 'Tecnologia & Wearables',
        is_verified: false,
        verification_status: 'none',
        cnpj: '55.109.432/0001-80',
        contact_email: 'lojista-demo-04@exemplo.test',
        location: 'Florianópolis, SC',
        rating: 0,
        sales_count: 0,
        products_count: 0,
      }
    ];

    for (const s of stores) {
      await client.query(
        `INSERT INTO public.stores (name, slug, description, logo_url, banner_url, category, is_verified, verification_status, cnpj, contact_email, contact_phone, location, rating, sales_count, products_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (slug) DO NOTHING;`,
        [s.name, s.slug, s.description, s.logo_url, s.banner_url, s.category, s.is_verified, s.verification_status, s.cnpj, s.contact_email, s.contact_phone, s.location, s.rating, s.sales_count, s.products_count]
      );
    }
    console.log('Stores seeded successfully.');
  }

  // Check if products exist
  const existingProducts = await client.query('SELECT count(*) FROM public.products');
  if (parseInt(existingProducts.rows[0].count, 10) === 0) {
    console.log('Seeding initial hybrid B2C & C2C products...');

    // Fetch store IDs
    const storeRes = await client.query('SELECT id, name, slug FROM public.stores');
    const storeMap = {};
    storeRes.rows.forEach(r => { storeMap[r.slug] = r; });

    const products = [
      {
        title: 'Tênis de corrida com placa de carbono (anúncio demonstrativo)',
        description: 'Anúncio demonstrativo de tênis de corrida. Características, autenticidade, disponibilidade e estoque não são verificados pela plataforma.',
        price: 2199.90,
        original_price: 2499.90,
        category: 'Calçados',
        sport: 'Corrida',
        condition: 'novo',
        product_type: 'b2c',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
        seller_name: 'Perfil de loja demonstrativo 01',
        store_slug: 'motiom-pro-lab',
        is_verified_store: false,
        stock: 5,
        brand: 'Nike',
        location: 'São Paulo, SP'
      },
      {
        title: 'Bicicleta de Estrada Cervélo S5 Dura-Ace Di2 (Usada 200km)',
        description: 'Anúncio demonstrativo de bicicleta usada. Especificações e condição do item não são verificadas pela plataforma.',
        price: 48500.00,
        original_price: 62000.00,
        category: 'Bicicletas & Componentes',
        sport: 'Ciclismo',
        condition: 'como_novo',
        product_type: 'c2c',
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80', 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80'],
        seller_name: 'Carlos Eduardo Ramos (Atleta)',
        store_slug: null,
        is_verified_store: false,
        stock: 1,
        brand: 'Cervélo',
        location: 'Campinas, SP'
      },
      {
        title: 'Relógio Multiesportivo Garmin Forerunner 965 AMOLED',
        description: 'Anúncio demonstrativo de relógio esportivo. Especificações, autenticidade, disponibilidade e estoque não são verificados pela plataforma.',
        price: 4499.00,
        original_price: 4999.00,
        category: 'Eletrônicos & Wearables',
        sport: 'Triatlo',
        condition: 'novo',
        product_type: 'b2c',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80'],
        seller_name: 'Perfil de loja demonstrativo 02',
        store_slug: 'aerotrack-dynamics',
        is_verified_store: false,
        stock: 8,
        brand: 'Garmin',
        location: 'Curitiba, PR'
      },
      {
        title: 'Mochila de Hidratação Salomon Active Skin 8 com Soft Flasks',
        description: 'Anúncio demonstrativo de mochila esportiva. Características, autenticidade, disponibilidade e estoque não são verificados pela plataforma.',
        price: 649.90,
        original_price: 789.90,
        category: 'Acessórios',
        sport: 'Trail Running',
        condition: 'novo',
        product_type: 'b2c',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
        seller_name: 'Perfil de loja demonstrativo 03',
        store_slug: 'vortex-endurance',
        is_verified_store: false,
        stock: 12,
        brand: 'Salomon',
        location: 'Belo Horizonte, MG'
      },
      {
        title: 'Traje de Neoprene Huub Varman Triathlon 3:5 (Usado 2x)',
        description: 'Anúncio demonstrativo de traje usado. A condição, autenticidade, disponibilidade e estoque não são verificados pela plataforma.',
        price: 3200.00,
        original_price: 4600.00,
        category: 'Vestuário',
        sport: 'Natação & Águas Abertas',
        condition: 'usado_excelente',
        product_type: 'c2c',
        images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80'],
        seller_name: 'Marina Duarte (Triatleta)',
        store_slug: null,
        is_verified_store: false,
        stock: 1,
        brand: 'Huub',
        location: 'Florianópolis, SC'
      },
      {
        title: 'Macaquinha de triatlo (anúncio demonstrativo)',
        description: 'Descrição demonstrativa de traje de triatlo; características, disponibilidade e autenticidade não são verificadas.',
        price: 1890.00,
        original_price: 2150.00,
        category: 'Vestuário',
        sport: 'Triatlo',
        condition: 'novo',
        product_type: 'b2c',
        images: ['https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80'],
        seller_name: 'Perfil de loja demonstrativo 01',
        store_slug: 'motiom-pro-lab',
        is_verified_store: false,
        stock: 4,
        brand: 'Ryzon',
        location: 'São Paulo, SP'
      }
    ];

    for (const p of products) {
      const store = p.store_slug ? storeMap[p.store_slug] : null;
      await client.query(
        `INSERT INTO public.products (
          title, description, price, original_price, category, sport, condition,
          product_type, images, seller_name, store_id, store_name, is_verified_store,
          stock, brand, location, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'active')`,
        [
          p.title,
          p.description,
          p.price,
          p.original_price,
          p.category,
          p.sport,
          p.condition,
          p.product_type,
          p.images,
          p.seller_name,
          store ? store.id : null,
          store ? store.name : null,
          p.is_verified_store,
          p.stock,
          p.brand,
          p.location
        ]
      );
    }
    console.log('Products seeded successfully.');
  }

  await client.end();
  console.log('Seeding script finished!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
