-- Source-supplied club jersey photographs awaiting exact SKU, pricing and stock checks.
-- These are visual catalog previews, NOT sale offers. Do not create checkout-eligible items with guessed prices.
CREATE TABLE IF NOT EXISTS public.catalog_team_uniform_previews (
  id text PRIMARY KEY,
  team_id text NOT NULL REFERENCES public.catalog_teams(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) >= 6),
  description text NOT NULL DEFAULT '',
  season text,
  image_url text NOT NULL CHECK (image_url LIKE '/catalog/club-uniforms/%'),
  price_brl numeric(12,2) CHECK (price_brl IS NULL OR price_brl > 0),
  availability_status text NOT NULL DEFAULT 'awaiting_verification'
    CHECK (availability_status IN ('awaiting_verification','sold_out')),
  womens_collection boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catalog_team_uniform_previews_by_team
  ON public.catalog_team_uniform_previews(team_id);
ALTER TABLE public.catalog_team_uniform_previews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.catalog_team_uniform_previews FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.catalog_team_uniform_previews TO anon, authenticated;
DROP POLICY IF EXISTS catalog_team_uniform_previews_public_select ON public.catalog_team_uniform_previews;
CREATE POLICY catalog_team_uniform_previews_public_select
  ON public.catalog_team_uniform_previews FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.catalog_team_uniform_previews
(id,team_id,title,description,season,image_url,price_brl,availability_status,womens_collection)
VALUES
('user-photo-monte-carmelo-blue-orange',
 'superliga-brasil-masculina-2026-27:azulim-sicoob-aracoop-mc',
 'Uniforme Monte Carmelo Vôlei azul-marinho e laranja — modelo de jogo',
 'Foto fornecida pelo usuário. Escudo e patrocinadores Sicoob e Start visíveis. O número 1 é de jogo e não significa que a personalização esteja disponível. Temporada, preço e estoque desta peça específica ainda não foram confirmados.',
 NULL,'/catalog/club-uniforms/monte-carmelo-blue-orange.png',
 NULL,'awaiting_verification',false),
('user-photo-montes-claros-black-gold',
 'superliga-brasil-masculina-2026-27:montes-claros-volei',
 'Uniforme Montes Claros Vôlei preto e dourado — modelo de jogo',
 'Foto fornecida pelo usuário. Escudo Montes Claros e inscrição Prefeitura de Montes Claros; uniforme de jogo preto/dourado. Patrocinadores e numeração representam a foto de apresentação, não personalização garantida. Preço e estoque deste modelo não confirmados.',
 '2025/26','/catalog/club-uniforms/montes-claros-black-gold.png',
 NULL,'awaiting_verification',false),
('user-photo-norde-2025-blue',
 'superliga-brasil-masculina-2026-27:norde-volei',
 'Camisa Norde Vôlei 2025/26 — azul-marinho e rosa',
 'Foto fornecida pelo usuário de dois uniformes (azul e rosa). Identificação cruzada com os patrocinadores Libah, Entrepay, Banco do Nordeste e A2M. Esta é uma referência de coleção, não a confirmação de duas SKUs vendáveis. Preço e estoque a verificar.',
 '2025/26','/catalog/club-uniforms/norde-blue-pink.png',
 NULL,'awaiting_verification',false),
('user-photo-dentil-praia-black-women',
 'superliga-brasil-masculina-2026-27:praia-clube-uberlandia-volei',
 'Camisa Dentil/Praia Clube preta — equipe feminina, modelo histórico',
 'Foto fornecida pelo usuário. É uma peça da identidade Dentil/Praia Clube de vôlei feminino, não do uniforme masculino da Superliga A. Mantida como referência visual na página do clube, com identificação expressa da categoria feminina. Temporada, preço e estoque desta foto não confirmados.',
 NULL,'/catalog/club-uniforms/dentil-praia-womens-black.png',
 NULL,'awaiting_verification',true)
ON CONFLICT(id) DO UPDATE SET
 team_id=EXCLUDED.team_id,title=EXCLUDED.title,description=EXCLUDED.description,
 season=EXCLUDED.season,image_url=EXCLUDED.image_url,price_brl=EXCLUDED.price_brl,
 availability_status=EXCLUDED.availability_status,womens_collection=EXCLUDED.womens_collection;
NOTIFY pgrst,'reload schema';