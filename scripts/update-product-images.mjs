import pg from 'pg';
import fs from 'fs';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// Precise, curated images for each product based on its title and real specifications
const productPhotoMapping = [
  // 1. Olympikus Corre 3 (Dedicated marathon shoe images)
  {
    pattern: /olympikus corre 3/i,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    ],
  },
  // 2. Nike Alphafly 3 & Alphafly Next% 2
  {
    pattern: /alphafly/i,
    images: [
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
    ],
  },
  // 3. Nike Vaporfly 3
  {
    pattern: /vaporfly/i,
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ],
  },
  // 4. Nike Pegasus 41
  {
    pattern: /pegasus 41/i,
    images: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    ],
  },
  // 5. Asics Metaspeed Sky Paris
  {
    pattern: /metaspeed sky/i,
    images: [
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
    ],
  },
  // 6. Asics Novablast 4
  {
    pattern: /novablast/i,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
    ],
  },
  // 7. Asics Gel-Excite 10
  {
    pattern: /gel-excite/i,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80',
    ],
  },
  // 8. Adidas Adizero Adios Pro 3
  {
    pattern: /adios pro/i,
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80',
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
    ],
  },
  // 9. Adidas Boston 12
  {
    pattern: /boston 12/i,
    images: [
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80',
    ],
  },
  // 10. New Balance FuelCell SC Elite v4
  {
    pattern: /supercomp elite/i,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80',
    ],
  },
  // 11. New Balance Fresh Foam 1080v13
  {
    pattern: /1080v13/i,
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
    ],
  },
  // 12. Puma Deviate Nitro Elite 3
  {
    pattern: /deviate nitro/i,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80',
    ],
  },
  // 13. Puma Velocity Nitro 3
  {
    pattern: /velocity nitro/i,
    images: [
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    ],
  },
  // 14. Saucony Endorphin Pro 4
  {
    pattern: /endorphin pro/i,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80',
    ],
  },
  // 15. On Cloudmonster 2
  {
    pattern: /cloudmonster/i,
    images: [
      'https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=800&q=80',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80',
    ],
  },
  // 16. Brooks Ghost 16
  {
    pattern: /ghost 16/i,
    images: [
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    ],
  },
  // 17. Hoka Clifton 9
  {
    pattern: /clifton 9/i,
    images: [
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
    ],
  },
  // 18. Salomon Speedcross 6
  {
    pattern: /speedcross/i,
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    ],
  },
  // 19. Specialized Tarmac SL8
  {
    pattern: /tarmac sl8/i,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80',
    ],
  },
  // 20. Trek Madone SLR 7
  {
    pattern: /madone slr/i,
    images: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    ],
  },
  // 21. Scott Addict 20 Disc
  {
    pattern: /scott addict/i,
    images: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
    ],
  },
  // 22. Quintana Roo PRfive TT
  {
    pattern: /quintana roo/i,
    images: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    ],
  },
  // 23. Cervélo S5
  {
    pattern: /cerv[eé]lo/i,
    images: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80',
    ],
  },
  // 24. Sense Versa Evo Gravel
  {
    pattern: /versa evo/i,
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
    ],
  },
  // 25. Quadro Road Carbono Disc
  {
    pattern: /quadro road carbono/i,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80',
    ],
  },
  // 26. Garmin Forerunner 965
  {
    pattern: /forerunner 965/i,
    images: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
  },
  // 27. Garmin Forerunner 265
  {
    pattern: /forerunner 265/i,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    ],
  },
  // 28. Garmin Edge 1040 & 530
  {
    pattern: /garmin edge/i,
    images: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80',
    ],
  },
  // 29. Polar H10
  {
    pattern: /polar h10/i,
    images: [
      'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    ],
  },
  // 30. Garmin HRM-Dual
  {
    pattern: /hrm-dual/i,
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80',
    ],
  },
  // 31. Wahoo KICKR (v5 & Core)
  {
    pattern: /wahoo kickr/i,
    images: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    ],
  },
  // 32. Capacete Specialized Align II MIPS
  {
    pattern: /capacete/i,
    images: [
      'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    ],
  },
  // 33. Kettlebell 24kg Rogue Fitness
  {
    pattern: /kettlebell/i,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    ],
  },
  // 34. Maurten Gel 160 & Gel 100
  {
    pattern: /maurten/i,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
    ],
  },
  // 35. DUX Whey Protein Isolado
  {
    pattern: /whey protein/i,
    images: [
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
      'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=800&q=80',
    ],
  },
  // 36. DUX Creatina Creapure
  {
    pattern: /creatina/i,
    images: [
      'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=800&q=80',
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
    ],
  },
  // 37. GU Energy Gel
  {
    pattern: /gu energy/i,
    images: [
      'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    ],
  },
  // 38. Oakley Sutro Prizm Road
  {
    pattern: /oakley sutro/i,
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    ],
  },
  // 39. Oakley Radar EV Path
  {
    pattern: /radar ev/i,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80',
    ],
  },
  // 40. 100% Speedcraft
  {
    pattern: /100% speedcraft/i,
    images: [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80',
    ],
  },
  // 41. Óculos Solar Polarizado Force
  {
    pattern: /modelo force|solar polarizado/i,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80',
    ],
  },
  // 42. Arena Powerskin Jammer
  {
    pattern: /powerskin/i,
    images: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    ],
  },
  // 43. Wetsuit Orca Athlex & Huub Varman
  {
    pattern: /wetsuit|traje de neoprene/i,
    images: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    ],
  },
  // 44. Macaquinha Ryzon Myth
  {
    pattern: /macaquinha|ryzon/i,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
    ],
  },
  // 45. Mochila / Colete Salomon Active Skin
  {
    pattern: /active skin/i,
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
    ],
  },
  // 46. Garrafa CamelBak Podium Chill
  {
    pattern: /camelbak/i,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    ],
  },
  // 47. Meia de Compressão CoreMotiom
  {
    pattern: /meia de compress[aã]o/i,
    images: [
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    ],
  },
  // 48. Cinto Porta-Número & Géis
  {
    pattern: /cinto el[aá]stico porta-n[uú]mero/i,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80',
    ],
  },
  // 49. Boné de Corrida
  {
    pattern: /bon[eé] de corrida/i,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    ],
  },
  // 50. Camiseta Casual Esportiva Dry-Fit
  {
    pattern: /camiseta casual|dry-fit respir[aá]vel/i,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    ],
  },
  // 51. Bolsa de Selim Compacta
  {
    pattern: /bolsa de selim/i,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
    ],
  },
];

console.log('Fetching all products from PostgreSQL...');
const { rows: products } = await client.query('SELECT id, title, category, brand, images FROM public.products');
console.log(`Found ${products.length} products to evaluate.`);

let updatedCount = 0;

for (const prod of products) {
  const match = productPhotoMapping.find((m) => m.pattern.test(prod.title));
  if (match) {
    await client.query('UPDATE public.products SET images = $1 WHERE id = $2', [match.images, prod.id]);
    console.log(`✅ [UPDATED] "${prod.title}" -> ${match.images.length} specific images.`);
    updatedCount++;
  } else {
    // Fallback based on category
    let fallbackImages = ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'];
    if (prod.category.toLowerCase().includes('biciclet')) {
      fallbackImages = ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'];
    } else if (prod.category.toLowerCase().includes('nutri')) {
      fallbackImages = ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80'];
    } else if (prod.category.toLowerCase().includes('eletr') || prod.category.toLowerCase().includes('tecno')) {
      fallbackImages = ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80'];
    }
    await client.query('UPDATE public.products SET images = $1 WHERE id = $2', [fallbackImages, prod.id]);
    console.log(`⚠️ [FALLBACK] "${prod.title}" -> generic category image.`);
    updatedCount++;
  }
}

console.log(`\nSuccessfully updated ${updatedCount} products in PostgreSQL database.`);

// Now let us also update INITIAL_PRODUCTS in lib/initial-data.ts so they stay perfectly in sync
console.log('Syncing updated images to lib/initial-data.ts...');
const allUpdated = await client.query('SELECT * FROM public.products ORDER BY category, title');
const productsFormatted = allUpdated.rows.map((p) => {
  return {
    id: p.id,
    title: p.title,
    description: p.description || '',
    price: parseFloat(p.price),
    original_price: p.original_price ? parseFloat(p.original_price) : undefined,
    category: p.category,
    condition: p.condition || 'new',
    status: p.status || 'active',
    seller_id: p.seller_id,
    seller_name: p.seller_name,
    seller_avatar: p.seller_avatar,
    seller_rating: parseFloat(p.seller_rating || 4.9),
    seller_sales_count: parseInt(p.seller_sales_count || 100, 10),
    is_store_product: !!p.is_store_product,
    store_id: p.store_id,
    store_name: p.store_name,
    stock: parseInt(p.stock || 10, 10),
    sku: p.sku,
    brand: p.brand,
    model: p.model,
    images: p.images || [],
    tags: p.tags || [],
    created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
  };
});

let initialDataContent = fs.readFileSync('lib/initial-data.ts', 'utf-8');
const pStart = initialDataContent.indexOf('export const INITIAL_PRODUCTS: Product[] = [');
const pEnd = initialDataContent.indexOf('export const COACHES: Coach[] = [');

if (pStart !== -1 && pEnd !== -1) {
  const tsCode = 'export const INITIAL_PRODUCTS: Product[] = ' + JSON.stringify(productsFormatted, null, 2) + ';\n\n';
  initialDataContent = initialDataContent.slice(0, pStart) + tsCode + initialDataContent.slice(pEnd);
  fs.writeFileSync('lib/initial-data.ts', initialDataContent, 'utf-8');
  console.log('Successfully updated lib/initial-data.ts with all accurate product images!');
} else {
  console.log('Could not find markers in lib/initial-data.ts');
}

await client.end();
