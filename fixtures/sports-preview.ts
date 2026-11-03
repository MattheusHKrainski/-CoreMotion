import type { SportsRecord } from '@/lib/sports';

/** Conteúdo temporário exclusivo do ambiente sem Supabase. Não enviar ao banco real. */
export function createSportsPreview(today = new Date()): SportsRecord[] {
  const date = (days: number) => {
    const next = new Date(today);
    next.setUTCDate(next.getUTCDate() + days);
    return next.toISOString().slice(0, 10);
  };
  const athletes = [
    ['Carlos Eduardo Ramos', 'Futebol', 'Curitiba / PR', '22', '180', '76', '8', 'Meio-campista', 'Campeão regional universitário; melhor passe da temporada', '32 jogos; 9 gols; 14 assistências', 'user-c2c-1-athlete'],
    ['Luana Ferreira', 'Vôlei', 'Curitiba / PR', '19', '184', '72', '6', 'Ponteira', 'Ouro interuniversitário; destaque de recepção', '21 jogos; média de 13 pontos por partida', 'preview-athlete-luana'],
    ['Pedro Azevedo', 'Basquete', 'São Paulo / SP', '24', '193', '88', '10', 'Ala-armador', 'Vice-campeão municipal; seleção universitária', '18 pontos; 6 rebotes; 4 assistências por jogo', 'preview-athlete-pedro'],
    ['Isabela Costa', 'Natação', 'Florianópolis / SC', '21', '172', '64', '9', '100 m e 200 m livre', '3 ouros em torneios universitários', '100 m livre: 1min01s; 200 m livre: 2min14s', 'preview-athlete-isabela'],
    ['Rafael Martins', 'Futsal', 'Londrina / PR', '23', '176', '74', '11', 'Fixo', 'Campeão de liga universitária', '28 jogos; 42 interceptações; 8 assistências', 'preview-athlete-rafael'],
    ['Camila Rocha', 'Atletismo', 'Curitiba / PR', '26', '167', '58', '7', '5 km e 10 km', 'Pódio regional nos 5 km; ouro por equipe', '5 km: 19min20s; 10 km: 40min10s', 'preview-athlete-camila'],
    ['Bruno Almeida', 'Jiu-Jitsu', 'Joinville / SC', '25', '178', '82', '8', 'Faixa roxa • médio', '2 ouros estaduais; bronze em circuito aberto', '24 lutas; 18 vitórias; 10 finalizações', 'preview-athlete-bruno'],
    ['Mariana Alves', 'Tênis', 'São José dos Pinhais / PR', '20', '174', '65', '9', 'Simples • destra', 'Campeã universitária; finalista de circuito regional', '18 vitórias na temporada; 68% de aproveitamento', 'preview-athlete-mariana'],
  ];
  const records: SportsRecord[] = athletes.map(([name, sport, city, age, height, weight, experience, position, achievements, history, owner], i) => ({
    id: `preview-athlete-${i + 1}`, owner, kind: 'athlete',
    data: { name, sport, city, age, height, weight, experience, position, achievements, history, availability: 'Segunda a sexta, após as 18h; sábados pela manhã', contact: `atleta${i + 1}@coremotion.example.test` },
  }));
  const coaches = [
    ['Marina Duarte', 'Futebol, Futsal', 'Curitiba / PR', '12', 'Preparação esportiva e desenvolvimento de equipes', 'Equipe Horizonte', 'Treinamento técnico e tático com acompanhamento individual', 'Segunda, quarta e sexta • 18h30 às 20h30', 'user-c2c-1-coach'],
    ['André Ribeiro', 'Vôlei, Basquete', 'São Paulo / SP', '9', 'Formação em Educação Física; especialização em esportes coletivos', 'Núcleo Impulso', 'Fundamentos, leitura de jogo e evolução por posição', 'Terça e quinta • 19h às 21h', 'preview-coach-andre'],
    ['Beatriz Nunes', 'Pilates, Alongamento', 'Curitiba / PR', '8', 'Formação em Educação Física e formação complementar em pilates', 'Espaço Movimento', 'Mobilidade, consciência corporal e progressão de exercícios', 'Segunda a sexta • 7h às 11h e 17h às 20h', 'preview-coach-beatriz'],
    ['Helena Souza', 'Ginástica, Yoga', 'Florianópolis / SC', '6', 'Formação em Educação Física; cursos de ginástica e yoga', 'Núcleo Equilíbrio', 'Aulas acessíveis para bem-estar, força e manutenção de rotina', 'Terça, quinta e sábado • 8h às 10h', 'preview-coach-helena'],
    ['Diego Pires', 'Natação, Atletismo', 'Florianópolis / SC', '11', 'Treinamento esportivo e preparação física', 'Equipe Costa Ativa', 'Avaliação técnica, planejamento e evolução de desempenho', 'Segunda a sexta • 6h às 8h e 18h às 20h', 'preview-coach-diego'],
  ];
  coaches.forEach(([name, sport, city, experience, qualifications, team, methodology, availability, owner], i) => records.push({
    id: `preview-coach-${i + 1}`, owner, kind: 'coach', data: { name, sport, city, experience, qualifications, team, methodology, availability, contact: `treinador${i + 1}@coremotion.example.test` },
  }));
  const trials = [
    ['Seletiva de futebol • equipe principal', 'Futebol', 'Curitiba / PR', '18', '28', 'Adulto', 'Equipe Horizonte', 'Campo de treinamento Horizonte • portão principal', '09:00', 'Segunda, quarta e sexta', '18h30 às 20h30', 14, 'user-c2c-1-coach'],
    ['Peneira de vôlei • novas ponteiras e centrais', 'Vôlei', 'São Paulo / SP', '18', '23', 'SUB-23', 'Núcleo Impulso', 'Ginásio do Núcleo Impulso • quadra 2', '14:00', 'Terça e quinta', '19h às 21h', 21, 'preview-coach-andre'],
    ['Avaliação de basquete • formação de elenco', 'Basquete', 'São Paulo / SP', '18', '30', 'Adulto', 'Núcleo Impulso', 'Ginásio do Núcleo Impulso • quadra 1', '10:00', 'Segunda e quarta', '19h às 21h', 28, 'preview-coach-andre'],
    ['Treino avaliativo de natação • provas de velocidade', 'Natação', 'Florianópolis / SC', '18', '35', 'Adulto', 'Equipe Costa Ativa', 'Centro aquático Costa Ativa • recepção', '07:00', 'Segunda, quarta e sexta', '6h30 às 8h', 35, 'preview-coach-diego'],
    ['Seletiva de futsal • elenco universitário', 'Futsal', 'Curitiba / PR', '18', '25', 'Universitário', 'Equipe Horizonte', 'Ginásio Horizonte • entrada de atletas', '15:00', 'Terça e quinta', '18h às 20h', 18, 'user-c2c-1-coach'],
    ['Avaliação de atletismo • equipe de corrida', 'Atletismo', 'Florianópolis / SC', '18', '40', 'Adulto', 'Equipe Costa Ativa', 'Pista Costa Ativa • ponto de encontro na arquibancada', '08:00', 'Terça, quinta e sábado', '7h às 8h30', 42, 'preview-coach-diego'],
  ] as const;
  trials.forEach(([name, sport, city, minAge, maxAge, category, team, address, time, trainingDays, trainingTime, days, owner], i) => records.push({
    id: `preview-trial-${i + 1}`, owner, kind: 'trial', data: { name, sport, city, minAge, maxAge, category, team, address, time: `${time} • horário de Brasília`, date: date(days), deadline: date(days - 3), requirements: 'Levar documento de identificação, roupa adequada, calçado da modalidade e garrafa de água. Chegar com 30 minutos de antecedência.', trainingDays, trainingTime, trainingLocation: address, contact: `equipe${i + 1}@coremotion.example.test` },
  }));
  records.push(
    { id: 'preview-application-1', owner: 'preview-athlete-rafael', kind: 'application', data: { target: 'preview-trial-5', recipient: 'user-c2c-1-coach', name: 'Rafael Martins', profile: 'preview-athlete-5' } },
    { id: 'preview-application-2', owner: 'user-c2c-1-athlete', kind: 'application', data: { target: 'preview-trial-3', recipient: 'preview-coach-andre', name: 'Carlos Eduardo Ramos', profile: 'preview-athlete-1' } },
    { id: 'preview-invite-1', owner: 'user-c2c-1-coach', kind: 'invite', data: { target: 'preview-athlete-1', recipient: 'user-c2c-1-athlete', name: 'Marina Duarte • Equipe Horizonte', message: 'Gostamos do seu histórico como meio-campista. Gostaríamos de conhecer seu jogo no próximo treino avaliativo. Consulte a seletiva de futebol para conferir local, data e horários.' } },
  );
  return records;
}

/** Inicializa uma única vez, preservando cadastros, edições e exclusões posteriores. */
export function loadSportsPreview(storage: Pick<Storage, 'getItem' | 'setItem'>): SportsRecord[] {
  const key = 'coremotion_sports_v1';
  const marker = 'coremotion_sports_content_v1';
  const stored: unknown = JSON.parse(storage.getItem(key) || '[]');
  if (!Array.isArray(stored)) throw new Error('Dados esportivos inválidos.');
  const records = stored as SportsRecord[];
  if (storage.getItem(marker)) return records;
  const seeds = createSportsPreview().filter(seed => !records.some(record => record.id === seed.id || (['athlete', 'coach'].includes(seed.kind) && record.kind === seed.kind && record.owner === seed.owner)));
  const merged = [...records, ...seeds];
  storage.setItem(key, JSON.stringify(merged));
  storage.setItem(marker, '1');
  return merged;
}
