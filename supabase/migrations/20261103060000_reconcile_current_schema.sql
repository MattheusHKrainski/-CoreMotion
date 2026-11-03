-- Reconcile the live project with the current CoreMotion schema.
-- Idempotent by design: production already received these changes through MCP.
BEGIN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS contact_phone text;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='profiles_account_type_check') THEN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_type_check CHECK(account_type IS NULL OR account_type IN ('athlete','coach','casual'));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='products_contact_format') THEN
  ALTER TABLE public.products ADD CONSTRAINT products_contact_format CHECK(contact_phone IS NULL OR contact_phone ~ '^[0-9]{10,15}$');
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.external_offers (
 id text PRIMARY KEY,title text NOT NULL CHECK(char_length(btrim(title))>=3),description text NOT NULL DEFAULT '',
 store_name text NOT NULL CHECK(char_length(btrim(store_name))>=2),category text NOT NULL DEFAULT 'Equipamentos',
 sport text NOT NULL DEFAULT 'Corrida',price numeric(12,2) NOT NULL CHECK(price>0),original_price numeric(12,2),
 image_url text NOT NULL,source_url text NOT NULL,coupon_code text,is_active boolean NOT NULL DEFAULT true,
 created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_external_offers_active_created ON public.external_offers(is_active,created_at DESC);
CREATE TABLE IF NOT EXISTS public.sports_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('athlete','coach','trial','application','invite')),
 data jsonb NOT NULL CHECK(jsonb_typeof(data)='object' AND octet_length(data::text)<30000),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS sports_one_profile ON public.sports_records(owner,kind) WHERE kind IN ('athlete','coach');
CREATE UNIQUE INDEX IF NOT EXISTS sports_one_response ON public.sports_records(owner,kind,(data->>'target')) WHERE kind IN ('application','invite');
CREATE INDEX IF NOT EXISTS sports_kind_idx ON public.sports_records(kind);
CREATE TABLE IF NOT EXISTS public.community_likes (
 post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,PRIMARY KEY(post_id,user_id)
);
COMMIT;
