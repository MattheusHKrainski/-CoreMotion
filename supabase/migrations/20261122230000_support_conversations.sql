-- Private, persistent customer/staff conversations. No email or bot simulation.
CREATE TABLE public.support_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 from_staff boolean NOT NULL,
 content text NOT NULL CHECK(length(trim(content)) BETWEEN 1 AND 4000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_messages_ticket_created ON public.support_messages(ticket_id,created_at,id);
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_messages FROM anon,authenticated;
GRANT SELECT ON public.support_messages TO authenticated;
CREATE POLICY support_messages_read ON public.support_messages FOR SELECT TO authenticated USING (
 NOT public.is_banned_user() AND EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND (t.owner=auth.uid() OR public.is_staff()))
);
CREATE FUNCTION public.send_support_message(p_ticket uuid,p_content text,p_request_id uuid,p_status text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE t public.support_tickets; actor public.profiles; existing public.support_messages; team boolean;
BEGIN
 SELECT * INTO actor FROM public.profiles WHERE id=auth.uid() AND NOT coalesce(is_banned,false);
 IF actor.id IS NULL THEN RAISE EXCEPTION 'Entre em uma conta ativa.' USING ERRCODE='42501'; END IF;
 team:=actor.role IN ('admin','supervisor');
 SELECT * INTO t FROM public.support_tickets WHERE id=p_ticket FOR UPDATE;
 IF t.id IS NULL OR (t.owner<>actor.id AND NOT team) THEN RAISE EXCEPTION 'Solicitação indisponível.' USING ERRCODE='42501'; END IF;
 IF p_status IS NOT NULL AND (NOT team OR p_status NOT IN ('open','reviewing','resolved')) THEN RAISE EXCEPTION 'Situação não permitida.' USING ERRCODE='42501'; END IF;
 IF p_request_id IS NULL OR p_content IS NULL OR length(trim(p_content))>4000 OR (length(trim(p_content))=0 AND (NOT team OR p_status IS NULL)) THEN RAISE EXCEPTION 'Mensagem inválida.'; END IF;
 IF length(trim(p_content))>0 THEN
   SELECT * INTO existing FROM public.support_messages WHERE id=p_request_id;
   IF existing.id IS NOT NULL THEN
     IF existing.ticket_id<>p_ticket OR existing.author_id<>actor.id OR existing.content<>trim(p_content) THEN RAISE EXCEPTION 'Identificador indisponível.'; END IF;
     RETURN;
   END IF;
   INSERT INTO public.support_messages(id,ticket_id,author_id,from_staff,content) VALUES(p_request_id,p_ticket,actor.id,team,trim(p_content));
 END IF;
 UPDATE public.support_tickets SET status=coalesce(p_status,CASE WHEN team THEN 'reviewing' ELSE 'open' END),updated_at=now() WHERE id=p_ticket;
END;
$$;
REVOKE ALL ON FUNCTION public.send_support_message(uuid,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.send_support_message(uuid,text,uuid,text) TO authenticated;
-- Realtime is best effort; focus/online/manual refresh also reload conversations.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
   ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
 END IF;
END $$;
NOTIFY pgrst,'reload schema';
