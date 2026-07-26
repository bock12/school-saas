import React, { useState } from 'react';
import { Channel, User } from '../../types/chat';
import { MessageSquare, Users, Search, Plus, CheckCheck, Check, Pin, Star, Filter, X, Circle, Sparkles, Clock, ArrowLeft, Shield, Smile, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateUserActiveStatus } from '../../lib/presence';
import { toast } from 'sonner';

interface ChatSidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onNewMessage: () => void;
  onNewChannel: () => void;
  onOpenStatusModal?: () => void;
  onOpenPrivacyModal?: () => void;
  currentUser: User;
  onBack?: () => void;
}

const STATUS_PRESETS = [
  'Available 👋',
  'In class 📚',
  'Teaching 👨‍🏫',
  'Exam Mode ✏️',
  'Studying 📖',
  'Out of office ✈️',
  'Focus Mode 🤫'
];

export default function ChatSidebar({ 
  channels, 
  activeChannelId, 
  onSelectChannel, 
  onNewMessage, 
  onNewChannel,
  onOpenStatusModal,
  onOpenPrivacyModal,
  currentUser,
  onBack
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups' | 'starred'>('all');
  const [showQuickStatusMenu, setShowQuickStatusMenu] = useState(false);
  const [customStatus, setCustomStatus] = useState<string>(
    (currentUser as any).statusMessage || 'Available 👋'
  );

  const handleUpdateStatus = async (msg: string) => {
    setCustomStatus(msg);
    setShowQuickStatusMenu(false);
    try {
      await updateUserActiveStatus(currentUser.id, true, { statusMessage: msg });
      toast.success(`Status set to: "${msg}"`);
    } catch (err) {
      console.error('Failed to update status message:', err);
    }
  };

  const filteredChannels = channels.filter(channel => {
    // Filter by tab
    if (activeFilter === 'unread' && (!channel.unreadCount || channel.unreadCount === 0)) return false;
    if (activeFilter === 'groups' && channel.type !== 'group') return false;
    if (activeFilter === 'starred' && !channel.isPinned) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    if (channel.type === 'direct') {
      const otherParticipant = channel.participants?.find(p => p.id !== currentUser.id);
      return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return channel.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort channels: Pinned first, then by latest updated time
  const sortedChannels = [...filteredChannels].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="w-full md:w-72 lg:w-80 xl:w-88 border-r border-slate-200 flex flex-col bg-[#ffffff] h-full shadow-xs min-w-0">
      {/* WhatsApp Web Top Bar */}
      <div className="px-4 py-3 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between relative">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold overflow-hidden ring-2 ring-emerald-500/30">
              {currentUser.profileImage ? (
                <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight leading-tight truncate">
              {currentUser.name}
            </h2>
            <button
              onClick={() => setShowQuickStatusMenu(!showQuickStatusMenu)}
              className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 hover:text-emerald-950 transition-colors cursor-pointer truncate max-w-[140px]"
              title="Click to set custom status message"
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
              <span className="truncate">{customStatus}</span>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
            </button>
          </div>
        </div>

        {/* Quick Status Message Dropdown */}
        <AnimatePresence>
          {showQuickStatusMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-4 top-14 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                  <Smile size={13} className="text-emerald-600" /> Set Status Message
                </span>
                <button onClick={() => setShowQuickStatusMenu(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {STATUS_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleUpdateStatus(preset)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      customStatus === preset ? 'bg-emerald-50 text-emerald-800 font-extrabold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{preset}</span>
                    {customStatus === preset && <Check size={13} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1 shrink-0">
          {onOpenPrivacyModal && (
            <button
              onClick={onOpenPrivacyModal}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              title="Privacy & Online Status Settings"
            >
              <Shield className="w-5 h-5 text-emerald-700" />
            </button>
          )}
          {onOpenStatusModal && (
            <button 
              onClick={onOpenStatusModal}
              className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/70 rounded-full transition-colors cursor-pointer relative"
              title="School Statuses / Stories (24h Updates)"
            >
              <Sparkles className="w-5 h-5 fill-emerald-200" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </button>
          )}
          <button 
            onClick={onNewMessage}
            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            title="New Direct Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button 
            onClick={onNewChannel}
            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            title="New Group Chat"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* WhatsApp Search & Filter Bar */}
      <div className="p-3 bg-[#ffffff] border-b border-slate-100 space-y-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#f0f2f5] border border-transparent rounded-lg text-xs text-slate-800 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* WhatsApp Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {(['all', 'unread', 'groups', 'starred'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            const labels = { all: 'All', unread: 'Unread', groups: 'Groups', starred: 'Pinned' };
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#00a884] text-white shadow-xs' 
                    : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        {/* Quick Access Statuses Banner */}
        {onOpenStatusModal && (
          <button
            onClick={onOpenStatusModal}
            className="w-full flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 rounded-xl transition-all cursor-pointer group text-left mt-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-400/80 group-hover:scale-105 transition-transform">
                  <Sparkles size={14} className="fill-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h5 className="text-xs font-black text-emerald-950 flex items-center gap-1">
                  School Statuses & Stories
                </h5>
                <p className="text-[10px] text-emerald-700 font-medium">Click to view 24h temporary updates</p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-2xs">
              Live 24h
            </span>
          </button>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
        {sortedChannels.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No chats found</p>
            <p className="text-[11px] text-slate-400 mt-1">Start a new conversation or group to begin messaging</p>
          </div>
        ) : (
          sortedChannels.map((channel) => {
            const isActive = activeChannelId === channel.id;
            const otherParticipant = channel.type === 'direct' 
              ? channel.participants?.find(p => p.id !== currentUser.id)
              : null;
            
            const displayName = channel.type === 'direct' 
              ? otherParticipant?.name || 'User'
              : channel.name;

            const isLastMsgFromMe = channel.lastMessage?.fromUserId === currentUser.id;

            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={`w-full flex items-center gap-3 p-3 transition-colors cursor-pointer border-l-4 ${
                  isActive 
                    ? 'bg-[#f0f2f5] border-[#00a884]' 
                    : 'hover:bg-[#f5f6f8] border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden font-bold text-white ${
                    channel.type === 'direct' ? 'bg-teal-600' : 'bg-emerald-700'
                  }`}>
                    {channel.type === 'direct' ? (
                      otherParticipant?.profileImage ? (
                        <img src={otherParticipant.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{displayName?.charAt(0).toUpperCase()}</span>
                      )
                    ) : (
                      <Users className="w-5 h-5 text-white" />
                    )}
                  </div>
                  {channel.type === 'direct' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-xs text-slate-900 truncate">
                      {displayName}
                    </h4>
                    {channel.lastMessage && channel.lastMessage.createdAt && (
                      <span className={`text-[10px] whitespace-nowrap ml-2 ${
                        channel.unreadCount ? 'text-emerald-600 font-bold' : 'text-slate-400'
                      }`}>
                        {new Date(channel.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 min-w-0">
                      {isLastMsgFromMe && (
                        channel.lastMessage?.read ? (
                          <CheckCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        ) : (
                          <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )
                      )}
                      <span className="truncate">
                        {channel.lastMessage ? channel.lastMessage.content : (channel.description || 'No messages yet')}
                      </span>
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      {channel.isPinned && (
                        <Pin className="w-3 h-3 text-slate-400 rotate-45" />
                      )}
                      {channel.unreadCount ? (
                        <div className="min-w-[18px] h-[18px] px-1 bg-[#25d366] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {channel.unreadCount}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

