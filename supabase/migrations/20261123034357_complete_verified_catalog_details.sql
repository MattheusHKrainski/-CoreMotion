-- Fichas públicas dos fabricantes consultadas em 23/11/2026.
UPDATE public.external_offers e SET description = d.body, updated_at = now()
FROM (VALUES
  ('curated-mizuno-8049', 'Kit unissex com três pares na cor branco, para numeração 33 a 38. Sem cano. Composição de 75% algodão, 22% poliéster, 2% elastano e 1% elastodieno.'),
  ('curated-mizuno-8052', 'Kit unissex com três pares na cor branco, para numeração 33 a 38. Cano curto. Composição de 75% algodão, 22% poliéster, 2% elastano e 1% elastodieno.'),
  ('curated-mizuno-8074', 'Kit unissex com três pares na cor preto, para numeração 39 a 44. Cano curto. Composição de 75% algodão, 22% poliéster, 2% elastano e 1% elastodieno.'),
  ('curated-mizuno-8073', 'Kit unissex com três pares na cor cinza, para numeração 39 a 44. Cano curto. Composição de 75% algodão, 22% poliéster, 2% elastano e 1% elastodieno.'),
  ('curated-mizuno-8060', 'Kit unissex com três pares na cor branco, para numeração 39 a 44. Cano curto. Composição de 75% algodão, 22% poliéster, 2% elastano e 1% elastodieno.'),
  ('curated-fila-1391791', 'Bolsa lateral unissex da linha Sport Life, na cor preta. O corpo e o forro são de poliéster.'),
  ('curated-fila-1366196', 'Modelo casual feminino em bege, castanho-claro e marrom. O cabedal combina tecido, camurça e material sintético. O solado tem 50% EVA e 50% borracha termoplástica (TR).'),
  ('curated-umbro-1367121', 'Bermuda preta de viagem da coleção masculina do Santos de 2026. O tecido do corpo tem 97% poliéster e 3% elastano.'),
  ('curated-umbro-1396856', 'Camisa masculina de goleiro do Santos de 2026, com mangas curtas, na cor marinho. O corpo tem 97% poliéster e 3% elastano.')
) AS d(id,body)
WHERE e.id = d.id AND lower(trim(e.description)) = lower(trim(e.title));

UPDATE public.external_offers e SET variant_options = v.sizes, updated_at = now()
FROM (VALUES
  ('curated-mizuno-11276', 'https://www.mizuno.com.br/bermuda-de-treino-mizuno-ten-master-masculina-masculino-vermelho-11276/p', 149.99, ARRAY['P', 'M', 'G', 'GG', 'EG']::text[]),
  ('curated-mizuno-11647', 'https://www.mizuno.com.br/camisa-4-de-futebol-mizuno-x-botafogo-masculina-masculino-rosa-11647/p', 419.99, ARRAY['P', 'M', 'G', 'GG']::text[]),
  ('curated-mizuno-8969', 'https://www.mizuno.com.br/tenis-mizuno-wave-prophecy-14-s-102290003-3-504/p', 999.99, ARRAY['37', '38']::text[]),
  ('curated-mizuno-8970', 'https://www.mizuno.com.br/tenis-mizuno-wave-prophecy-14-s-102290003-3-800/p', 999.99, ARRAY['34', '36']::text[]),
  ('curated-umbro-1329150', 'https://www.umbro.com.br/chuteira-futsal-umbro-fast-ii-jr-1329150/p', 69.99, ARRAY['24', '28']::text[]),
  ('curated-umbro-1386625', 'https://www.umbro.com.br/camisa-infantil-umbro-santos-outubro-rosa-2026-1386625/p', 279.99, ARRAY['6M', '1', '2', '4', '6']::text[]),
  ('curated-umbro-1418341', 'https://www.umbro.com.br/camisa-juvenil-umbro-legacy-1418341/p', 49.99, ARRAY['8', '12', '14', '16']::text[]),
  ('curated-umbro-1418343', 'https://www.umbro.com.br/camisa-juvenil-umbro-legacy-1418343/p', 49.99, ARRAY['8', '10', '12', '14', '16']::text[])
) AS v(id,url,price,sizes)
WHERE e.id = v.id AND e.source_url = v.url AND e.price = v.price
  AND coalesce(cardinality(e.variant_options),0) = 0;
