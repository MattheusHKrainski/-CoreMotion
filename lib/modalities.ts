export const MODALITIES = ['Alongamento', 'Basquete', 'Ciclismo', 'Corrida', 'Futebol', 'Ginástica', 'Jiu-Jitsu', 'Karatê', 'Musculação', 'Natação', 'Pilates', 'Tênis', 'Triatlo', 'Vôlei', 'Yoga'];
export const normalizeSport = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
export const matchesSport = (value: string | undefined, query: string) => !query || query === 'all' || normalizeSport(value || '').includes(normalizeSport(query));
