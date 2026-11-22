export function safeAuthReturn(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/';
  try { const url=new URL(value,'https://coremotion.invalid');return url.origin==='https://coremotion.invalid' && !/^\/entrar(?:\/|$)/.test(url.pathname) ? url.pathname+url.search+url.hash : '/'; }catch{return '/';}
}
