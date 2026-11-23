import type { SportsRecord } from './sports';
export const SPORTS_PROFILE_FIELDS = {
 athlete: {
  name:'Nome esportivo',sport:'Esporte',city:'Cidade / UF',age:'Idade',height:'Altura (cm)',weight:'Peso (kg)',experience:'Tempo de prática (anos)',position:'Posição / especialidade',achievements:'Medalhas e conquistas',history:'Equipes anteriores e estatísticas',availability:'Disponibilidade para treinar',contact:'Contato para treinadores',
 },
 coach: {
  name:'Nome profissional',sport:'Modalidades',city:'Cidade / UF',experience:'Experiência (anos)',qualifications:'Formação e certificações / registro profissional',team:'Equipe / instituição',methodology:'Metodologia e público atendido',availability:'Locais e horários de atendimento',contact:'Contato profissional',
 },
} as const;
export function sportsProfileDetails(record:SportsRecord):{label:string;value:string}[] {
 if(record.kind!=='athlete'&&record.kind!=='coach')return [];
 return Object.entries(SPORTS_PROFILE_FIELDS[record.kind]).flatMap(([key,label])=>{
  const value=record.data[key];return typeof value==='string'&&value.trim()?[{label,value}]:[];
 });
}
