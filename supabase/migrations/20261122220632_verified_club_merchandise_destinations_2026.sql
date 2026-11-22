-- Verified destination for all teams, without representing external EUR/JPY prices as BRL.
ALTER TABLE public.catalog_teams ADD COLUMN IF NOT EXISTS merchandise_url text;
ALTER TABLE public.catalog_teams ADD COLUMN IF NOT EXISTS merchandise_source text;
DO $constraint$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='catalog_teams_merchandise_https') THEN
  ALTER TABLE public.catalog_teams ADD CONSTRAINT catalog_teams_merchandise_https CHECK (merchandise_url IS NULL OR merchandise_url ~ '^https://[^[:space:]]+$');
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='catalog_teams_merchandise_source') THEN
  ALTER TABLE public.catalog_teams ADD CONSTRAINT catalog_teams_merchandise_source CHECK (merchandise_source IS NULL OR merchandise_source IN ('official','manufacturer','retailer'));
 END IF;
END $constraint$;
UPDATE public.catalog_teams AS c SET merchandise_url=s.url,merchandise_source=s.source
FROM (VALUES
('brasileirao-2026:athletico-paranaense', 'https://loja.athletico.com.br/masculino/linha-oficial', 'official'),
('brasileirao-2026:atletico-mg', 'https://www.lojadogalo.com.br/linha-oficial', 'official'),
('brasileirao-2026:bahia', 'https://www.lojaesquadrao.com.br/', 'official'),
('brasileirao-2026:botafogo', 'https://store.botafogo.com.br/linha-oficial', 'official'),
('brasileirao-2026:chapecoense', 'https://www.kappa.com.br/times/chapecoense', 'manufacturer'),
('brasileirao-2026:corinthians', 'https://www.nike.com.br/hotsite/corinthians', 'manufacturer'),
('brasileirao-2026:coritiba', 'https://www.centauro.com.br/nav/linha/coritiba', 'retailer'),
('brasileirao-2026:cruzeiro', 'https://loja.cruzeiro.com.br/', 'official'),
('brasileirao-2026:flamengo', 'https://loja.flamengo.com.br/', 'official'),
('brasileirao-2026:fluminense', 'https://loja.fluminense.com.br/puma/camisas', 'official'),
('brasileirao-2026:gremio', 'https://loja.gremiomania.com.br/uniformes-oficiais', 'official'),
('brasileirao-2026:internacional', 'https://www.adidas.com.br/internacional', 'manufacturer'),
('brasileirao-2026:mirassol', 'https://athletabrasil.com/collections/mirassol', 'manufacturer'),
('brasileirao-2026:palmeiras', 'https://www.palmeirasstore.com/uniforme-de-jogo/masculino/camisa-i', 'official'),
('brasileirao-2026:red-bull-bragantino', 'https://www.redbullshop.com.br/', 'official'),
('brasileirao-2026:remo', 'https://clubedoremo.com.br/loja', 'official'),
('brasileirao-2026:santos', 'https://www.umbro.com.br/santos', 'manufacturer'),
('brasileirao-2026:sao-paulo', 'https://www.saostore.com.br/', 'official'),
('brasileirao-2026:vasco-da-gama', 'https://www.nike.com.br/nav/times/vasco', 'manufacturer'),
('brasileirao-2026:vitoria', 'https://www.lojasounego.com.br/Masculino/Camisas', 'official'),
('superlega-italia-2026-27:acqua-sant-anna-cuneo', 'https://cuneovolley.it/anduma', 'official'),
('superlega-italia-2026-27:allianz-milano', 'https://powervolleymilano.shop/shop/', 'official'),
('superlega-italia-2026-27:cisterna-volley', 'https://cisternavolley.it/shop/', 'official'),
('superlega-italia-2026-27:cucine-lube-civitanova', 'https://shop.lubevolley.it/store/', 'official'),
('superlega-italia-2026-27:gas-sales-bluenergy-piacenza', 'https://www.shop.gassalespiacenza.it/collections/all', 'official'),
('superlega-italia-2026-27:itas-trentino-trento', 'https://store.trentinovolley.it', 'official'),
('superlega-italia-2026-27:pallavolo-padova', 'https://www.pallavolopadova.com/negozio/', 'official'),
('superlega-italia-2026-27:rana-verona', 'https://www.veronavolley.it/it-it/online-il-verona-volley-store.aspx', 'official'),
('superlega-italia-2026-27:sir-susa-scai-perugia', 'https://www.sirsafetyperugia.it/Sir/negozio/', 'official'),
('superlega-italia-2026-27:tinet-prata-di-pordenone', 'https://volleyprata.ninesquared.club', 'manufacturer'),
('superlega-italia-2026-27:valsa-group-modena', 'https://shop.modenavolley.it/negozio/', 'official'),
('superlega-italia-2026-27:vero-volley-monza', 'https://official-store.verovolley.com/collections/abbigliamento', 'official'),
('svleague-japao-2026-27:fragolad-kagoshima', 'https://direct.yupiteru.co.jp/category/FRAGOLAD_GOODS/', 'official'),
('svleague-japao-2026-27:hiroshima-thunders', 'https://www.store.jt-volleyball.com/shopbrand/TH_CT00/', 'official'),
('svleague-japao-2026-27:hokkaido-yellow-stars', 'https://hy-stars.jp/goods/', 'official'),
('svleague-japao-2026-27:jtekt-stings-aichi', 'https://jtekt-stings.shop/', 'official'),
('svleague-japao-2026-27:nippon-steel-sakai-blazers', 'https://sakai-blazers-shop.square.site/', 'official'),
('svleague-japao-2026-27:osaka-bluteon', 'https://sv-bluteon.ec.e-get.jp/item/list.html', 'official'),
('svleague-japao-2026-27:shinshu-matsumoto-tridents', 'https://tridents-store.com/', 'official'),
('svleague-japao-2026-27:suntory-sunbirds-osaka', 'https://sports.direct.suntory.co.jp/pages/sunbirds', 'official'),
('svleague-japao-2026-27:tokyo-great-bears', 'https://fan.tokyo-greatbears.com/s/tlb/page/goods', 'official'),
('svleague-japao-2026-27:toray-arrows-shizuoka', 'https://toray-arrows.stores.jp/', 'official'),
('svleague-japao-2026-27:voreas-hokkaido', 'https://voreas-megastore.moala.live/', 'official'),
('svleague-japao-2026-27:wolfdogs-nagoya', 'https://wolfdogs.base.shop/', 'official')
) AS s(id,url,source)
WHERE c.id=s.id;
DO $verify$ DECLARE n integer; BEGIN
 SELECT count(*) INTO n FROM public.catalog_teams WHERE merchandise_url IS NOT NULL;
 IF n <> 44 THEN RAISE EXCEPTION 'Expected 44 verified merchandise destinations, got %',n; END IF;
END $verify$;
NOTIFY pgrst, 'reload schema';