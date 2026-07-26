import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Zap, ShieldCheck, Trash2, Trash, Lock, Sparkles, Palette } from 'lucide-react';
import { Message, User, Channel } from '../../types/chat';
import { toast } from 'sonner';

interface ChatThreeDotMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRefs: React.RefObject<HTMLElement | null>[];
  selectedMessages: Set<string>;
  activeMessageId: string | null;
  messages: Message[];
  currentUser: User;
  channel: Channel | null;
  onEditMessage: (msg: Message) => void;
  onOpenQuickReplies: () => void;
  onOpenViewDetails: () => void;
  onOpenPrivacyModal: () => void;
  onOpenEventModal: () => void;
  onOpenPollModal: () => void;
  onOpenClearChatModal: () => void;
  onOpenDeleteChannelModal: () => void;
  onOpenAiSummary?: () => void;
  onOpenThemeModal?: () => void;
}

export default function ChatThreeDotMenu({
  isOpen,
  onClose,
  triggerRefs,
  selectedMessages,
  activeMessageId,
  messages,
  currentUser,
  channel,
  onEditMessage,
  onOpenQuickReplies,
  onOpenViewDetails,
  onOpenPrivacyModal,
  onOpenEventModal,
  onOpenPollModal,
  onOpenClearChatModal,
  onOpenDeleteChannelModal,
  onOpenAiSummary,
  onOpenThemeModal
}: ChatThreeDotMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  const updatePosition = () => {
    let activeBtn: HTMLElement | null = null;
    for (const ref of triggerRefs) {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          activeBtn = ref.current;
          break;
        }
      }
    }
    if (activeBtn) {
      const rect = activeBtn.getBoundingClientRect();
      const top = rect.bottom + 6;
      const right = Math.max(12, window.innerWidth - rect.right);
      setCoords({ top, right });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      for (const ref of triggerRefs) {
        if (ref.current && ref.current.contains(target)) {
          return;
        }
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, onClose, triggerRefs]);

  if (!isOpen || !coords) return null;

  const targetId = selectedMessages.size === 1 ? Array.from(selectedMessages)[0] : activeMessageId;
  const targetMsg = targetId ? messages.find(m => m.id === targetId) : null;
  const isMyMsg = targetMsg ? ((targetMsg as any).senderId === currentUser.id || (targetMsg as any).sender === currentUser.id || (targetMsg as any).sender === 'user' || (targetMsg as any).sender === 'me' || targetMsg.fromUserId === currentUser.id) : false;

  const isAdminOrCreator = currentUser.role === 'super_admin' || currentUser.role === 'school_admin' || currentUser.role === 'admin' || (channel as any)?.createdBy === currentUser.id || (channel as any)?.createdById === currentUser.id;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        top: `${coords.top}px`,
        right: `${coords.right}px`,
      }}
      className="fixed w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[9999] py-1 flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      {targetMsg && isMyMsg && (
        <button
          type="button"
          onClick={() => {
            onEditMessage(targetMsg);
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors"
        >
          <span>Edit Message</span>
          <Edit2 size={16} className="text-amber-600" />
        </button>
      )}

      {onOpenAiSummary && (
        <button
          type="button"
          onClick={() => {
            onOpenAiSummary();
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-xs font-black text-indigo-900 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 flex items-center justify-between cursor-pointer border-b border-indigo-100/60 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-indigo-600 fill-indigo-200 animate-pulse" />
            <span>✨ Summarize Unread Messages</span>
          </div>
          <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">AI</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          onOpenQuickReplies();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
      >
        <span>Quick Replies</span>
        <Zap size={16} className="text-amber-500 fill-amber-500" />
      </button>

      <div className="h-px bg-slate-100 my-1" />

      {onOpenThemeModal && (
        <button
          type="button"
          onClick={() => {
            onOpenThemeModal();
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-purple-600" />
            <span>Chat Theme & Style 🎨</span>
          </div>
          <span className="text-[10px] bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.2 rounded-md">New</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          onOpenViewDetails();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        View Details
      </button>

      <button
        type="button"
        onClick={() => {
          onOpenPrivacyModal();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50 flex items-center justify-between cursor-pointer"
      >
        <span>Privacy & Last Seen</span>
        <ShieldCheck size={16} className="text-emerald-600" />
      </button>

      <button
        type="button"
        onClick={() => {
          onOpenEventModal();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        Create Event
      </button>

      <button
        type="button"
        onClick={() => {
          onOpenPollModal();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        Create Poll
      </button>

      <div className="h-px bg-slate-100 my-1" />

      <button
        type="button"
        onClick={() => {
          onOpenClearChatModal();
          onClose();
        }}
        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
      >
        <span>Clear Chat for Me</span>
        <Trash2 size={15} className="text-slate-400" />
      </button>

      {isAdminOrCreator ? (
        <button
          type="button"
          onClick={() => {
            onOpenDeleteChannelModal();
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer"
        >
          <span>Delete Chat for Everyone</span>
          <Trash size={15} className="text-rose-500" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            toast.info("Only school management or channel creators can delete this conversation for everyone. You can use 'Clear Chat for Me'.");
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-400 bg-slate-50/50 flex items-center justify-between cursor-pointer opacity-70"
          title="Only school admins can delete channels for everyone"
        >
          <span>Delete Chat for Everyone</span>
          <Lock size={13} className="text-slate-400" />
        </button>
      )}
    </div>,
    document.body
  );
}
