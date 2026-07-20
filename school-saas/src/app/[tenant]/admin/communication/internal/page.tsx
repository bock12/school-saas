'use client';

import { useState } from 'react';
import { MessageSquare, Search, Send, User } from 'lucide-react';

const mockChats = [
  { id: '1', user: 'Mrs. Rachel Johnson (Parent)', lastMsg: 'Regarding Amara\'s absence last week...', date: '10:42 AM', unread: true },
  { id: '2', user: 'Mr. Emeka Okafor (Parent)', lastMsg: 'Thank you, I will make payment today.', date: 'Yesterday', unread: false },
  { id: '3', user: 'Dr. Raj Sharma (HOD Science)', lastMsg: 'Are the biology lab rosters compiled?', date: 'Jul 2', unread: false }
];

export default function InternalMessagesPage() {
  const [chats, setChats] = useState(mockChats);
  const [activeChat, setActiveChat] = useState('1');
  const [msgText, setMsgText] = useState('');

  const currentChat = chats.find(c => c.id === activeChat);

  return (
    <div className="space-y-6 max-w-[1600px] h-[calc(100vh-180px)] min-h-[500px] flex flex-col animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Internal Secure Messaging</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Direct communication portal between teachers, parents, HODs, and school administrators.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
        {/* Left chat sidebar */}
        <div className="w-80 border-r border-[hsl(var(--border))] flex flex-col bg-[hsl(var(--bg-secondary))]">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border)/0.5)]">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat.id);
                  // clear unread
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c));
                }}
                className={`w-full p-4 text-left flex gap-3 hover:bg-[hsl(var(--bg-tertiary))] transition-colors ${
                  activeChat === chat.id ? 'bg-[hsl(var(--bg-tertiary))]' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className={`text-xs font-bold truncate ${chat.unread ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-primary))]'}`}>{chat.user}</p>
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] whitespace-nowrap">{chat.date}</span>
                  </div>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] truncate">{chat.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right chat window */}
        <div className="flex-1 flex flex-col bg-[hsl(var(--bg-secondary))]">
          {currentChat ? (
            <>
              <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{currentChat.user}</h3>
                  <span className="text-[10px] text-emerald-400 font-medium">Active now</span>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] text-xs text-[hsl(var(--text-primary))]">
                    {currentChat.lastMsg}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[hsl(var(--border))] flex gap-2.5">
                <input
                  type="text"
                  placeholder="Type a secure message..."
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  className="flex-1 h-10 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                />
                <button className="h-10 px-4 rounded-lg bg-[hsl(var(--accent))] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[hsl(var(--text-tertiary))] p-8">
              <MessageSquare className="w-12 h-12 mb-3" />
              <p className="text-xs">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
