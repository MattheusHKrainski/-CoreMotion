import type { SportsRecord } from './sports';
export function validateSportsProfile(kind:SportsRecord['kind'],data:Record<string,string>):string|null {
 if(!['athlete','coach'].includes(kind))return null;
 if(['name','sport','city'].some(key=>(data[key]||'').trim().length<2))return 'Preencha nome, esporte e cidade (mínimo de 2 caracteres).';
 if(kind==='athlete'){
  const ranges:[string,number,number,string][]=[['age',1,120,'Idade: informe de 1 a 120 anos.'],['height',30,260,'Altura: informe em centímetros (ex.: 180, não 1,80).'],['weight',1,400,'Peso: informe de 1 a 400 kg.'],['experience',0,120,'Tempo de prática: informe de 0 a 120 anos.']];
  for(const [key,min,max,message] of ranges){const raw=(data[key]||'').trim(),value=Number(raw.replace(',','.'));if(!raw||!Number.isFinite(value)||value<min||value>max||(key==='age'&&!Number.isInteger(value)))return message;}
 }
 return null;
}
export function sportsSaveError(error:{code?:string;message?:string}|null):string {
 if(error?.code==='23505')return 'Já existe um perfil para esta conta. Atualize a página e edite o perfil existente.';
 if(error?.code==='42501')return 'Sua sessão ou tipo de conta não permite esta ação. Entre novamente e confira se a conta é de atleta ou treinador.';
 if(error?.code==='P0001')return error.message||'Confira os campos do perfil.';
 if(['22P02','22003'].includes(error?.code||''))return 'Confira os campos numéricos. Use altura em centímetros e peso em kg.';
 return 'Não foi possível salvar. Verifique a conexão e tente novamente; seus dados foram preservados.';
}
