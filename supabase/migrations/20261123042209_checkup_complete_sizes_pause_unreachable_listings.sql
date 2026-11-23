-- Exact supplier model grades; these sizes do not reserve stock.
UPDATE public.external_offers AS offer
SET variant_options = verified.sizes
FROM (VALUES
  ('offer-bf26-adidas-ultraboost5-id8812', ARRAY['36','37','38','39','40','41','42','43','44','45','46']::text[]),
  ('offer-bf26-adidas-copapure3-jh8728', ARRAY['33,5','34','35','35.5','36','37','38','39','39.5','40','40.5','41','42','42.5','43','43.5','44','45','45.5','46']::text[]),
  ('offer-adidas-camiseta-kd5453', ARRAY['PP','P','M','G','GG','2GG','3GG','4GG']::text[]),
  ('offer-bf26-kipsta-fast500-8977594', ARRAY['39 BR','40 BR','41 BR','42 BR','43 BR','44 BR']::text[]),
  ('offer-bf26-nba-lakers-9002131', ARRAY['P','M','G','GG']::text[]),
  ('offer-decathlon-bjj-8920531', ARRAY['A1 165–175 cm']::text[]),
  ('offer-decathlon-umbro-2145645567', ARRAY['42']::text[]),
  ('offer-olympikus-estilo2-43359278', ARRAY['34','35','36','37','38','39','40','41','42','43','44']::text[]),
  ('offer-olympikus-corremax-43758365', ARRAY['34','35','36','37','38','39','40','41','42','43','44']::text[]),
  ('offer-decathlon-karate-8914337', ARRAY['170 CM','180 CM','190 CM']::text[])
) AS verified(id, sizes)
WHERE offer.id = verified.id AND COALESCE(cardinality(offer.variant_options), 0) = 0;

-- Keep these two legacy listings recoverable until the seller supplies contact details.
UPDATE public.products SET status = 'draft'
WHERE id IN ('93cfd6c1-b7f2-4bdb-a496-0e1cff4e91eb','e81a1d5d-c0ea-4928-a3c6-fc6159e84ad4')
  AND product_type = 'c2c' AND status = 'active' AND seller_id IS NULL
  AND COALESCE(btrim(contact_phone), '') = '';
