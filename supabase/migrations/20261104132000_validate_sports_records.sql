CREATE OR REPLACE FUNCTION public.validate_sports_record() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,public,auth AS $$
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
DROP TRIGGER IF EXISTS validate_sports_record ON public.sports_records;
CREATE TRIGGER validate_sports_record BEFORE INSERT OR UPDATE ON public.sports_records FOR EACH ROW EXECUTE FUNCTION public.validate_sports_record();
