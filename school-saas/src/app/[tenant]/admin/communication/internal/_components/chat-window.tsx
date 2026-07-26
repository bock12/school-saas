'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, ArrowLeft, Phone, Video, MoreVertical, Search, Paperclip,
  Smile, X, Reply, Edit2, Trash2, CheckCheck, Check, Download,
  FileText, Image as ImageIcon, ChevronDown, Pin, Users, Info
} from 'lucide-react';
import type { ChatChannel, ChatMessage, ChatUser } from './actions';
import { sendMessage, editMessage, deleteMessage, toggleReaction, markChannelRead } from './actions';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✅', '👏', '🎉'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

const AVATAR_COLORS = ['bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-fuchsia-600'];
function avatarColor(id: string) {
  return AVATAR_COLORS[(id.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

interface ChatWindowProps {
  channel: ChatChannel | null;
  messages: ChatMessage[];
  currentUserId: string;
  currentUser: ChatUser;
  onBack: () => void;
  onMessagesChange: (msgs: ChatMessage[]) => void;
  onStartCall?: (channelId: string, type: 'voice' | 'video') => void;
}

export default function ChatWindow({
  channel,
  messages,
  currentUserId,
  currentUser,
  onBack,
  onMessagesChange,
  onStartCall,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiBar, setShowEmojiBar] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number } | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark channel as read when opened
  useEffect(() => {
    if (channel?.id) markChannelRead(channel.id);
  }, [channel?.id]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !editingMsg) || !channel) return;
    setIsSending(true);

    if (editingMsg) {
      await editMessage(editingMsg.id, editContent.trim());
      onMessagesChange(messages.map(m => m.id === editingMsg.id
        ? { ...m, content: editContent.trim(), is_edited: true }
        : m
      ));
      setEditingMsg(null);
      setEditContent('');
      setIsSending(false);
      return;
    }

    const fd = new FormData();
    fd.append('channel_id', channel.id);
    fd.append('content', input.trim());
    if (replyTo) {
      fd.append('reply_to_id', replyTo.id);
      fd.append('reply_to_snapshot', JSON.stringify({
        content: replyTo.content || '📎 Attachment',
        sender_name: replyTo.sender?.full_name || 'Unknown',
      }));
    }

    // Optimistic update
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      channel_id: channel.id,
      sender_id: currentUserId,
      content: input.trim(),
      attachment: null,
      reply_to_id: replyTo?.id || null,
      reply_to_snapshot: replyTo ? {
        content: replyTo.content || '📎 Attachment',
        sender_name: replyTo.sender?.full_name || 'Unknown',
      } : null,
      reactions: {},
      is_edited: false,
      is_deleted: false,
      read_by: [],
      created_at: new Date().toISOString(),
      sender: currentUser,
    };
    onMessagesChange([...messages, optimistic]);
    setInput('');
    setReplyTo(null);

    await sendMessage(fd);
    setIsSending(false);
  }, [input, channel, replyTo, editingMsg, editContent, currentUserId, currentUser, messages, onMessagesChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setReplyTo(null);
      setEditingMsg(null);
    }
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    setShowEmojiBar(null);
    await toggleReaction(msgId, emoji);
    onMessagesChange(messages.map(m => {
      if (m.id !== msgId) return m;
      const reactions = { ...m.reactions };
      const users = reactions[emoji] || [];
      if (users.includes(currentUserId)) {
        reactions[emoji] = users.filter(id => id !== currentUserId);
        if (!reactions[emoji].length) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, currentUserId];
      }
      return { ...m, reactions };
    }));
  };

  const handleDelete = async (msg: ChatMessage) => {
    setContextMenu(null);
    await deleteMessage(msg.id);
    onMessagesChange(messages.map(m => m.id === msg.id ? { ...m, is_deleted: true, content: null } : m));
  };

  const handleFileUpload = async (file: File) => {
    if (!channel) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const fd = new FormData();
      fd.append('channel_id', channel.id);
      fd.append('content', '');
      fd.append('attachment', JSON.stringify({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        url: dataUrl,
        size: file.size,
      }));
      if (replyTo) {
        fd.append('reply_to_id', replyTo.id);
        fd.append('reply_to_snapshot', JSON.stringify({
          content: replyTo.content || '📎 Attachment',
          sender_name: replyTo.sender?.full_name || 'Unknown',
        }));
      }
      const optimistic: ChatMessage = {
        id: `temp-${Date.now()}`,
        channel_id: channel.id,
        sender_id: currentUserId,
        content: null,
        attachment: { type: file.type.startsWith('image/') ? 'image' : 'file', name: file.name, url: dataUrl },
        reply_to_id: replyTo?.id || null,
        reply_to_snapshot: null,
        reactions: {},
        is_edited: false,
        is_deleted: false,
        read_by: [],
        created_at: new Date().toISOString(),
        sender: currentUser,
      };
      setReplyTo(null);
      onMessagesChange([...messages, optimistic]);
      await sendMessage(fd);
    };
    reader.readAsDataURL(file);
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const otherParticipant = channel?.type === 'direct'
    ? channel.participants?.find(p => p.id !== currentUserId)
    : null;
  const channelName = channel?.type === 'group'
    ? (channel.name || 'Group Chat')
    : (otherParticipant?.full_name || 'Direct Message');

  if (!channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-tertiary))] gap-4">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--bg-tertiary))] flex items-center justify-center">
          <MessageSquareIcon className="w-10 h-10 opacity-30" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-[hsl(var(--text-secondary))]">Select a conversation</p>
          <p className="text-xs mt-1 opacity-60">Choose from the list or start a new message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[hsl(var(--bg-primary))]" onClick={() => { setContextMenu(null); setShowEmojiBar(null); }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] shrink-0">
        <button onClick={onBack} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          {channel.type === 'group' ? (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
              {channel.avatar_url
                ? <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" />
                : <Users className="w-5 h-5" />}
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full ${avatarColor(otherParticipant?.id || '')} text-white flex items-center justify-center font-bold text-sm overflow-hidden`}>
              {otherParticipant?.avatar_url
                ? <img src={otherParticipant.avatar_url} alt="" className="w-full h-full object-cover" />
                : getInitials(otherParticipant?.full_name || 'U')}
            </div>
          )}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{channelName}</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">
            {channel.type === 'group'
              ? `${channel.participants?.length || 0} members`
              : <span className="text-emerald-500 font-medium">Online</span>}
          </p>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1 shrink-0">
          {channel.type === 'direct' && onStartCall && (
            <>
              <button
                onClick={() => onStartCall(channel.id, 'voice')}
                title="Voice Call"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-emerald-500 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartCall(channel.id, 'video')}
                title="Video Call"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-blue-500 transition-colors"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={() => setSearchMode(v => !v)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${searchMode ? 'bg-[hsl(var(--accent))] text-white' : 'hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}>
            <Search className="w-4 h-4" />
          </button>
          {channel.type === 'group' && (
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] transition-colors">
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {searchMode && (
        <div className="px-4 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in conversation..."
              className="w-full h-9 pl-8 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-[hsl(var(--bg-primary))]"
        style={{ backgroundImage: 'radial-gradient(hsl(var(--accent)/0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

        {filteredMessages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUserId;
          const prevMsg = filteredMessages[idx - 1];
          const showDate = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);
          const showAvatar = !isMe && (idx === 0 || filteredMessages[idx - 1]?.sender_id !== msg.sender_id);
          const reactions = msg.reactions || {};

          return (
            <div key={msg.id}>
              {/* Date divider */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--bg-tertiary))] text-[10px] font-semibold text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border))]">
                    {formatDateDivider(msg.created_at)}
                  </span>
                </div>
              )}

              {/* Message bubble */}
              <div className={`flex items-end gap-2 mb-0.5 group ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar for others */}
                {!isMe && (
                  <div className="shrink-0 mb-1">
                    {showAvatar ? (
                      <div className={`w-7 h-7 rounded-full ${avatarColor(msg.sender_id)} text-white flex items-center justify-center text-[10px] font-bold overflow-hidden`}>
                        {msg.sender?.avatar_url
                          ? <img src={msg.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                          : getInitials(msg.sender?.full_name || 'U')}
                      </div>
                    ) : <div className="w-7" />}
                  </div>
                )}

                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender name (group only) */}
                  {!isMe && channel.type === 'group' && showAvatar && (
                    <span className="text-[10px] font-bold text-[hsl(var(--accent))] mb-1 ml-1">
                      {msg.sender?.full_name}
                    </span>
                  )}

                  {/* Reply preview */}
                  {msg.reply_to_snapshot && (
                    <div className={`px-3 py-1.5 rounded-t-xl mb-0.5 border-l-2 border-[hsl(var(--accent))] bg-[hsl(var(--bg-tertiary))] text-xs max-w-full ${isMe ? 'items-end' : ''}`}>
                      <p className="text-[10px] font-bold text-[hsl(var(--accent))] truncate">{msg.reply_to_snapshot.sender_name}</p>
                      <p className="text-[hsl(var(--text-secondary))] truncate">{msg.reply_to_snapshot.content}</p>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed cursor-pointer transition-all
                      ${isMe
                        ? 'bg-[hsl(var(--accent))] text-white rounded-br-sm'
                        : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-bl-sm'
                      }
                      ${msg.is_deleted ? 'opacity-50 italic' : ''}
                    `}
                    onContextMenu={e => {
                      if (msg.is_deleted) return;
                      e.preventDefault();
                      setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY });
                    }}
                  >
                    {msg.is_deleted ? (
                      <span className="text-xs opacity-60">🚫 This message was deleted</span>
                    ) : msg.attachment ? (
                      msg.attachment.type === 'image' ? (
                        <div className="space-y-1">
                          <img src={msg.attachment.url} alt={msg.attachment.name}
                            className="max-w-[200px] rounded-xl object-cover" />
                          <p className="text-[10px] opacity-70">{msg.attachment.name}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="w-8 h-8 opacity-70 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold truncate max-w-[150px]">{msg.attachment.name}</p>
                            <a href={msg.attachment.url} download={msg.attachment.name}
                              className="text-[10px] underline opacity-70 flex items-center gap-0.5">
                              <Download className="w-2.5 h-2.5" /> Download
                            </a>
                          </div>
                        </div>
                      )
                    ) : (
                      <span>{msg.content}</span>
                    )}

                    {/* Edited indicator */}
                    {msg.is_edited && !msg.is_deleted && (
                      <span className="text-[9px] opacity-50 ml-1">(edited)</span>
                    )}

                    {/* Hover actions */}
                    {!msg.is_deleted && (
                      <div className={`absolute top-0 ${isMe ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                        <button onClick={e => { e.stopPropagation(); setShowEmojiBar(showEmojiBar === msg.id ? null : msg.id); }}
                          className="w-6 h-6 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">
                          <Smile className="w-3 h-3" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setReplyTo(msg); inputRef.current?.focus(); }}
                          className="w-6 h-6 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">
                          <Reply className="w-3 h-3" />
                        </button>
                        {isMe && (
                          <button onClick={e => { e.stopPropagation(); setEditingMsg(msg); setEditContent(msg.content || ''); inputRef.current?.focus(); }}
                            className="w-6 h-6 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Emoji bar */}
                  {showEmojiBar === msg.id && (
                    <div className="flex gap-1 mt-1 p-1.5 bg-[hsl(var(--bg-secondary))] rounded-xl border border-[hsl(var(--border))] shadow-lg animate-fade-in">
                      {EMOJI_LIST.map(emoji => (
                        <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-base transition-transform hover:scale-125">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {Object.keys(reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(reactions).map(([emoji, users]) => (
                        <button key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                            (users as string[]).includes(currentUserId)
                              ? 'bg-[hsl(var(--accent)/0.15)] border-[hsl(var(--accent)/0.4)] text-[hsl(var(--accent))]'
                              : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
                          }`}>
                          {emoji} <span>{(users as string[]).length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp + delivery status */}
                  <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))]">{formatTimestamp(msg.created_at)}</span>
                    {isMe && !msg.is_deleted && (() => {
                      const isSeen = (msg.read_by || []).some(id => id !== currentUserId);
                      const isDelivered = msg.delivered || isSeen;

                      if (isSeen) {
                        return (
                          <span title="Seen by user">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400 font-bold drop-shadow-sm" />
                          </span>
                        );
                      }
                      if (isDelivered) {
                        return (
                          <span title="Delivered to user">
                            <CheckCheck className="w-3.5 h-3.5 opacity-70" />
                          </span>
                        );
                      }
                      return (
                        <span title="Delivered to server">
                          <Check className="w-3.5 h-3.5 opacity-70" />
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Context menu */}
      {contextMenu && (() => {
        const msg = messages.find(m => m.id === contextMenu.msgId);
        const isMe = msg?.sender_id === currentUserId;
        return (
          <div className="fixed z-50 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl shadow-xl py-1 w-48 animate-fade-in"
            style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { if (msg) { setReplyTo(msg); inputRef.current?.focus(); } setContextMenu(null); }}
              className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
            {isMe && msg && !msg.is_deleted && (
              <button onClick={() => { setEditingMsg(msg); setEditContent(msg.content || ''); setContextMenu(null); inputRef.current?.focus(); }}
                className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
                <Edit2 className="w-3.5 h-3.5" /> Edit Message
              </button>
            )}
            <button onClick={() => { if (msg) { setShowEmojiBar(msg.id); } setContextMenu(null); }}
              className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
              <Smile className="w-3.5 h-3.5" /> React
            </button>
            {isMe && msg && !msg.is_deleted && (
              <>
                <div className="h-px bg-[hsl(var(--border))] my-1" />
                <button onClick={() => msg && handleDelete(msg)}
                  className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Message
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Reply preview bar */}
      {replyTo && !editingMsg && (
        <div className="px-4 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex items-center gap-3 shrink-0">
          <div className="flex-1 pl-3 border-l-2 border-[hsl(var(--accent))] min-w-0">
            <p className="text-[10px] font-bold text-[hsl(var(--accent))]">{replyTo.sender?.full_name}</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{replyTo.content || '📎 Attachment'}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit bar */}
      {editingMsg && (
        <div className="px-4 py-2 border-t border-[hsl(var(--border))] bg-amber-500/10 flex items-center gap-3 shrink-0">
          <Edit2 className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-amber-500">Editing message</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{editingMsg.content}</p>
          </div>
          <button onClick={() => { setEditingMsg(null); setEditContent(''); }} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex items-center gap-2 shrink-0">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx,.xlsx,.ppt"
          onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
        <button onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)] transition-colors shrink-0">
          <Paperclip className="w-4.5 h-4.5" />
        </button>
        <input
          ref={inputRef}
          value={editingMsg ? editContent : input}
          onChange={e => editingMsg ? setEditContent(e.target.value) : setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={editingMsg ? 'Edit message...' : 'Type a message...'}
          className="flex-1 h-10 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={isSending || (!(editingMsg ? editContent.trim() : input.trim()))}
          className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Inline icon component for empty state
function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}
