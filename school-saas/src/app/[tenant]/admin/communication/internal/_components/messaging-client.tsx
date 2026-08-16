'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import ChatSidebar from './chat-sidebar';
import ChatWindow from './chat-window';
import NewDmModal from './new-dm-modal';
import NewGroupModal from './new-group-modal';
import ChatPrivacyModal from './chat-privacy-modal';
import CallModal from './call-modal';
import {
  loadChannelMessages, loadChannelMembers,
  createDirectMessageChannel, createGroupChannel,
  updatePresence, markMessagesDelivered, markChannelRead,
} from './actions';
import type { ChatChannel, ChatMessage, ChatUser } from './actions';

// ── Role-based messaging rules ────────────────────────────────────────────
export const MESSAGING_RULES: Record<string, {
  canDmRoles: string[];
  canCreateGroup: boolean;
  canAddToGroup: string[];
  label: string;
}> = {
  super_admin:  { canDmRoles: ['*'], canCreateGroup: true,  canAddToGroup: ['*'],                                  label: 'Super Admin'  },
  org_admin:    { canDmRoles: ['*'], canCreateGroup: true,  canAddToGroup: ['*'],                                  label: 'Org Admin'    },
  school_admin: { canDmRoles: ['*'], canCreateGroup: true,  canAddToGroup: ['*'],                                  label: 'Admin'        },
  teacher:      { canDmRoles: ['school_admin','teacher','student','parent','org_admin','super_admin'],
                                      canCreateGroup: true,  canAddToGroup: ['teacher','student','parent'],         label: 'Teacher'      },
  student:      { canDmRoles: ['teacher','school_admin'],   canCreateGroup: false, canAddToGroup: [],              label: 'Student'      },
  parent:       { canDmRoles: ['teacher','school_admin'],   canCreateGroup: false, canAddToGroup: [],              label: 'Parent'       },
};

export function canUserDm(myRole: string, targetRole: string): boolean {
  const rule = MESSAGING_RULES[myRole];
  if (!rule) return false;
  if (rule.canDmRoles.includes('*')) return true;
  return rule.canDmRoles.includes(targetRole);
}

export type CallState = {
  channelId: string;
  peerId: string;
  peerName: string;
  peerAvatar: string | null;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing';
};

interface MessagingClientProps {
  tenantSlug: string;
  tenantId: string;
  currentUserId: string;
  currentUser: ChatUser;
  currentUserRole: string;
  initialChannels: ChatChannel[];
  initialUsers: ChatUser[];
  initialStatusMessage: string;
  initialLastSeen: 'everyone' | 'contacts' | 'nobody';
  initialOnline: 'everyone' | 'same_as_last_seen' | 'nobody';
}

export default function MessagingClient({
  tenantSlug,
  tenantId,
  currentUserId,
  currentUser,
  currentUserRole,
  initialChannels,
  initialUsers,
  initialStatusMessage,
  initialLastSeen,
  initialOnline,
}: MessagingClientProps) {
  const [channels, setChannels] = useState<ChatChannel[]>(initialChannels);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState(initialStatusMessage);
  const [lastSeen, setLastSeen] = useState(initialLastSeen);
  const [online, setOnline] = useState(initialOnline);
  const [callState, setCallState] = useState<CallState | null>(null);
  const [dmError, setDmError] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [callingToast, setCallingToast] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const callStateRef = useRef<CallState | null>(null);
  const myRule = MESSAGING_RULES[currentUserRole] || MESSAGING_RULES.student;

  // ── Realtime: active channel messages ─────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId) { setMessages([]); return; }
    setMessagesLoading(true);
    loadChannelMessages(activeChannelId).then(msgs => {
      setMessages(msgs);
      setMessagesLoading(false);
      markMessagesDelivered(activeChannelId);
      markChannelRead(activeChannelId);
    });

    const msgSub = supabase
      .channel(`msgs:${activeChannelId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `channel_id=eq.${activeChannelId}`,
      }, payload => {
        const newMsg = payload.new as ChatMessage;
        if (newMsg.sender_id !== currentUserId) {
          markChannelRead(activeChannelId);
        }
        setMessages(prev => {
          const isDuplicate = prev.some(m => m.id === newMsg.id || (m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id));
          if (isDuplicate) {
            return prev.map(m => m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id ? { ...newMsg, sender: m.sender } : m);
          }
          return [...prev, { ...newMsg, reactions: newMsg.reactions || {}, read_by: newMsg.read_by || [] }];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'chat_messages',
        filter: `channel_id=eq.${activeChannelId}`,
      }, payload => {
        const updated = payload.new as ChatMessage;
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated, sender: m.sender } : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeChannelId]);

  // ── Realtime: channel list ─────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return;
    const channelSub = supabase
      .channel(`chlist:${currentUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_channels', filter: `tenant_id=eq.${tenantId}` }, () => {
        import('./actions').then(({ loadMessagingData }) => {
          loadMessagingData(tenantSlug).then(data => {
            setChannels(prev => data.channels.map(ch => ({ ...ch, participants: prev.find(p => p.id === ch.id)?.participants || ch.participants })));
          });
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_members' }, () => {
        import('./actions').then(({ loadMessagingData }) => {
          loadMessagingData(tenantSlug).then(data => {
            setChannels(prev => data.channels.map(ch => ({ ...ch, participants: prev.find(p => p.id === ch.id)?.participants || ch.participants })));
          });
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channelSub); };
  }, [currentUserId, tenantId, tenantSlug]);

  // Keep callStateRef in sync so the incoming call listener is always current
  // without needing to re-subscribe to the Supabase channel.
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  // ── Realtime: incoming call signals ───────────────────────────────────────
  // Subscribe ONCE (no callState in deps). Use callStateRef inside the handler
  // to read the latest value without triggering re-subscription churn.
  useEffect(() => {
    const callSub = supabase
      .channel(`call-signal:${currentUserId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'call-invite' }, ({ payload }) => {
        if (payload.to === currentUserId && !callStateRef.current) {
          setCallState({
            channelId: payload.channelId,
            peerId: payload.from,
            peerName: payload.fromName,
            peerAvatar: payload.fromAvatar,
            type: payload.callType,
            direction: 'incoming',
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(callSub); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ── Enrich channels with participant profiles ──────────────────────────────
  useEffect(() => {
    const enrichChannels = async () => {
      const enriched = await Promise.all(channels.map(async ch => {
        if (ch.participants && ch.participants.length > 0) return ch;
        try { const members = await loadChannelMembers(ch.id); return { ...ch, participants: members }; } catch { return ch; }
      }));
      setChannels(enriched);
    };
    if (channels.some(ch => !ch.participants)) enrichChannels();
  }, [channels.length]);

  // ── Presence heartbeat ─────────────────────────────────────────────────────
  useEffect(() => {
    updatePresence(true);
    const interval = setInterval(() => { if (document.visibilityState === 'visible') updatePresence(true); }, 30000);
    const onVisibility = () => updatePresence(document.visibilityState === 'visible');
    const onUnload = () => updatePresence(false);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onUnload);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('beforeunload', onUnload); updatePresence(false); };
  }, []);

  // ── Channel selection ──────────────────────────────────────────────────────
  const handleSelectChannel = useCallback((id: string) => {
    setActiveChannelId(id);
    setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, unread_count: 0 } : ch));
  }, []);

  // ── Create DM ──────────────────────────────────────────────────────────────
  const handleStartDm = useCallback(async (user: ChatUser) => {
    if (!canUserDm(currentUserRole, user.role)) {
      setDmError(`As a ${myRule.label}, you cannot send direct messages to ${user.role}s.`);
      return;
    }
    setShowDmModal(false);
    setDmError(null);
    if (!tenantId) { setDmError('Cannot create chat: tenant not found.'); return; }

    const res = await createDirectMessageChannel(tenantId, user.id);
    if (res.success && res.channelId) {
      if (!res.existing) {
        const newCh: ChatChannel = {
          id: res.channelId, tenant_id: tenantId, type: 'direct', name: null,
          avatar_url: null, admin_ids: [currentUserId], only_admins_can_post: false,
          last_message: null, updated_at: new Date().toISOString(), created_at: new Date().toISOString(),
          created_by: currentUserId, unread_count: 0, is_pinned: false, is_muted: false,
          participants: [currentUser, user],
        };
        setChannels(prev => [newCh, ...prev]);
      }
      setActiveChannelId(res.channelId!);
    } else {
      setDmError(res.error || 'Failed to open chat. Please check that the database migration has been run.');
    }
  }, [tenantId, currentUserId, currentUser, currentUserRole, myRule.label]);

  // ── Create Group ───────────────────────────────────────────────────────────
  const handleCreateGroup = useCallback(async (name: string, memberIds: string[], avatarUrl?: string) => {
    if (!myRule.canCreateGroup) {
      setGroupError('Your role does not have permission to create group chats.');
      return;
    }
    if (!tenantId) { setGroupError('Cannot create group: tenant not found.'); return; }

    setShowGroupModal(false);
    setGroupError(null);

    const fd = new FormData();
    fd.append('tenant_id', tenantId);
    fd.append('name', name);
    fd.append('member_ids', JSON.stringify(memberIds));
    if (avatarUrl) fd.append('avatar_url', avatarUrl);

    const res = await createGroupChannel(fd);
    if (res.success && res.channelId) {
      const members = initialUsers.filter(u => memberIds.includes(u.id));
      const newCh: ChatChannel = {
        id: res.channelId, tenant_id: tenantId, type: 'group', name, avatar_url: avatarUrl || null,
        admin_ids: [currentUserId], only_admins_can_post: false, last_message: null,
        updated_at: new Date().toISOString(), created_at: new Date().toISOString(),
        created_by: currentUserId, unread_count: 0, is_pinned: false, is_muted: false,
        participants: [currentUser, ...members],
      };
      setChannels(prev => [newCh, ...prev]);
      setActiveChannelId(res.channelId!);
    } else {
      setGroupError(res.error || 'Failed to create group. Please check that the database migration has been run.');
    }
  }, [tenantId, currentUserId, currentUser, initialUsers, myRule.canCreateGroup]);

  // ── Start a call ───────────────────────────────────────────────────────────
  const handleStartCall = useCallback(async (channelId: string, type: 'voice' | 'video') => {
    if (callStateRef.current) return; // already in a call
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    const peer = channel.participants?.find(p => p.id !== currentUserId);
    if (!peer) return;

    setCallingToast(`📞 Calling ${peer.full_name}...`);

    // Must subscribe to the peer's personal signal channel before sending.
    // Supabase broadcast only delivers to subscribed members, so we subscribe,
    // wait for the SUBSCRIBED status, then send the invite.
    const peerSigCh = supabase.channel(`call-signal:${peer.id}`, {
      config: { broadcast: { self: false } },
    });

    await new Promise<void>((resolve) => {
      peerSigCh.subscribe((status) => {
        if (status === 'SUBSCRIBED') resolve();
      });
      // Fallback timeout
      setTimeout(resolve, 2000);
    });

    await peerSigCh.send({
      type: 'broadcast',
      event: 'call-invite',
      payload: {
        from: currentUserId,
        fromName: currentUser.full_name,
        fromAvatar: currentUser.avatar_url,
        to: peer.id,
        channelId,
        callType: type,
      },
    });

    // Don't remove peerSigCh immediately — the call-end signal may come on it
    // The CallModal manages the dedicated WebRTC signaling channel separately.

    setCallingToast(null);
    setCallState({
      channelId, peerId: peer.id, peerName: peer.full_name,
      peerAvatar: peer.avatar_url, type, direction: 'outgoing',
    });
  }, [channels, currentUserId, currentUser, supabase]);

  const activeChannel = channels.find(c => c.id === activeChannelId) || null;

  // Filter users for DM modal based on role rules
  const dmableUsers = myRule.canDmRoles.includes('*')
    ? initialUsers
    : initialUsers.filter(u => myRule.canDmRoles.includes(u.role));

  // Filter users for group modal based on role rules
  const groupableUsers = myRule.canAddToGroup.includes('*')
    ? initialUsers
    : initialUsers.filter(u => myRule.canAddToGroup.includes(u.role));

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[500px] rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-xl bg-[hsl(var(--bg-primary))] relative">

      {/* Error toasts */}
      {(dmError || groupError) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 max-w-sm animate-fade-in">
          <span className="shrink-0">⚠️</span>
          <span>{dmError || groupError}</span>
          <button onClick={() => { setDmError(null); setGroupError(null); }} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Calling toast */}
      {callingToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 max-w-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          <span>{callingToast}</span>
        </div>
      )}

      {/* DB migration notice when tenantId is empty */}
      {!tenantId && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[hsl(var(--bg-primary)/0.95)] p-6">
          <div className="bg-[hsl(var(--bg-secondary))] border border-amber-500/30 rounded-2xl p-6 max-w-md text-center shadow-xl">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-sm font-black text-[hsl(var(--text-primary))] mb-2">Database Setup Required</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] mb-4">Run the chat tables migration in your Supabase SQL Editor to enable messaging.</p>
            <code className="block bg-[hsl(var(--bg-tertiary))] text-xs p-3 rounded-lg text-left font-mono text-amber-500 mb-3">
              supabase/migrations/026_chat_tables.sql
            </code>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Then enable Realtime on: chat_messages, chat_channels, chat_members</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col ${activeChannelId ? 'hidden md:flex' : 'flex'} h-full`}>
        <ChatSidebar
          channels={channels}
          activeChannelId={activeChannelId}
          currentUserId={currentUserId}
          currentUser={currentUser}
          statusMessage={statusMessage}
          canCreateGroup={myRule.canCreateGroup}
          onSelectChannel={handleSelectChannel}
          onNewDm={() => { setDmError(null); setShowDmModal(true); }}
          onNewGroup={myRule.canCreateGroup ? () => { setGroupError(null); setShowGroupModal(true); } : undefined}
          onOpenPrivacy={() => setShowPrivacyModal(true)}
          onStatusChange={s => setStatusMessage(s)}
        />
      </div>

      {/* Chat window */}
      <div className={`flex-1 flex flex-col min-w-0 h-full ${!activeChannelId ? 'hidden md:flex' : 'flex'}`}>
        {messagesLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[hsl(var(--text-tertiary))]">
              <span className="w-8 h-8 border-2 border-[hsl(var(--accent)/0.3)] border-t-[hsl(var(--accent))] rounded-full animate-spin" />
              <p className="text-xs">Loading messages...</p>
            </div>
          </div>
        ) : (
          <ChatWindow
            channel={activeChannel}
            messages={messages}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onBack={() => setActiveChannelId(null)}
            onMessagesChange={setMessages}
            onStartCall={handleStartCall}
          />
        )}
      </div>

      {/* Modals */}
      {showDmModal && (
        <NewDmModal
          users={dmableUsers}
          currentUserRole={currentUserRole}
          onSelectUser={handleStartDm}
          onClose={() => setShowDmModal(false)}
        />
      )}
      {showGroupModal && myRule.canCreateGroup && (
        <NewGroupModal
          users={groupableUsers}
          onCreate={handleCreateGroup}
          onClose={() => setShowGroupModal(false)}
        />
      )}
      <ChatPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        initialStatus={statusMessage}
        initialLastSeen={lastSeen}
        initialOnline={online}
        onSettingsSaved={s => { setStatusMessage(s.statusMessage); setLastSeen(s.lastSeenVisibility); setOnline(s.onlineVisibility); }}
      />
      {callState && (
        <CallModal
          callState={callState}
          currentUser={currentUser}
          supabase={supabase}
          onClose={() => setCallState(null)}
        />
      )}
    </div>
  );
}
