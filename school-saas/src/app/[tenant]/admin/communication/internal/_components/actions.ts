'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

export interface ChatChannel {
  id: string;
  tenant_id: string;
  type: 'direct' | 'group';
  name: string | null;
  avatar_url: string | null;
  admin_ids: string[];
  only_admins_can_post: boolean;
  last_message: { content: string; sender_name: string; created_at: string } | null;
  updated_at: string;
  created_at: string;
  created_by: string | null;
  // joined from chat_members for current user
  unread_count?: number;
  is_pinned?: boolean;
  is_muted?: boolean;
  // participants enriched client-side
  participants?: ChatUser[];
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string | null;
  attachment: { type: string; name: string; url: string; size?: number } | null;
  reply_to_id: string | null;
  reply_to_snapshot: { content: string; sender_name: string } | null;
  reactions: Record<string, string[]>;
  is_edited: boolean;
  is_deleted: boolean;
  delivered?: boolean;
  read_by: string[];
  created_at: string;
  // enriched
  sender?: ChatUser;
}

// ── Load initial data ──────────────────────────────────────────────────────

export async function loadMessagingData(tenantSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { channels: [], users: [], currentUserId: null, tenantId: null };

  // Resolve tenant
  const { data: tenant } = await supabase
    .from('tenants').select('id').eq('slug', tenantSlug).single();
  if (!tenant) return { channels: [], users: [], currentUserId: null, tenantId: null };

  // Load channels the user is a member of, with their member metadata
  const { data: memberships } = await supabase
    .from('chat_members')
    .select('channel_id, unread_count, is_pinned, is_muted, role')
    .eq('user_id', user.id);

  const channelIds = (memberships || []).map(m => m.channel_id);

  let channels: ChatChannel[] = [];
  if (channelIds.length > 0) {
    const { data: rawChannels } = await supabase
      .from('chat_channels')
      .select('*')
      .in('id', channelIds)
      .eq('tenant_id', tenant.id)
      .order('updated_at', { ascending: false });

    // Merge membership metadata
    channels = (rawChannels || []).map(ch => {
      const membership = memberships?.find(m => m.channel_id === ch.id);
      return {
        ...ch,
        unread_count: membership?.unread_count || 0,
        is_pinned: membership?.is_pinned || false,
        is_muted: membership?.is_muted || false,
      };
    });
  }

  // Load all users in the tenant for DM creation (including org admins & super admins)
  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .or(`tenant_id.eq.${tenant.id},role.eq.super_admin,role.eq.org_admin`)
    .neq('id', user.id);

  const users: ChatUser[] = (profilesRaw || []).map(p => ({
    id: p.id,
    full_name: p.full_name || 'Unknown User',
    role: p.role,
    avatar_url: p.avatar_url || null,
  }));

  return { channels, users, currentUserId: user.id, tenantId: tenant.id };
}

// ── Load messages for a channel ────────────────────────────────────────────

export async function loadChannelMessages(channelId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('channel_id', channelId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(100);

  if (!messages) return [];

  // Enrich with sender profiles
  const senderIds = [...new Set(messages.map(m => m.sender_id))];
  const { data: senderProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('id', senderIds);

  const profileMap: Record<string, ChatUser> = {};
  (senderProfiles || []).forEach(p => {
    profileMap[p.id] = { id: p.id, full_name: p.full_name || 'User', avatar_url: p.avatar_url, role: p.role };
  });

  return messages.map(m => ({
    ...m,
    reactions: m.reactions || {},
    read_by: m.read_by || [],
    sender: profileMap[m.sender_id],
  }));
}

// ── Load channel members ───────────────────────────────────────────────────

export async function loadChannelMembers(channelId: string): Promise<ChatUser[]> {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from('chat_members')
    .select('user_id')
    .eq('channel_id', channelId);

  if (!members || members.length === 0) return [];

  const userIds = members.map(m => m.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('id', userIds);

  return (profiles || []).map(p => ({
    id: p.id,
    full_name: p.full_name || 'User',
    avatar_url: p.avatar_url || null,
    role: p.role,
  }));
}

// ── Send a message ─────────────────────────────────────────────────────────

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const channelId = formData.get('channel_id') as string;
  const content = formData.get('content') as string;
  const replyToId = formData.get('reply_to_id') as string | null;
  const replyToSnapshotRaw = formData.get('reply_to_snapshot') as string | null;
  const attachmentRaw = formData.get('attachment') as string | null;

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single();

  const messageData: any = {
    channel_id: channelId,
    sender_id: user.id,
    content: content || null,
    is_edited: false,
    is_deleted: false,
    read_by: [],
    delivered: false,
    reactions: {},
  };

  if (replyToId) messageData.reply_to_id = replyToId;
  if (replyToSnapshotRaw) {
    try { messageData.reply_to_snapshot = JSON.parse(replyToSnapshotRaw); } catch {}
  }
  if (attachmentRaw) {
    try { messageData.attachment = JSON.parse(attachmentRaw); } catch {}
  }

  const { error: msgError } = await supabase.from('chat_messages').insert(messageData);
  if (msgError) return { success: false, error: msgError.message };

  // Update channel's last_message + updated_at
  const lastMessagePreview = attachmentRaw
    ? '📎 Attachment'
    : (content || '').substring(0, 120);

  await supabase.from('chat_channels').update({
    last_message: {
      content: lastMessagePreview,
      sender_name: profile?.full_name || 'User',
      created_at: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  }).eq('id', channelId);

  // Increment unread_count for all OTHER members
  const { data: otherMembers } = await supabase
    .from('chat_members')
    .select('id, unread_count')
    .eq('channel_id', channelId)
    .neq('user_id', user.id);

  for (const member of otherMembers || []) {
    await supabase.from('chat_members')
      .update({ unread_count: (member.unread_count || 0) + 1 })
      .eq('id', member.id);
  }

  return { success: true };
}

// ── Create DM channel ──────────────────────────────────────────────────────

export async function createDirectMessageChannel(tenantId: string, targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Check if DM already exists between these two users
  const { data: existingMemberships } = await supabase
    .from('chat_members')
    .select('channel_id')
    .eq('user_id', user.id);

  const myChannelIds = (existingMemberships || []).map(m => m.channel_id);

  if (myChannelIds.length > 0) {
    const { data: existingDms } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('type', 'direct')
      .eq('tenant_id', tenantId)
      .in('id', myChannelIds);

    for (const dm of existingDms || []) {
      const { data: otherMember } = await supabase
        .from('chat_members')
        .select('id')
        .eq('channel_id', dm.id)
        .eq('user_id', targetUserId)
        .maybeSingle();
      if (otherMember) return { success: true, channelId: dm.id, existing: true };
    }
  }

  // Create new DM channel
  const { data: channel, error } = await supabase
    .from('chat_channels')
    .insert({ tenant_id: tenantId, type: 'direct', created_by: user.id })
    .select('id').single();

  if (error || !channel) return { success: false, error: error?.message || 'Failed to create channel' };

  // Add both participants as members
  await supabase.from('chat_members').insert([
    { channel_id: channel.id, user_id: user.id, role: 'admin' },
    { channel_id: channel.id, user_id: targetUserId, role: 'member' },
  ]);

  return { success: true, channelId: channel.id, existing: false };
}

// ── Create Group channel ───────────────────────────────────────────────────

export async function createGroupChannel(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const tenantId = formData.get('tenant_id') as string;
  const name = formData.get('name') as string;
  const avatarUrl = formData.get('avatar_url') as string | null;
  const memberIdsRaw = formData.get('member_ids') as string;
  const memberIds: string[] = JSON.parse(memberIdsRaw || '[]');

  const { data: channel, error } = await supabase
    .from('chat_channels')
    .insert({
      tenant_id: tenantId,
      type: 'group',
      name,
      avatar_url: avatarUrl || null,
      created_by: user.id,
      admin_ids: [user.id],
    })
    .select('id').single();

  if (error || !channel) return { success: false, error: error?.message || 'Failed to create group' };

  // Add creator + all selected members
  const allMemberIds = [...new Set([user.id, ...memberIds])];
  await supabase.from('chat_members').insert(
    allMemberIds.map(uid => ({
      channel_id: channel.id,
      user_id: uid,
      role: uid === user.id ? 'admin' : 'member',
    }))
  );

  return { success: true, channelId: channel.id };
}

// ── Mark channel as read ───────────────────────────────────────────────────

export async function markChannelRead(channelId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('chat_members').update({
    unread_count: 0,
    last_read_at: new Date().toISOString(),
  }).eq('channel_id', channelId).eq('user_id', user.id);

  // Fetch messages in this channel not sent by current user
  const { data: msgs } = await supabase
    .from('chat_messages')
    .select('id, read_by')
    .eq('channel_id', channelId)
    .neq('sender_id', user.id);

  for (const m of msgs || []) {
    const readBy: string[] = m.read_by || [];
    if (!readBy.includes(user.id)) {
      await supabase.from('chat_messages').update({
        read_by: [...readBy, user.id],
        delivered: true,
      }).eq('id', m.id);
    }
  }
}

export async function markMessagesDelivered(channelId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('chat_messages').update({
    delivered: true,
  }).eq('channel_id', channelId).neq('sender_id', user.id).eq('delivered', false);
}

// ── Update message reaction ────────────────────────────────────────────────

export async function toggleReaction(messageId: string, emoji: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { data: msg } = await supabase
    .from('chat_messages').select('reactions').eq('id', messageId).single();

  const reactions: Record<string, string[]> = msg?.reactions || {};
  const currentUsers = reactions[emoji] || [];
  if (currentUsers.includes(user.id)) {
    reactions[emoji] = currentUsers.filter(id => id !== user.id);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  } else {
    reactions[emoji] = [...currentUsers, user.id];
  }

  await supabase.from('chat_messages').update({ reactions }).eq('id', messageId);
  return { success: true };
}

// ── Edit message ───────────────────────────────────────────────────────────

export async function editMessage(messageId: string, newContent: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase.from('chat_messages').update({
    content: newContent,
    is_edited: true,
    edited_at: new Date().toISOString(),
  }).eq('id', messageId).eq('sender_id', user.id);

  return { success: true };
}

// ── Delete message (soft delete) ───────────────────────────────────────────

export async function deleteMessage(messageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase.from('chat_messages').update({
    is_deleted: true,
    content: null,
  }).eq('id', messageId).eq('sender_id', user.id);

  return { success: true };
}

// ── Pin / Unpin channel ────────────────────────────────────────────────────

export async function togglePinChannel(channelId: string, pinned: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('chat_members').update({ is_pinned: pinned })
    .eq('channel_id', channelId).eq('user_id', user.id);
}

// ── Update presence ────────────────────────────────────────────────────────

export async function updatePresence(isOnline: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('chat_presence').upsert({
    user_id: user.id,
    is_online: isOnline,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

// ── Update privacy settings ────────────────────────────────────────────────

export async function updateChatPrivacySettings(settings: {
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  onlineVisibility: 'everyone' | 'same_as_last_seen' | 'nobody';
  statusMessage: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase.from('chat_presence').upsert({
    user_id: user.id,
    last_seen_visibility: settings.lastSeenVisibility,
    online_visibility: settings.onlineVisibility,
    status_message: settings.statusMessage,
  }, { onConflict: 'user_id' });

  return { success: true };
}

// ── Load presence for multiple users ──────────────────────────────────────

export async function loadPresence(userIds: string[]) {
  const supabase = await createClient();
  if (!userIds.length) return {};

  const { data } = await supabase
    .from('chat_presence')
    .select('user_id, is_online, last_seen_at, status_message, last_seen_visibility, online_visibility')
    .in('user_id', userIds);

  const map: Record<string, any> = {};
  (data || []).forEach(p => { map[p.user_id] = p; });
  return map;
}
