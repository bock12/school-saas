'use client';

import { useState, useMemo } from 'react';
import { X, Search, Users, MessageSquare, ChevronRight, GraduationCap, Shield } from 'lucide-react';
import type { ChatUser } from './actions';

const ROLE_LABELS: Record<string, string> = {
  school_admin: 'Admin', teacher: 'Teacher', student: 'Student',
  parent: 'Parent', org_admin: 'Org Admin', super_admin: 'Super Admin',
};
const ROLE_COLORS: Record<string, string> = {
  school_admin: 'bg-violet-100 text-violet-700', teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-emerald-100 text-emerald-700', parent: 'bg-amber-100 text-amber-700',
  org_admin: 'bg-purple-100 text-purple-700', super_admin: 'bg-rose-100 text-rose-700',
};

const AVATAR_COLORS = ['bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-fuchsia-600'];
function avatarColor(id: string) { return AVATAR_COLORS[(id.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }
function getInitials(name: string) { return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(); }

type TabType = 'all' | 'teachers' | 'students' | 'parents' | 'admins';

interface NewDmModalProps {
  users: ChatUser[];
  currentUserRole?: string;
  onSelectUser: (user: ChatUser) => void;
  onClose: () => void;
}

export default function NewDmModal({ users, currentUserRole, onSelectUser, onClose }: NewDmModalProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filtered = useMemo(() => {
    let list = users;
    if (activeTab === 'teachers') list = list.filter(u => u.role === 'teacher');
    else if (activeTab === 'students') list = list.filter(u => u.role === 'student');
    else if (activeTab === 'parents') list = list.filter(u => u.role === 'parent');
    else if (activeTab === 'admins') list = list.filter(u => ['school_admin', 'org_admin', 'super_admin'].includes(u.role));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.full_name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
    }
    // Sort by name
    return [...list].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [users, search, activeTab]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'admins', label: 'Admin' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'students', label: 'Students' },
    { key: 'parents', label: 'Parents' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--bg-primary))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--bg-secondary))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent))] text-white flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">New Message</h3>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider">Select a person to chat with</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
            <input
              autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or role..."
              className="w-full h-9 pl-8 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b border-[hsl(var(--border))]">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? 'bg-[hsl(var(--accent))] text-white'
                  : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border)/0.5)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-[hsl(var(--text-tertiary))]">
              <Users className="w-6 h-6 opacity-30" />
              <p className="text-xs">No users found</p>
            </div>
          ) : filtered.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[hsl(var(--bg-tertiary))] transition-colors text-left group"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full ${avatarColor(user.id)} text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden`}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : getInitials(user.full_name)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{user.full_name}</p>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>

        {/* Count */}
        <div className="px-4 py-2.5 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium">{filtered.length} people available</p>
        </div>
      </div>
    </div>
  );
}
