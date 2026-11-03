/** Pages and gallery URLs checked on 2026-11-03. See docs/catalogo/ampliacao-2026-11.md. */
export const CATALOG_EXPANSION_VERSION = '2026-11-03';
const image = (id: string, file: string) => `https://decathlonpro.vtexassets.com/arquivos/ids/${id}/${file}.jpg`;
export const CATALOG_EXPANSION = [
  {
    key: 'tapete-domyos-8800500', title: 'Tapete de Treino Domyos Cinza 170 × 58 cm — 8 mm',
    description: 'Tapete de treino cinza de 8 mm de espessura, com 170 × 58 cm e elásticos para guardar enrolado.',
    category: 'Equipamentos', sport: 'Ginástica', brand: 'Domyos', price: 242.99, athletePrice: 130,
    source_url: 'https://www.decathlon.com.br/tapete-de-fitness-espesso-170-cm-x-58-cm-x-8-mm-cinzento-cinza-8800500-domyos/p',
    image_url: image('175547409', 'tapete-de-fitness-espesso-170-cm-x-58-cm-x-8-mm-cinzento---cinza---tamanho-Unico1'),
    athlete_image: image('175547411', 'tapete-de-fitness-espesso-170-cm-x-58-cm-x-8-mm-cinzento---cinza---tamanho-Unico2'),
  },
  {
    key: 'oculos-speedo-8632148', title: 'Óculos de Natação Speedo Legend Rosa',
    description: 'Óculos de natação rosa com ajuste de tira e lentes com tratamento antiembaçante. Não inclui touca.',
    category: 'Acessórios', sport: 'Natação', brand: 'Speedo', price: 49.99, athletePrice: 25,
    source_url: 'https://www.decathlon.com.br/oculos-de-natacao-adulto-legend-ajustavel-rosa-8632148-speedo/p',
    image_url: image('174627473', 'Oculos-de-natacao-adulto-legend-ajustavel-speedo-rosa---unico1'),
    athlete_image: image('174627474', 'Oculos-de-natacao-adulto-legend-ajustavel-speedo-rosa---unico2'),
  },
  {
    key: 'bola-wilson-8632559', title: 'Bola de Basquete Wilson NBA DRV Laranja — Tamanho 7',
    description: 'Bola de basquete laranja, tamanho 7, com revestimento de borracha para quadras externas. Não inclui bomba.',
    category: 'Equipamentos', sport: 'Basquete', brand: 'Wilson', price: 169.99, athletePrice: 90,
    source_url: 'https://www.decathlon.com.br/bola-de-basquete-nba-drv-8632559-wilson/p',
    image_url: image('2857715', '-bola-wilson-nba-drv-71'),
    athlete_image: image('2857716', '-bola-wilson-nba-drv-72'),
  },
  {
    key: 'superband-yangfit-2145327268', title: 'Kit Yangfit Super Band — 4 Intensidades',
    description: 'Conjunto de quatro elásticos super band com resistências diferentes para exercícios de força e alongamento.',
    category: 'Equipamentos', sport: 'Musculação', brand: 'Yangfit', price: 133.12, athletePrice: 70,
    source_url: 'https://www.decathlon.com.br/kit-super-band-4-intensidades-elasticos-para-treino-2145327268/p',
    image_url: image('170321072', '17580457028214'),
    athlete_image: image('170321073', '17580457064698'),
  },
  {
    key: 'garrafa-quechua-8971262', title: 'Garrafa Térmica Quechua Laranja 400 ml com Copo',
    description: 'Garrafa laranja de 400 ml em inox, com parede dupla e tampa que funciona como copo.',
    category: 'Acessórios', sport: 'Trilha', brand: 'Quechua', price: 99.99, athletePrice: 55,
    source_url: 'https://www.decathlon.com.br/garrafa-termica-para-trilha-em-inox-0-4-l-com-copo-laranja-8971262-quechua/p',
    image_url: image('173989262', 'garrafa-termica-para-trilha-em-inox-0-4-l-com-copo-quechua-laranja'),
    athlete_image: image('173989264', 'garrafa-termica-para-trilha-em-inox-0-4-l-com-copo-quechua-laranja'),
  },
  {
    key: 'bomba-domyos-8214626', title: 'Bomba de Ar Domyos Cinza para Bola de Pilates',
    description: 'Bomba manual de dupla ação para encher bolas de pilates. Somente a bomba; bola não incluída.',
    category: 'Acessórios', sport: 'Pilates', brand: 'Domyos', price: 17.99, athletePrice: 10,
    source_url: 'https://www.decathlon.com.br/bola-bomba-de-ar-para-de-pilates-09-l-branco-cinza-8214626-domyos/p',
    image_url: image('2456005', 'gym-ball-pump-1'),
    athlete_image: image('2456006', 'gym-ball-pump-2'),
  },
];
