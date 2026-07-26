'use client';

import { useState, useMemo } from 'react';
import {
  Search, Plus, Users, MessageSquare, CheckCheck, Check, Pin,
  Star, X, Circle, Clock, ChevronDown, Pencil, Settings2
} from 'lucide-react';
import type { ChatChannel, ChatUser } from './actions';

type FilterTab = 'all' | 'unread' | 'groups' | 'starred';

const STATUS_PRESETS = [
  'Available 👋', 'In class 📚', 'Teaching 👨‍🏫', 'Exam Mode ✏️',
  'Studying 📖', 'Out of office ✈️', 'Focus Mode 🤫', 'In a meeting 📅',
];

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

interface ChatSidebarProps {
  channels: ChatChannel[];
  activeChannelId: string | null;
  currentUserId: string;
  currentUser: ChatUser;
  statusMessage: string;
  canCreateGroup?: boolean;
  onSelectChannel: (id: string) => void;
  onNewDm: () => void;
  onNewGroup?: () => void;
  onOpenPrivacy: () => void;
  onStatusChange: (msg: string) => void;
}

export default function ChatSidebar({
  channels,
  activeChannelId,
  currentUserId,
  currentUser,
  statusMessage,
  canCreateGroup = true,
  onSelectChannel,
  onNewDm,
  onNewGroup,
  onOpenPrivacy,
  onStatusChange,
}: ChatSidebarProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [customStatus, setCustomStatus] = useState(statusMessage);
  const [statusDraft, setStatusDraft] = useState('');

  const filtered = useMemo(() => {
    let list = channels;
    if (activeFilter === 'unread') list = list.filter(c => (c.unread_count || 0) > 0);
    if (activeFilter === 'groups') list = list.filter(c => c.type === 'group');
    if (activeFilter === 'starred') list = list.filter(c => c.is_pinned);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => {
        const name = c.type === 'group'
          ? (c.name || '').toLowerCase()
          : (c.participants?.find(p => p.id !== currentUserId)?.full_name || '').toLowerCase();
        return name.includes(q);
      });
    }
    // Sort: pinned first, then by updated_at
    return [...list].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [channels, activeFilter, search, currentUserId]);

  function getChannelDisplayName(ch: ChatChannel): string {
    if (ch.type === 'group') return ch.name || 'Group Chat';
    const other = ch.participants?.find(p => p.id !== currentUserId);
    return other?.full_name || 'Direct Message';
  }

  function getChannelAvatar(ch: ChatChannel): { image: string | null; initials: string; color: string } {
    if (ch.type === 'group') {
      return { image: ch.avatar_url || null, initials: (ch.name || 'G').charAt(0).toUpperCase(), color: 'bg-blue-600' };
    }
    const other = ch.participants?.find(p => p.id !== currentUserId);
    const colors = ['bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-fuchsia-600'];
    const colorIndex = (other?.id.charCodeAt(0) || 0) % colors.length;
    return { image: other?.avatar_url || null, initials: getInitials(other?.full_name || 'U'), color: colors[colorIndex] };
  }

  const totalUnread = channels.reduce((acc, ch) => acc + (ch.unread_count || 0), 0);

  return (
    <div className="w-full h-full flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] select-none min-w-0">

      {/* Header */}
      <div className="px-4 pt-4 pb-2 bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-3">
          {/* Current user avatar + status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                {currentUser.avatar_url
                  ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  : getInitials(currentUser.full_name)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[hsl(var(--bg-tertiary))] rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate leading-tight">{currentUser.full_name}</p>
              <button
                onClick={() => setShowStatusMenu(v => !v)}
                className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold hover:text-emerald-400 transition-colors truncate max-w-full"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                <span className="truncate">{customStatus}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onNewDm}
              title="New Direct Message"
              className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--bg-primary))] flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {canCreateGroup !== false && onNewGroup && (
              <button
                onClick={onNewGroup}
                title="New Group"
                className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--bg-primary))] flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] transition-colors"
              >
                <Users className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenPrivacy}
              title="Privacy & Settings"
              className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--bg-primary))] flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] transition-colors"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status quick-select dropdown */}
        {showStatusMenu && (
          <div className="absolute left-4 right-4 top-[88px] bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-40 overflow-hidden animate-fade-in">
            <div className="p-2 border-b border-[hsl(var(--border))]">
              <input
                value={statusDraft}
                onChange={e => setStatusDraft(e.target.value)}
                placeholder="Custom status..."
                className="w-full h-8 px-3 text-xs rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && statusDraft.trim()) {
                    const s = statusDraft.trim();
                    setCustomStatus(s);
                    onStatusChange(s);
                    setStatusDraft('');
                    setShowStatusMenu(false);
                  }
                }}
              />
            </div>
            {STATUS_PRESETS.map(p => (
              <button key={p} onClick={() => { setCustomStatus(p); onStatusChange(p); setShowStatusMenu(false); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] transition-colors flex items-center gap-2">
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-9 pl-8 pr-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
        {(['all', 'unread', 'groups', 'starred'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeFilter === tab
                ? 'bg-[hsl(var(--accent))] text-white'
                : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            {tab === 'all' && totalUnread > 0 ? `All (${totalUnread})` : tab}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border)/0.4)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-[hsl(var(--text-tertiary))]">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-xs">
              {search ? 'No conversations found' : activeFilter === 'unread' ? 'No unread messages' : 'No conversations yet'}
            </p>
            {!search && activeFilter === 'all' && (
              <button onClick={onNewDm}
                className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--accent))] hover:opacity-80 transition-opacity">
                <Plus className="w-4 h-4" /> Start a conversation
              </button>
            )}
          </div>
        ) : (
          filtered.map(ch => {
            const { image, initials, color } = getChannelAvatar(ch);
            const displayName = getChannelDisplayName(ch);
            const isActive = ch.id === activeChannelId;
            const unread = ch.unread_count || 0;
            const lastMsg = ch.last_message;

            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`w-full px-3 py-3 flex gap-3 items-start text-left transition-colors hover:bg-[hsl(var(--bg-tertiary))] ${
                  isActive ? 'bg-[hsl(var(--accent)/0.08)] border-l-2 border-[hsl(var(--accent))]' : 'border-l-2 border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full ${color} text-white flex items-center justify-center font-bold text-sm overflow-hidden`}>
                    {image ? <img src={image} alt={displayName} className="w-full h-full object-cover" /> : initials}
                  </div>
                  {ch.type === 'group' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className={`text-xs font-bold truncate ${unread > 0 ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-secondary))]'}`}>
                      {displayName}
                      {ch.is_pinned && <Pin className="w-2.5 h-2.5 inline ml-1 text-[hsl(var(--accent))] opacity-70" />}
                    </span>
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] shrink-0">
                      {formatTime(lastMsg?.created_at || ch.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-[11px] truncate ${unread > 0 ? 'text-[hsl(var(--text-primary))] font-semibold' : 'text-[hsl(var(--text-tertiary))]'}`}>
                      {lastMsg ? (
                        <>
                          {lastMsg.sender_name === currentUser.full_name ? 'You: ' : ''}
                          {lastMsg.content}
                        </>
                      ) : (
                        <span className="opacity-50 italic">Start the conversation...</span>
                      )}
                    </p>
                    {unread > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-[hsl(var(--accent))] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer new chat button (mobile) */}
      <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="flex gap-2">
          <button onClick={onNewDm}
            className="flex-1 h-9 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Message
          </button>
          {canCreateGroup !== false && onNewGroup && (
            <button onClick={onNewGroup}
              className="flex-1 h-9 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
              <Users className="w-4 h-4" /> New Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
