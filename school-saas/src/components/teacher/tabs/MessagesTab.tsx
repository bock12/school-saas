'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Send, Search, MessageSquare, Users, Check, CheckCheck } from 'lucide-react';

const conversations = [
  { id: '1', name: 'Mrs. Okafor (Parent)', role: 'Parent', lastMessage: "Thank you for the update about Blessing's progress.", time: '10 min', unread: 1, avatar: null },
  { id: '2', name: 'Mr. Principal Adebayo', role: 'Principal', lastMessage: 'Please submit your lesson plans by Friday.', time: '1 hr', unread: 0, avatar: null },
  { id: '3', name: 'HOD Mathematics', role: 'Dept Head', lastMessage: 'Department meeting scheduled for Thursday 2pm.', time: '2 hrs', unread: 1, avatar: null },
  { id: '4', name: 'SS2A (Class Group)', role: 'Class', lastMessage: 'Your assignment for this week has been uploaded.', time: '3 hrs', unread: 0, avatar: null },
  { id: '5', name: 'Ms. Vice Principal Nwosu', role: 'Vice Principal', lastMessage: 'Your attendance records for July have been approved.', time: '1 day', unread: 0, avatar: null },
  { id: '6', name: 'Dr. Nwosu Charles (Parent)', role: 'Parent', lastMessage: 'Good morning, please I need to discuss Chukwuemeka.', time: '1 day', unread: 2, avatar: null },
];

const messages = [
  { id: '1', from: 'other', text: "Good morning, please I need to discuss Chukwuemeka's recent behaviour in class.", time: '9:00 AM' },
  { id: '2', from: 'me', text: 'Good morning Dr. Nwosu. Yes, I\'d be happy to discuss. He\'s been quite disruptive lately but also shows great potential when focused.', time: '9:15 AM' },
  { id: '3', from: 'other', text: 'Thank you. Is there a time we could meet or have a call?', time: '9:20 AM' },
  { id: '4', from: 'me', text: 'Yes, I\'m available Thursday between 2-4pm. Alternatively, we could do a call this Friday morning at 8am.', time: '9:25 AM' },
  { id: '5', from: 'other', text: 'Friday 8am works perfectly. Thank you so much for your time and dedication.', time: '9:30 AM' },
];

const roleColors: Record<string, string> = {
  Parent: 'bg-blue-500/15 text-blue-400',
  Principal: 'bg-purple-500/15 text-purple-400',
  'Dept Head': 'bg-amber-500/15 text-amber-400',
  Class: 'bg-emerald-500/15 text-emerald-400',
  'Vice Principal': 'bg-rose-500/15 text-rose-400',
};

export function MessagesTab({ teacher }: { teacher: TeacherData }) {
  const [selected, setSelected] = useState<string | null>('6');
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  const selectedConvo = conversations.find((c) => c.id === selected);
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Messages</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{conversations.filter((c) => c.unread > 0).length} unread conversations</p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:scale-105 transition-all"
          style={{ background: teacher.primaryColor }}
        >
          <MessageSquare className="w-4 h-4" /> New Message
        </button>
      </div>

      {/* Compose Form */}
      {showCompose && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <h3 className="font-black text-[hsl(var(--text-primary))] mb-4">Compose New Message</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Send To</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['Students', 'Parents', 'Principal', 'HOD', 'Entire Class', 'Entire Subject'].map((t) => (
                  <button key={t} className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent)/0.1)] hover:text-[hsl(var(--accent))] transition-colors font-semibold">{t}</button>
                ))}
              </div>
              <input placeholder="Search recipient..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Subject</label>
              <input placeholder="Message subject..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Message</label>
              <textarea rows={4} placeholder="Type your message..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>
              <Send className="w-3.5 h-3.5" /> Send
            </button>
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">Cancel</button>
          </div>
        </div>
      )}

      {/* Chat Layout */}
      <div className="glass-card rounded-2xl overflow-hidden" style={{ height: '60vh', minHeight: 400 }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-full sm:w-72 flex-shrink-0 border-r border-[hsl(var(--border))] flex flex-col">
            <div className="p-3 border-b border-[hsl(var(--border))]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelected(convo.id)}
                  className={`w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-[hsl(var(--bg-tertiary)/0.5)] border-b border-[hsl(var(--border)/0.3)] ${selected === convo.id ? 'bg-[hsl(var(--accent)/0.06)]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[hsl(var(--accent))]">{convo.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-[hsl(var(--text-primary))] truncate">{convo.name}</p>
                      <span className="text-[9px] text-[hsl(var(--text-tertiary))] flex-shrink-0">{convo.time}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${roleColors[convo.role] || 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]'}`}>{convo.role}</span>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 truncate">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="w-4.5 h-4.5 rounded-full bg-[hsl(var(--accent))] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                      {convo.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col hidden sm:flex">
            {selectedConvo ? (
              <>
                <div className="p-4 border-b border-[hsl(var(--border))] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center">
                    <span className="text-xs font-black text-[hsl(var(--accent))]">{selectedConvo.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[hsl(var(--text-primary))]">{selectedConvo.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${roleColors[selectedConvo.role] || ''}`}>{selectedConvo.role}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.from === 'me' ? 'text-white rounded-tr-none' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] rounded-tl-none'}`}
                        style={msg.from === 'me' ? { background: teacher.primaryColor } : {}}>
                        <p className="text-xs leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${msg.from === 'me' ? 'justify-end' : ''}`}>
                          <span className="text-[9px] opacity-70">{msg.time}</span>
                          {msg.from === 'me' && <CheckCheck className="w-3 h-3 opacity-70" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-[hsl(var(--border))] flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    rows={2}
                    className="flex-1 px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none"
                  />
                  <button
                    onClick={() => setDraft('')}
                    className="p-2.5 rounded-xl text-white flex-shrink-0"
                    style={{ background: teacher.primaryColor }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-2" />
                  <p className="text-sm text-[hsl(var(--text-tertiary))]">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
