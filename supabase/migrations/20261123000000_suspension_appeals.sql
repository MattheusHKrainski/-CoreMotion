-- Restricted appeal RPCs never authenticate a suspended profile into the application.
CREATE TABLE public.suspension_appeals (
 owner uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 ticket_id uuid NOT NULL UNIQUE REFERENCES public.support_tickets(id) ON DELETE CASCADE
);
ALTER TABLE public.suspension_appeals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.suspension_appeals FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.suspension_appeal_state() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor public.profiles; t public.support_tickets; result jsonb;
BEGIN
 SELECT * INTO actor FROM public.profiles WHERE id=auth.uid();
 IF actor.id IS NULL THEN RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE='42501'; END IF;
 SELECT st.* INTO t FROM public.support_tickets st JOIN public.suspension_appeals a ON a.ticket_id=st.id WHERE a.owner=actor.id;
 IF NOT coalesce(actor.is_banned,false) AND t.id IS NULL THEN RAISE EXCEPTION 'Nenhuma suspensão disponível.' USING ERRCODE='42501'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(m) ORDER BY m.created_at,m.id),'[]'::jsonb) INTO result FROM (SELECT id,content,from_staff,created_at FROM public.support_messages WHERE ticket_id=t.id ORDER BY created_at DESC,id DESC LIMIT 200) m;
 RETURN jsonb_build_object('suspended',coalesce(actor.is_banned,false),'reason',coalesce(nullif(trim(actor.ban_reason),''),'O motivo não foi informado. Solicite esclarecimentos à moderação.'),'ticket',CASE WHEN t.id IS NULL THEN NULL ELSE jsonb_build_object('id',t.id,'status',t.status,'message',t.message,'response',t.response) END,'messages',result);
END $$;
CREATE FUNCTION public.send_suspension_appeal(p_content text,p_request_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor public.profiles; tid uuid; existing public.support_messages;
BEGIN
 SELECT * INTO actor FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 IF actor.id IS NULL THEN RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE='42501'; END IF;
 SELECT ticket_id INTO tid FROM public.suspension_appeals WHERE owner=actor.id;
 IF NOT coalesce(actor.is_banned,false) AND tid IS NULL THEN RAISE EXCEPTION 'Nenhuma suspensão disponível.' USING ERRCODE='42501'; END IF;
 IF p_content IS NULL OR length(trim(p_content)) NOT BETWEEN 10 AND 4000 OR p_request_id IS NULL THEN RAISE EXCEPTION 'Escreva de 10 a 4.000 caracteres.'; END IF;
 SELECT * INTO existing FROM public.support_messages WHERE id=p_request_id;
 IF existing.id IS NOT NULL THEN
  IF existing.author_id=actor.id AND existing.ticket_id=tid AND existing.content=trim(p_content) THEN RETURN; END IF;
  RAISE EXCEPTION 'Identificador indisponível.';
 END IF;
 IF tid IS NULL THEN
  INSERT INTO public.support_tickets(owner,category,subject,message,reference) VALUES(actor.id,'problem','Revisão de suspensão da conta',trim(p_content),'suspension-appeal') RETURNING id INTO tid;
  INSERT INTO public.suspension_appeals(owner,ticket_id) VALUES(actor.id,tid);
 END IF;
 IF EXISTS(SELECT 1 FROM public.support_messages WHERE ticket_id=tid AND author_id=actor.id AND created_at>now()-interval '15 seconds') THEN RAISE EXCEPTION 'Aguarde alguns segundos antes de enviar outra mensagem.'; END IF;
 INSERT INTO public.support_messages(id,ticket_id,author_id,from_staff,content) VALUES(p_request_id,tid,actor.id,false,trim(p_content));
 UPDATE public.support_tickets SET status='open',updated_at=now() WHERE id=tid;
END $$;
REVOKE ALL ON FUNCTION public.suspension_appeal_state() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.send_suspension_appeal(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.suspension_appeal_state(),public.send_suspension_appeal(text,uuid) TO authenticated;
NOTIFY pgrst,'reload schema';
