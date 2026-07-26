-- ============================================================
-- 026_chat_tables.sql
-- WhatsApp-style Internal Messaging
-- ============================================================

-- 1. Chat Channels (DMs + Groups)
CREATE TABLE IF NOT EXISTS chat_channels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('direct', 'group')),  -- 'direct' or 'group'
  name          TEXT,                      -- null for DMs, required for groups
  description   TEXT,
  avatar_url    TEXT,
  created_by    UUID REFERENCES profiles(id),
  admin_ids     UUID[] DEFAULT '{}',
  only_admins_can_post BOOLEAN DEFAULT FALSE,
  is_archived   BOOLEAN DEFAULT FALSE,
  last_message  JSONB,                     -- { content, sender_name, created_at }
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chat Members (channel ↔ user junction)
CREATE TABLE IF NOT EXISTS chat_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  unread_count    INTEGER DEFAULT 0,
  is_pinned       BOOLEAN DEFAULT FALSE,
  is_muted        BOOLEAN DEFAULT FALSE,
  last_read_at    TIMESTAMPTZ DEFAULT NOW(),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- 3. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id    UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT,
  attachment    JSONB,                     -- { type, name, url, size }
  reply_to_id   UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  reply_to_snapshot JSONB,                 -- snapshot of replied message { content, sender_name }
  reactions     JSONB DEFAULT '{}',        -- { "👍": ["user_id1", ...], ... }
  is_edited     BOOLEAN DEFAULT FALSE,
  edited_at     TIMESTAMPTZ,
  is_deleted    BOOLEAN DEFAULT FALSE,
  delivered     BOOLEAN DEFAULT FALSE,
  delivered_at  TIMESTAMPTZ,
  read_by       UUID[] DEFAULT '{}',       -- array of user_ids who have read it
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Chat Presence / Status
CREATE TABLE IF NOT EXISTS chat_presence (
  user_id           UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online         BOOLEAN DEFAULT FALSE,
  last_seen_at      TIMESTAMPTZ DEFAULT NOW(),
  status_message    TEXT DEFAULT 'Available 👋',
  last_seen_visibility  TEXT DEFAULT 'everyone' CHECK (last_seen_visibility IN ('everyone', 'contacts', 'nobody')),
  online_visibility     TEXT DEFAULT 'everyone' CHECK (online_visibility IN ('everyone', 'same_as_last_seen', 'nobody'))
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_channels_tenant ON chat_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_channel ON chat_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(channel_id, created_at ASC);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;

-- Helper function to prevent RLS recursion on chat_members
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

-- Users can see channels they created or are members of
CREATE POLICY "chat_channels_select" ON chat_channels
  FOR SELECT USING (
    created_by = auth.uid()
    OR id IN (SELECT public.get_user_chat_channel_ids())
    OR public.is_super_admin()
  );

CREATE POLICY "chat_channels_insert" ON chat_channels
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    OR tenant_id = public.get_user_tenant_id()
    OR public.is_super_admin()
  );

CREATE POLICY "chat_channels_update" ON chat_channels
  FOR UPDATE USING (
    created_by = auth.uid()
    OR auth.uid() = ANY(admin_ids)
    OR id IN (SELECT public.get_user_chat_channel_ids())
    OR public.is_super_admin()
  );

CREATE POLICY "chat_members_select" ON chat_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR channel_id IN (SELECT public.get_user_chat_channel_ids())
  );

CREATE POLICY "chat_members_insert" ON chat_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "chat_members_update" ON chat_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    channel_id IN (SELECT public.get_user_chat_channel_ids())
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND channel_id IN (SELECT public.get_user_chat_channel_ids())
  );

CREATE POLICY "chat_messages_update" ON chat_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    OR channel_id IN (
      SELECT channel_id FROM chat_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "chat_presence_select" ON chat_presence
  FOR SELECT USING (true);

CREATE POLICY "chat_presence_upsert" ON chat_presence
  FOR ALL USING (user_id = auth.uid());

-- ── Supabase Realtime ─────────────────────────────────────────
-- Run in Supabase Dashboard → Database → Replication
-- OR via: ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_channels;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_members;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_presence;

-- ── Updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_chat_channel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chat_channels_updated_at
  BEFORE UPDATE ON chat_channels
  FOR EACH ROW EXECUTE FUNCTION update_chat_channel_updated_at();
