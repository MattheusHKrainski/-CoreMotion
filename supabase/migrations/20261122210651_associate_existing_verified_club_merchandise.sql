-- Associate existing confirmed brand merchandise with the correct Brazilian football club.
UPDATE public.external_offers
SET team_id='brasileirao-2026:botafogo'
WHERE id='mizuno-br-11210' AND title ILIKE '%Botafogo%' AND team_id IS NULL;
UPDATE public.external_offers
SET team_id='brasileirao-2026:santos'
WHERE id IN ('curated-umbro-1367121','curated-umbro-1367367','curated-umbro-1367366','curated-umbro-1367368')
  AND title ILIKE '%Santos%' AND team_id IS NULL;
