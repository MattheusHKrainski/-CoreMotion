const ignored = new Set(['a','o','as','os','um','uma','uns','umas','de','do','da','dos','das','e','em','no','na','nos','nas','para','pra','por','com','que','quero','procuro','preciso','comprar','busco']);
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
export function searchTerms(query: string): string[] {
  return [...new Set(normalizeSearch(query).split(/\s+/).filter(term => term && !ignored.has(term)))];
}
function singular(term: string): string { return term.length > 3 && term.endsWith('s') ? term.slice(0,-1) : term; }
export function matchesCatalogSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
  const words = normalizeSearch(fields.filter(Boolean).join(' ')).split(/\s+/);
  return searchTerms(query).every(term => words.some(word => word.includes(term) || singular(word) === singular(term)));
}
export function catalogSearchScore(query: string, title: string): number {
  const normalized = normalizeSearch(title);
  return (normalized.includes(normalizeSearch(query)) ? 20 : 0) + searchTerms(query).reduce((score, term) => score + (matchesCatalogSearch(term,title) ? 3 : 0), 0);
}
