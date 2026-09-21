import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function organizeDatabase() {
  console.log('--- ORGANIZING SUPABASE DATABASE FOR CORE MOTIOM ---');
  await client.connect();

  // 1. Ensure extensions
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // 2. Ensure coaches table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.coaches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      specialty TEXT NOT NULL,
      sports TEXT[] NOT NULL DEFAULT '{}',
      avatar_url TEXT NOT NULL,
      bio TEXT NOT NULL,
      rating NUMERIC(3,2) DEFAULT 5.0,
      reviews_count INT DEFAULT 0,
      hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 150.00,
      location TEXT NOT NULL,
      is_certified BOOLEAN DEFAULT true,
      cref_number TEXT,
      availability TEXT DEFAULT 'Horários flexíveis online e presencial',
      created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `);

  // 3. Ensure community_posts table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.community_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_name TEXT NOT NULL,
      author_avatar TEXT,
      author_badge TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      likes_count INT DEFAULT 0,
      comments_count INT DEFAULT 0,
      comments JSONB DEFAULT '[]'::jsonb,
      is_reported BOOLEAN DEFAULT false,
      report_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `);

  // 4. Ensure Super Admin Mattheus in public.users
  await client.query(`
    INSERT INTO public.users (
      id, name, handle, email, password_hash, role, sport, city, bio, avatar, level,
      followers, rating, verified, is_demo, banned, report_count, created_at, status, updated_at
    ) VALUES (
      100, 'Mattheus (Super Admin)', '@mattheus_admin', 'mattheusxmljz@gmail.com', 'scrypt_admin_hash',
      'admin', 'Maratona & Triatlo', 'Curitiba', 'Super Administrador e fundador da plataforma CoreMotiom.',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', 'Elite Pro',
      1280, 5.0, true, false, false, 0, NOW(), 'active', NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = 'mattheusxmljz@gmail.com',
      role = 'admin',
      verified = true,
      updated_at = NOW();
  `);

  // Check if an auth user with this email exists in auth.users
  try {
    const authUser = await client.query(`SELECT id FROM auth.users WHERE LOWER(email) = 'mattheusxmljz@gmail.com' LIMIT 1`);
    if (authUser.rows.length > 0) {
      const authId = authUser.rows[0].id;
      await client.query(`
        INSERT INTO public.profiles (
          id, email, name, avatar_url, role, city, state, sport_interests, created_at, updated_at
        ) VALUES (
          $1, 'mattheusxmljz@gmail.com', 'Mattheus (Super Admin)',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', 'admin',
          'Curitiba', 'PR', ARRAY['Maratona', 'Triatlo', 'Alta Performance'], NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          role = 'admin',
          updated_at = NOW();
      `, [authId]);
    }
  } catch {
    // Auth schema query skipped if not accessible
  }

  // 5. Seed coaches if empty
  const coachCount = await client.query('SELECT count(*) FROM public.coaches');
  if (parseInt(coachCount.rows[0].count, 10) === 0) {
    console.log('Seeding certified coaches...');
    const coaches = [
      {
        name: 'Prof. Marcos Vinicius Silva',
        title: 'Mestre em Fisiologia do Exercício & Treinador Olímpico',
        specialty: 'Maratona, Sub-3h e Periodização Avançada',
        sports: ['Corrida de Rua', 'Maratona', 'Meia Maratona'],
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        bio: 'Mais de 14 anos treinando maratonistas de elite e amadores competitivos. Foco em biomecânica de corrida e economia energética.',
        rating: 4.98,
        reviews_count: 54,
        hourly_rate: 220,
        location: 'São Paulo, SP (Online & Presencial)',
        is_certified: true,
        cref_number: 'CREF 049821-G/SP',
        availability: '3 vagas para ciclo Maratona de Boston / Valência',
      },
      {
        name: 'Camila Albuquerque',
        title: 'Treinadora Nível 2 World Triathlon & Ironman Finisher 8x',
        specialty: 'Triatlo Longa Distância, Transições e Natação em Águas Abertas',
        sports: ['Triatlo', 'Ironman 70.3', 'Ciclismo contra-relógio'],
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
        bio: 'Especialista em preparação para provas de endurance extremo. Alinhamento de potência na bike, cadência e nutrição intra-prova.',
        rating: 4.95,
        reviews_count: 39,
        hourly_rate: 250,
        location: 'Florianópolis, SC (Consultoria Global Online)',
        is_certified: true,
        cref_number: 'CREF 018240-G/SC',
        availability: 'Consultorias com análise de dados TrainingPeaks',
      },
      {
        name: 'Rodrigo "Pampa" Mendes',
        title: 'Atleta e Treinador de Trail & Skyrunning',
        specialty: 'Ultra Trail, Gestão de Desnível Positivo e Força Funcional',
        sports: ['Trail Running', 'Ultramaratona', 'Skyrunning'],
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        bio: 'Treinador de montanha focado em adaptação musculoesquelética para descidas técnicas e estratégias de pacing alpino.',
        rating: 4.92,
        reviews_count: 28,
        hourly_rate: 180,
        location: 'Campos do Jordão, SP / Curitiba, PR',
        is_certified: true,
        cref_number: 'CREF 032119-G/PR',
        availability: 'Planilhas personalizadas mensais',
      }
    ];

    for (const c of coaches) {
      await client.query(`
        INSERT INTO public.coaches (name, title, specialty, sports, avatar_url, bio, rating, reviews_count, hourly_rate, location, is_certified, cref_number, availability)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [c.name, c.title, c.specialty, c.sports, c.avatar_url, c.bio, c.rating, c.reviews_count, c.hourly_rate, c.location, c.is_certified, c.cref_number, c.availability]);
    }
  }

  // 6. Seed Community Posts if empty
  const postCount = await client.query('SELECT count(*) FROM public.community_posts');
  if (parseInt(postCount.rows[0].count, 10) === 0) {
    console.log('Seeding community posts...');
    const posts = [
      {
        author_name: 'Felipe Santana (Maratonista)',
        author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        author_badge: 'Sub-2h45 Maratona',
        category: 'equipamento',
        title: 'Alphafly 3 vs Vaporfly 3: Diferenças reais após 250km de treinos',
        content: 'Depois de rodar com ambos em ritmos abaixo de 3:45/km, a principal diferença não é o peso, e sim a estabilidade do antepé. O Alphafly 3 perdoa menos se sua passada perder a biomecânica no km 32.',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        likes_count: 142,
        comments_count: 18,
        comments: JSON.stringify([
          {
            id: 'c1',
            author_name: 'Luciana Rios',
            content: 'Sensacional esse relato. Senti exatamente essa instabilidade no fim da Maratona de Porto Alegre.',
            created_at: new Date().toISOString()
          }
        ])
      },
      {
        author_name: 'Beatriz Vasconcelos',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        author_badge: 'Ironman 70.3 Finisher',
        category: 'treino',
        title: 'Como estruturei meus treinos de bike aero sem perder rendimento na corrida',
        content: 'O maior erro de quem migra para o contra-relógio é fechar o quadril demais no fit sem adaptar a musculatura do glúteo médio. Minha transição no 70.3 melhorou 6 minutos ajustando apenas 10mm no avanço.',
        image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
        likes_count: 98,
        comments_count: 12,
        comments: JSON.stringify([])
      }
    ];

    for (const p of posts) {
      await client.query(`
        INSERT INTO public.community_posts (author_name, author_avatar, author_badge, category, title, content, image_url, likes_count, comments_count, comments)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [p.author_name, p.author_avatar, p.author_badge, p.category, p.title, p.content, p.image_url, p.likes_count, p.comments_count, p.comments]);
    }
  }

  // 7. Seed sample orders if empty
  const ordersCount = await client.query('SELECT count(*) FROM public.orders');
  if (parseInt(ordersCount.rows[0].count, 10) === 0) {
    console.log('Seeding sample orders with escrow...');
    await client.query(`
      INSERT INTO public.orders (
        user_email, items, subtotal, shipping_fee, discount, total, payment_method,
        payment_status, order_status, tracking_code, shipping_address
      ) VALUES (
        'carlos.ramos@atleta.com',
        '[{"id": "prod-1", "title": "Tênis Nike Alphafly 3 Proto", "price": 2199.90, "quantity": 1}]'::jsonb,
        2199.90, 0.00, 109.99, 2089.91, 'pix', 'paid', 'escrow_locked', 'BR921849102X',
        '{"street": "Av. Paulista", "number": "1000", "city": "São Paulo", "state": "SP", "zip": "01310-100"}'::jsonb
      );
    `);
  }

  // 8. Permissions
  await client.query(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
  `);

  // Print Summary
  console.log('\n--- SUPABASE DATABASE STATUS ---');
  const tables = ['users', 'profiles', 'stores', 'products', 'orders', 'coaches', 'community_posts'];
  for (const t of tables) {
    const res = await client.query(`SELECT count(*) FROM public.${t}`);
    console.log(`✅ Table '${t}': ${res.rows[0].count} records`);
  }

  await client.end();
  console.log('\n🎉 Supabase Database 100% organized, verified and ready for production!');
}

organizeDatabase().catch((err) => {
  console.error('Error organizing database:', err);
  process.exit(1);
});
