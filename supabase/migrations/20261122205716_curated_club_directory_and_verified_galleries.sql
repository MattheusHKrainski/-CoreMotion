-- Club lists verified against CBF, Volleyball World and J SPORTS (2026/27).
CREATE TABLE IF NOT EXISTS public.catalog_teams (
 id text PRIMARY KEY, league text NOT NULL, season text NOT NULL, country text NOT NULL,
 sport text NOT NULL, club_name text NOT NULL, source_url text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT catalog_team_unique UNIQUE (league,club_name),
 CONSTRAINT catalog_team_league_check CHECK(league IN ('brasileirao-2026','superlega-italia-2026-27','svleague-japao-2026-27'))
);
ALTER TABLE public.catalog_teams ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.catalog_teams FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.catalog_teams TO anon,authenticated;
DROP POLICY IF EXISTS catalog_teams_public_read ON public.catalog_teams;
CREATE POLICY catalog_teams_public_read ON public.catalog_teams FOR SELECT TO anon,authenticated USING (true);
INSERT INTO public.catalog_teams(id,league,season,country,sport,club_name,source_url) VALUES
('brasileirao-2026:athletico-paranaense','brasileirao-2026','2026','Brasil','Futebol','Athletico Paranaense','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:atletico-mg','brasileirao-2026','2026','Brasil','Futebol','Atlético-MG','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:bahia','brasileirao-2026','2026','Brasil','Futebol','Bahia','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:botafogo','brasileirao-2026','2026','Brasil','Futebol','Botafogo','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:chapecoense','brasileirao-2026','2026','Brasil','Futebol','Chapecoense','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:corinthians','brasileirao-2026','2026','Brasil','Futebol','Corinthians','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:coritiba','brasileirao-2026','2026','Brasil','Futebol','Coritiba','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:cruzeiro','brasileirao-2026','2026','Brasil','Futebol','Cruzeiro','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:flamengo','brasileirao-2026','2026','Brasil','Futebol','Flamengo','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:fluminense','brasileirao-2026','2026','Brasil','Futebol','Fluminense','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:gremio','brasileirao-2026','2026','Brasil','Futebol','Grêmio','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:internacional','brasileirao-2026','2026','Brasil','Futebol','Internacional','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:mirassol','brasileirao-2026','2026','Brasil','Futebol','Mirassol','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:palmeiras','brasileirao-2026','2026','Brasil','Futebol','Palmeiras','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:red-bull-bragantino','brasileirao-2026','2026','Brasil','Futebol','Red Bull Bragantino','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:remo','brasileirao-2026','2026','Brasil','Futebol','Remo','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:santos','brasileirao-2026','2026','Brasil','Futebol','Santos','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:sao-paulo','brasileirao-2026','2026','Brasil','Futebol','São Paulo','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:vasco-da-gama','brasileirao-2026','2026','Brasil','Futebol','Vasco da Gama','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('brasileirao-2026:vitoria','brasileirao-2026','2026','Brasil','Futebol','Vitória','https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026'),
('superlega-italia-2026-27:acqua-sant-anna-cuneo','superlega-italia-2026-27','2026/27','Itália','Vôlei','Acqua Sant''Anna Cuneo','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:allianz-milano','superlega-italia-2026-27','2026/27','Itália','Vôlei','Allianz Milano','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:cisterna-volley','superlega-italia-2026-27','2026/27','Itália','Vôlei','Cisterna Volley','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:cucine-lube-civitanova','superlega-italia-2026-27','2026/27','Itália','Vôlei','Cucine Lube Civitanova','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:gas-sales-bluenergy-piacenza','superlega-italia-2026-27','2026/27','Itália','Vôlei','Gas Sales Bluenergy Piacenza','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:itas-trentino-trento','superlega-italia-2026-27','2026/27','Itália','Vôlei','Itas Trentino Trento','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:pallavolo-padova','superlega-italia-2026-27','2026/27','Itália','Vôlei','Pallavolo Padova','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:rana-verona','superlega-italia-2026-27','2026/27','Itália','Vôlei','Rana Verona','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:sir-susa-scai-perugia','superlega-italia-2026-27','2026/27','Itália','Vôlei','Sir Susa Scai Perugia','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:tinet-prata-di-pordenone','superlega-italia-2026-27','2026/27','Itália','Vôlei','Tinet Prata di Pordenone','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:valsa-group-modena','superlega-italia-2026-27','2026/27','Itália','Vôlei','Valsa Group Modena','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('superlega-italia-2026-27:vero-volley-monza','superlega-italia-2026-27','2026/27','Itália','Vôlei','Vero Volley Monza','https://en.volleyballworld.com/volleyball/competitions/superlega/news/verona-and-lube-to-get-new-superlega-season-underway-on-saturday'),
('svleague-japao-2026-27:voreas-hokkaido','svleague-japao-2026-27','2026/27','Japão','Vôlei','Voreas Hokkaido','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:hokkaido-yellow-stars','svleague-japao-2026-27','2026/27','Japão','Vôlei','Hokkaido Yellow Stars','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:tokyo-great-bears','svleague-japao-2026-27','2026/27','Japão','Vôlei','Tokyo Great Bears','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:shinshu-matsumoto-tridents','svleague-japao-2026-27','2026/27','Japão','Vôlei','Shinshu Matsumoto Tridents','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:toray-arrows-shizuoka','svleague-japao-2026-27','2026/27','Japão','Vôlei','Toray Arrows Shizuoka','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:jtekt-stings-aichi','svleague-japao-2026-27','2026/27','Japão','Vôlei','JTEKT Stings Aichi','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:wolfdogs-nagoya','svleague-japao-2026-27','2026/27','Japão','Vôlei','Wolfdogs Nagoya','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:osaka-bluteon','svleague-japao-2026-27','2026/27','Japão','Vôlei','Osaka Bluteon','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:suntory-sunbirds-osaka','svleague-japao-2026-27','2026/27','Japão','Vôlei','Suntory Sunbirds Osaka','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:nippon-steel-sakai-blazers','svleague-japao-2026-27','2026/27','Japão','Vôlei','Nippon Steel Sakai Blazers','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:hiroshima-thunders','svleague-japao-2026-27','2026/27','Japão','Vôlei','Hiroshima Thunders','https://www.jsports.co.jp/volleyball/svleague_men/about/'),
('svleague-japao-2026-27:fragolad-kagoshima','svleague-japao-2026-27','2026/27','Japão','Vôlei','Fragolad Kagoshima','https://www.jsports.co.jp/volleyball/svleague_men/about/')
ON CONFLICT (id) DO UPDATE SET club_name=EXCLUDED.club_name,league=EXCLUDED.league,season=EXCLUDED.season,country=EXCLUDED.country,sport=EXCLUDED.sport,source_url=EXCLUDED.source_url;
ALTER TABLE public.external_offers ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.external_offers ADD COLUMN IF NOT EXISTS team_id text REFERENCES public.catalog_teams(id) ON DELETE SET NULL;
UPDATE public.external_offers SET image_urls=ARRAY[image_url] WHERE cardinality(image_urls)=0 AND image_url LIKE 'https://%';
CREATE INDEX IF NOT EXISTS external_offers_team_idx ON public.external_offers(team_id) WHERE team_id IS NOT NULL;
DO $pub$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='catalog_teams') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.catalog_teams; END IF; END $pub$;
NOTIFY pgrst, 'reload schema';