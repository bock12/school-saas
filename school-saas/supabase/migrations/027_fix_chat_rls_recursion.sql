-- ============================================================
-- 027_fix_chat_rls_recursion.sql
-- Fix infinite recursion in chat_members / chat_channels RLS
-- ============================================================

-- Helper function with row_security = off to safely query member channel IDs without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_chat_channel_ids()
RETURNS SETOF UUID
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN QUERY
    SELECT channel_id FROM public.chat_members
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Drop existing policies
DROP POLICY IF EXISTS "chat_channels_select" ON public.chat_channels;
DROP POLICY IF EXISTS "chat_channels_insert" ON public.chat_channels;
DROP POLICY IF EXISTS "chat_channels_update" ON public.chat_channels;
DROP POLICY IF EXISTS "chat_members_select" ON public.chat_members;
DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;

-- Non-recursive replacement policies using security definer helper
CREATE POLICY "chat_channels_select" ON public.chat_channels
  FOR SELECT USING (
    created_by = auth.uid()
    OR id IN (SELECT public.get_user_chat_channel_ids())
    OR public.is_super_admin()
  );

CREATE POLICY "chat_channels_insert" ON public.chat_channels
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    OR tenant_id = public.get_user_tenant_id()
    OR public.is_super_admin()
  );

CREATE POLICY "chat_channels_update" ON public.chat_channels
  FOR UPDATE USING (
    created_by = auth.uid()
    OR auth.uid() = ANY(admin_ids)
    OR id IN (SELECT public.get_user_chat_channel_ids())
    OR public.is_super_admin()
  );

CREATE POLICY "chat_members_select" ON public.chat_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR channel_id IN (SELECT public.get_user_chat_channel_ids())
  );

CREATE POLICY "chat_messages_select" ON public.chat_messages
  FOR SELECT USING (
    channel_id IN (SELECT public.get_user_chat_channel_ids())
  );

CREATE POLICY "chat_messages_insert" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND channel_id IN (SELECT public.get_user_chat_channel_ids())
  );

DROP POLICY IF EXISTS "chat_messages_update" ON public.chat_messages;

CREATE POLICY "chat_messages_update" ON public.chat_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    OR channel_id IN (SELECT public.get_user_chat_channel_ids())
  );
