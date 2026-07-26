'use client';

import { useState, useMemo, useRef } from 'react';
import { X, Search, Users, Image as ImageIcon, Camera, Check, ChevronDown } from 'lucide-react';
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

interface NewGroupModalProps {
  users: ChatUser[];
  onCreate: (name: string, memberIds: string[], avatarUrl?: string) => void;
  onClose: () => void;
}

export default function NewGroupModal({ users, onCreate, onClose }: NewGroupModalProps) {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    return [...list].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [users, search, activeTab]);

  const selectedUsers = users.filter(u => selectedIds.includes(u.id));

  function toggleUser(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => { const r = e.target?.result as string; if (r) setAvatarUrl(r); };
    reader.readAsDataURL(file);
  }

  async function handleCreate() {
    if (!groupName.trim() || selectedIds.length === 0) return;
    setIsCreating(true);
    await onCreate(groupName.trim(), selectedIds, avatarUrl || undefined);
    setIsCreating(false);
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'admins', label: 'Admin' },
    { key: 'teachers', label: 'Teachers' }, { key: 'students', label: 'Students' },
    { key: 'parents', label: 'Parents' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--bg-primary))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--bg-secondary))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">
                {step === 'select' ? 'Add Participants' : 'Group Details'}
              </h3>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider">
                {step === 'select'
                  ? `${selectedIds.length} selected`
                  : 'Name your group'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'select' ? (
          <>
            {/* Selected chips */}
            {selectedUsers.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
                {selectedUsers.map(u => (
                  <span key={u.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.3)] text-[10px] font-semibold text-[hsl(var(--accent))]">
                    {u.full_name.split(' ')[0]}
                    <button onClick={() => toggleUser(u.id)} className="hover:text-rose-500 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search participants..."
                  className="w-full h-9 pl-8 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b border-[hsl(var(--border))]">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                    activeTab === t.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border)/0.5)]">
              {filtered.map(user => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <button key={user.id} onClick={() => toggleUser(user.id)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left ${isSelected ? 'bg-[hsl(var(--accent)/0.06)]' : 'hover:bg-[hsl(var(--bg-tertiary))]'}`}>
                    <div className={`w-9 h-9 rounded-full ${avatarColor(user.id)} text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                      {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(user.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{user.full_name}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))]'
                        : 'border-[hsl(var(--border))]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              <button
                disabled={selectedIds.length === 0}
                onClick={() => setStep('details')}
                className="w-full h-10 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Group Details
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Group details form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Group photo */}
              <div className="flex flex-col items-center gap-3">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]); }} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer overflow-hidden group border-4 border-[hsl(var(--bg-tertiary))] shadow-lg hover:opacity-90 transition-opacity"
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <Users className="w-8 h-8" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Click to add group photo</p>
              </div>

              {/* Group name */}
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-primary))] mb-2 uppercase tracking-wide">Group Name *</label>
                <input
                  autoFocus
                  value={groupName} onChange={e => setGroupName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && groupName.trim() && selectedIds.length > 0) handleCreate(); }}
                  placeholder="e.g. Grade 10 Science, Staff Meeting..."
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-semibold"
                />
              </div>

              {/* Participants summary */}
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-primary))] mb-2 uppercase tracking-wide">{selectedUsers.length} Participants</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-secondary))]">
                      <div className={`w-4 h-4 rounded-full ${avatarColor(u.id)} text-white flex items-center justify-center text-[7px] font-bold`}>
                        {getInitials(u.full_name).charAt(0)}
                      </div>
                      {u.full_name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex gap-2">
              <button onClick={() => setStep('select')}
                className="flex-1 h-10 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-primary))] transition-colors">
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!groupName.trim() || selectedIds.length === 0 || isCreating}
                className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Users className="w-4 h-4" /> Create Group</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
