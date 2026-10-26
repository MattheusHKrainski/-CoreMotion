-- Public registration categories are independent of privileged application roles.
CREATE TABLE public.sports_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('athlete','coach','trial','application','invite')),
 data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object' AND octet_length(data::text) < 30000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX sports_one_profile ON public.sports_records(owner,kind) WHERE kind IN ('athlete','coach');
CREATE UNIQUE INDEX sports_one_response ON public.sports_records(owner,kind,(data->>'target')) WHERE kind IN ('application','invite');
CREATE INDEX sports_kind_idx ON public.sports_records(kind);
CREATE FUNCTION public.sports_member() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT coalesce(is_banned,false))
 AND (EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin') OR auth.jwt()->'user_metadata'->>'account_type' IN ('athlete','coach'));
$$;
CREATE FUNCTION public.sports_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin' AND NOT coalesce(is_banned,false));
$$;
ALTER TABLE public.sports_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sports_records TO authenticated;
CREATE POLICY sports_read ON public.sports_records FOR SELECT TO authenticated USING (
 (kind='coach' AND EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND NOT coalesce(is_banned,false))) OR
 public.sports_member() AND (kind IN ('athlete','coach','trial') OR owner=auth.uid() OR data->>'recipient'=auth.uid()::text OR public.sports_admin())
);
CREATE POLICY sports_insert ON public.sports_records FOR INSERT TO authenticated WITH CHECK (
 public.sports_member() AND owner=auth.uid() AND (
 public.sports_admin() OR
 (kind IN ('athlete','application') AND auth.jwt()->'user_metadata'->>'account_type'='athlete') OR
 (kind IN ('coach','trial','invite') AND auth.jwt()->'user_metadata'->>'account_type'='coach'))
);
CREATE POLICY sports_update ON public.sports_records FOR UPDATE TO authenticated USING (
 public.sports_member() AND (owner=auth.uid() OR public.sports_admin() OR (kind IN ('application','invite') AND data->>'recipient'=auth.uid()::text))
) WITH CHECK (public.sports_member() AND (owner=auth.uid() OR public.sports_admin() OR data->>'recipient'=auth.uid()::text));
CREATE POLICY sports_delete ON public.sports_records FOR DELETE TO authenticated USING (public.sports_member() AND (owner=auth.uid() OR public.sports_admin()));
CREATE FUNCTION public.validate_sports_record() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE target_record public.sports_records; athlete_record public.sports_records;
BEGIN
 IF TG_OP='UPDATE' THEN
   IF NEW.id<>OLD.id OR NEW.owner<>OLD.owner OR NEW.kind<>OLD.kind THEN RAISE EXCEPTION 'Identidade imutável'; END IF;
   IF OLD.kind IN ('invite','application') THEN
     IF (NEW.data-'status') IS DISTINCT FROM (OLD.data-'status') THEN RAISE EXCEPTION 'Apenas a resposta pode ser alterada'; END IF;
     IF NOT public.sports_admin() AND OLD.data->>'recipient'<>auth.uid()::text THEN RAISE EXCEPTION 'Somente destinatário pode responder'; END IF;
     IF NEW.data->>'status' NOT IN ('Aceito','Recusado') THEN RAISE EXCEPTION 'Resposta inválida'; END IF;
   END IF;
 END IF;
 IF NEW.kind IN ('athlete','coach','trial') THEN
   IF coalesce(length(trim(NEW.data->>'name')),0)<2 OR coalesce(length(trim(NEW.data->>'sport')),0)<2 OR coalesce(length(trim(NEW.data->>'city')),0)<2 THEN RAISE EXCEPTION 'Nome, esporte e cidade obrigatórios'; END IF;
 END IF;
 IF NEW.kind='athlete' THEN
   IF NOT NEW.data ?& ARRAY['age','height','weight','experience'] THEN RAISE EXCEPTION 'Complete o currículo'; END IF;
   IF (NEW.data->>'age')::int NOT BETWEEN 1 AND 120 OR (NEW.data->>'height')::numeric NOT BETWEEN 30 AND 260 OR (NEW.data->>'weight')::numeric NOT BETWEEN 1 AND 400 OR (NEW.data->>'experience')::numeric<0 THEN RAISE EXCEPTION 'Estatísticas inválidas'; END IF;
 END IF;
 IF NEW.kind='trial' THEN
   IF NOT NEW.data ?& ARRAY['team','address','date','time','minAge','maxAge','category','requirements','deadline','trainingDays','trainingTime','trainingLocation','contact'] THEN RAISE EXCEPTION 'Complete os dados e a rotina de treinos'; END IF;
   IF (NEW.data->>'minAge')::int<0 OR (NEW.data->>'maxAge')::int>120 OR (NEW.data->>'minAge')::int>(NEW.data->>'maxAge')::int OR (NEW.data->>'deadline')::date>(NEW.data->>'date')::date THEN RAISE EXCEPTION 'Datas ou idades inválidas'; END IF;
 END IF;
 IF NEW.kind IN ('application','invite') AND TG_OP='INSERT' THEN
   SELECT * INTO target_record FROM public.sports_records WHERE id=(NEW.data->>'target')::uuid;
   IF target_record.id IS NULL OR target_record.owner::text IS DISTINCT FROM NEW.data->>'recipient' OR target_record.owner=NEW.owner THEN RAISE EXCEPTION 'Destinatário inválido'; END IF;
   IF NEW.kind='application' THEN
     SELECT * INTO athlete_record FROM public.sports_records WHERE owner=NEW.owner AND kind='athlete';
     IF target_record.kind<>'trial' OR athlete_record.id IS NULL OR (target_record.data->>'deadline')::date<current_date OR (athlete_record.data->>'age')::int NOT BETWEEN (target_record.data->>'minAge')::int AND (target_record.data->>'maxAge')::int THEN RAISE EXCEPTION 'Inscrição não permitida'; END IF;
   ELSIF target_record.kind<>'athlete' OR coalesce(length(trim(NEW.data->>'message')),0)<3 THEN RAISE EXCEPTION 'Convocação inválida';
   END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_sports_record BEFORE INSERT OR UPDATE ON public.sports_records FOR EACH ROW EXECUTE FUNCTION public.validate_sports_record();
