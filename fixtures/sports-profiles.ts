import type { Coach, Athlete } from '@/lib/types';

// Illustrative local profiles only: no auth accounts, verified credentials or external contacts.
export const ADDITIONAL_COACHES: Coach[] = [
  {
    "id": "coach-pilates-marina",
    "name": "Marina Duarte",
    "title": "Pilates e mobilidade",
    "specialty": "Pilates",
    "sports": [
      "Pilates",
      "Ginástica"
    ],
    "avatar_url": "/profiles/coach-pilates-marina.svg",
    "bio": "Sessões de controle corporal, estabilidade e mobilidade, com progressão adaptada à rotina de cada aluno.",
    "rating": 0,
    "reviews_count": 0,
    "hourly_rate": 95,
    "location": "Curitiba, PR",
    "is_certified": false,
    "availability": "Segundas, quartas e sextas, das 7h às 11h"
  },
  {
    "id": "coach-natacao-rafael",
    "name": "Rafael Azevedo",
    "title": "Técnica e condicionamento na água",
    "specialty": "Natação",
    "sports": [
      "Natação",
      "Águas abertas"
    ],
    "avatar_url": "/profiles/coach-natacao-rafael.svg",
    "bio": "Treinos voltados à respiração, coordenação e eficiência de nado para adultos que estão começando ou retomando a prática.",
    "rating": 0,
    "reviews_count": 0,
    "hourly_rate": 110,
    "location": "Joinville, SC",
    "is_certified": false,
    "availability": "Terças e quintas, das 16h às 20h"
  },
  {
    "id": "coach-forca-fernanda",
    "name": "Fernanda Reis",
    "title": "Força para o esporte e o dia a dia",
    "specialty": "Musculação",
    "sports": [
      "Musculação",
      "Treinamento funcional"
    ],
    "avatar_url": "/profiles/coach-forca-fernanda.svg",
    "bio": "Planejamento de força com foco na execução dos movimentos, organização da semana e evolução gradual das cargas.",
    "rating": 0,
    "reviews_count": 0,
    "hourly_rate": 120,
    "location": "São Paulo, SP",
    "is_certified": false,
    "availability": "Dias úteis, das 6h às 10h; acompanhamento online"
  },
  {
    "id": "coach-futebol-diego",
    "name": "Diego Martins",
    "title": "Fundamentos e preparação para jogos",
    "specialty": "Futebol",
    "sports": [
      "Futebol",
      "Futsal"
    ],
    "avatar_url": "/profiles/coach-futebol-diego.svg",
    "bio": "Atividades de passe, domínio, tomada de decisão e preparação física para equipes amadoras e jogadores em formação.",
    "rating": 0,
    "reviews_count": 0,
    "hourly_rate": 90,
    "location": "Porto Alegre, RS",
    "is_certified": false,
    "availability": "Terças e quintas à tarde; sábados pela manhã"
  },
  {
    "id": "coach-volei-juliana",
    "name": "Juliana Costa",
    "title": "Fundamentos de quadra e areia",
    "specialty": "Vôlei",
    "sports": [
      "Vôlei",
      "Vôlei de praia"
    ],
    "avatar_url": "/profiles/coach-volei-juliana.svg",
    "bio": "Sessões com foco em recepção, saque e deslocamento, organizadas por nível de experiência e objetivos do grupo.",
    "rating": 0,
    "reviews_count": 0,
    "hourly_rate": 100,
    "location": "Rio de Janeiro, RJ",
    "is_certified": false,
    "availability": "Segundas e quartas à noite; sábados pela manhã"
  },
  {
    "id": "coach-tenis-bruno",
    "name": "Bruno Almeida",
    "title": "Técnica e movimentação em quadra",
    "specialty": "Tênis",
    "sports": [
      "Tênis"
    ],
    "avatar_url": "/profiles/coach-tenis-bruno.svg",
    "bio": "Treinos individuais de consistência, movimentação e construção de pontos para quem deseja começar ou voltar a jogar.",
    "rating": 0,
    "reviews_count": 0,
    "hourly_rate": 130,
    "location": "Belo Horizonte, MG",
    "is_certified": false,
    "availability": "Dias úteis à tarde; domingos pela manhã"
  }
];

export const ADDITIONAL_ATHLETES: Athlete[] = [
  {
    "id": "athlete-futebol-pedro",
    "name": "Pedro Henrique Lima",
    "sport": "Futebol",
    "category": "Amador · Meio-campista",
    "avatar_url": "/profiles/athlete-futebol-pedro.svg",
    "bio": "Jogador de meio-campo interessado em equipes amadoras e oportunidades de treino coletivo. Prioriza passe curto, movimentação e leitura de jogo.",
    "achievements": [
      "Treina três vezes por semana",
      "Objetivo: ampliar resistência para jogos completos"
    ],
    "location": "Curitiba, PR",
    "sponsorship_status": "seeking"
  },
  {
    "id": "athlete-volei-larissa",
    "name": "Larissa Monteiro",
    "sport": "Vôlei",
    "category": "Universitário · Ponteira",
    "avatar_url": "/profiles/athlete-volei-larissa.svg",
    "bio": "Pratica vôlei de quadra e busca uma equipe com treinos regulares. Tem interesse em desenvolver recepção e ataque pelas pontas.",
    "achievements": [
      "Rotina de treinos em quadra e preparação física",
      "Objetivo: participar de competições universitárias"
    ],
    "location": "Londrina, PR",
    "sponsorship_status": "seeking"
  },
  {
    "id": "athlete-natacao-luiza",
    "name": "Luiza Ferreira",
    "sport": "Natação",
    "category": "Adulto · Livre e costas",
    "avatar_url": "/profiles/athlete-natacao-luiza.svg",
    "bio": "Nada em piscina de 25 metros e organiza a rotina entre técnica e condicionamento. Busca orientação para evoluir no ritmo e nas viradas.",
    "achievements": [
      "Foco em provas de 50 e 100 metros",
      "Objetivo: completar sua primeira competição local"
    ],
    "location": "Joinville, SC",
    "sponsorship_status": "seeking"
  },
  {
    "id": "athlete-basquete-andre",
    "name": "André Ribeiro",
    "sport": "Basquete",
    "category": "Amador · Armador",
    "avatar_url": "/profiles/athlete-basquete-andre.svg",
    "bio": "Joga basquete em grupos da cidade e procura treinos coletivos. Trabalha controle de bola, arremesso e organização das jogadas.",
    "achievements": [
      "Treina fundamentos e participa de jogos semanais",
      "Objetivo: integrar uma equipe amadora"
    ],
    "location": "São Paulo, SP",
    "sponsorship_status": "seeking"
  },
  {
    "id": "athlete-judo-isabela",
    "name": "Isabela Rocha",
    "sport": "Judô",
    "category": "Adulto · Em desenvolvimento",
    "avatar_url": "/profiles/athlete-judo-isabela.svg",
    "bio": "Pratica judô com foco em técnica, disciplina e preparação física. Procura oportunidades de intercâmbio de treino entre equipes.",
    "achievements": [
      "Rotina de treinos técnicos e de mobilidade",
      "Objetivo: ampliar repertório de projeções"
    ],
    "location": "Belo Horizonte, MG",
    "sponsorship_status": "seeking"
  },
  {
    "id": "athlete-tenis-mateus",
    "name": "Mateus Carvalho",
    "sport": "Tênis",
    "category": "Amador · Simples e duplas",
    "avatar_url": "/profiles/athlete-tenis-mateus.svg",
    "bio": "Retomou o tênis e busca parceiros de nível intermediário. Treina regularidade de fundo de quadra e movimentação.",
    "achievements": [
      "Disponibilidade para jogos aos fins de semana",
      "Objetivo: participar de torneios amadores"
    ],
    "location": "Campinas, SP",
    "sponsorship_status": "seeking"
  },
  {
    "id": "athlete-triatlo-carolina",
    "name": "Carolina Mendes",
    "sport": "Triatlo",
    "category": "Amador · Distância sprint",
    "avatar_url": "/profiles/athlete-triatlo-carolina.svg",
    "bio": "Combina natação, ciclismo e corrida em uma rotina semanal progressiva. Busca grupos de treino e apoio para sua primeira prova sprint.",
    "achievements": [
      "Foco em transições e consistência semanal",
      "Objetivo: completar uma prova sprint"
    ],
    "location": "Florianópolis, SC",
    "sponsorship_status": "seeking"
  },
  {
    "id": "athlete-corrida-renato",
    "name": "Renato Oliveira",
    "sport": "Corrida",
    "category": "Amador · 5 km e 10 km",
    "avatar_url": "/profiles/athlete-corrida-renato.svg",
    "bio": "Corre antes do trabalho e participa de treinos em parques. Quer evoluir com uma rotina equilibrada entre corrida, força e descanso.",
    "achievements": [
      "Treinos regulares de corrida e fortalecimento",
      "Objetivo: completar 10 km com ritmo constante"
    ],
    "location": "Recife, PE",
    "sponsorship_status": "seeking"
  }
];
