-- Only staff deletions of somebody else's content enter this 30-day recovery queue.
CREATE TABLE public.product_moderation_trash (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK(kind IN ('athlete','store')),
 target_id text NOT NULL, owner_id uuid, snapshot jsonb NOT NULL,
 deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 deleted_at timestamptz NOT NULL DEFAULT now(), purge_after timestamptz NOT NULL DEFAULT now()+interval '30 days',
 UNIQUE(kind,target_id)
);
ALTER TABLE public.product_moderation_trash ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_moderation_trash FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.product_moderation_trash TO authenticated;
CREATE POLICY product_trash_staff_read ON public.product_moderation_trash FOR SELECT TO authenticated USING(public.is_staff() AND NOT public.is_banned_user());
CREATE FUNCTION public.archive_moderated_product() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE item_owner uuid; item_kind text;
BEGIN
 IF TG_TABLE_NAME='products' THEN item_owner:=OLD.seller_id;item_kind:='athlete'; ELSE item_owner:=OLD.created_by;item_kind:='store'; END IF;
 -- Cascading account cleanup and the owner's own deletion remain permanent.
 IF pg_trigger_depth()>1 OR auth.uid() IS NULL OR NOT public.is_staff() OR public.is_banned_user() OR item_owner=auth.uid() THEN RETURN OLD; END IF;
 INSERT INTO public.product_moderation_trash(kind,target_id,owner_id,snapshot,deleted_by) VALUES(item_kind,OLD.id::text,item_owner,to_jsonb(OLD),auth.uid());
 INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'product_trash',OLD.id::text,'Produto removido pela equipe; restauração por 30 dias');
 RETURN OLD;
END $$;
REVOKE ALL ON FUNCTION public.archive_moderated_product() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER archive_moderated_product BEFORE DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.archive_moderated_product();
CREATE TRIGGER archive_moderated_offer BEFORE DELETE ON public.external_offers FOR EACH ROW EXECUTE FUNCTION public.archive_moderated_product();
CREATE FUNCTION public.restore_moderated_product(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE item public.product_moderation_trash;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_staff() OR public.is_banned_user() THEN RAISE EXCEPTION 'Acesso restrito à equipe ativa' USING ERRCODE='42501'; END IF;
 SELECT * INTO item FROM public.product_moderation_trash WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR item.purge_after<=now() THEN RAISE EXCEPTION 'Produto indisponível ou prazo de restauração encerrado'; END IF;
 IF item.owner_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=item.owner_id) THEN RAISE EXCEPTION 'A conta responsável não existe mais'; END IF;
 IF item.owner_id IS NOT NULL AND public.is_account_trashed(item.owner_id) THEN RAISE EXCEPTION 'Restaure primeiro a conta responsável'; END IF;
 IF item.kind='athlete' THEN
 INSERT INTO public.products SELECT * FROM jsonb_populate_record(NULL::public.products,item.snapshot);
 ELSE
 INSERT INTO public.external_offers SELECT * FROM jsonb_populate_record(NULL::public.external_offers,item.snapshot);
 END IF;
 DELETE FROM public.product_moderation_trash WHERE id=p_id;
 INSERT INTO public.moderation_audit(actor_id,action,target_id,reason) VALUES(auth.uid(),'product_restore',item.target_id,'Produto restaurado com o estado anterior à exclusão');
END $$;
REVOKE ALL ON FUNCTION public.restore_moderated_product(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.restore_moderated_product(uuid) TO authenticated;
-- Account deletion must not leave recoverable copies of authored products.
CREATE FUNCTION public.cleanup_product_trash_owner() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN DELETE FROM public.product_moderation_trash WHERE owner_id=OLD.id; RETURN OLD; END $$;
REVOKE ALL ON FUNCTION public.cleanup_product_trash_owner() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cleanup_product_trash_owner BEFORE DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.cleanup_product_trash_owner();
SELECT cron.schedule('coremotion-purge-product-trash','27 * * * *',$job$DELETE FROM public.product_moderation_trash WHERE purge_after<=now();$job$);
NOTIFY pgrst,'reload schema';
