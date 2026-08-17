'use client';

import { useState, useMemo, useRef } from 'react';
import { X, Search, Users, Camera, Check, ChevronRight, ChevronLeft, Lock, Globe } from 'lucide-react';
import type { ChatUser } from './actions';

const ROLE_LABELS: Record<string, string> = {
  school_admin: 'Admin', teacher: 'Teacher', student: 'Student',
  parent: 'Parent', org_admin: 'Org Admin', super_admin: 'Super Admin',
};
const ROLE_PILL: Record<string, string> = {
  school_admin: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  teacher: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  student: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  parent: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  org_admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  super_admin: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
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
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [onlyAdminsPost, setOnlyAdminsPost] = useState(false);
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

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: users.length },
    { key: 'admins', label: 'Admins', count: users.filter(u => ['school_admin', 'org_admin', 'super_admin'].includes(u.role)).length },
    { key: 'teachers', label: 'Teachers', count: users.filter(u => u.role === 'teacher').length },
    { key: 'students', label: 'Students', count: users.filter(u => u.role === 'student').length },
    { key: 'parents', label: 'Parents', count: users.filter(u => u.role === 'parent').length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[hsl(var(--bg-primary))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── Progress stepper ── */}
        <div className="px-5 pt-4 pb-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">
                  {step === 1 ? 'Add Participants' : 'Group Details'}
                </h3>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider">
                  Step {step} of 2
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* ── Step 1: Select Participants ── */}
        {step === 1 && (
          <>
            {/* Selected chips */}
            {selectedUsers.length > 0 && (
              <div className="px-4 py-2.5 flex flex-wrap gap-1.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary)/0.5)]">
                {selectedUsers.map(u => (
                  <span key={u.id} className="flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/30 text-[10px] font-semibold text-blue-400">
                    <div className={`w-4 h-4 rounded-full ${avatarColor(u.id)} text-white flex items-center justify-center text-[6px] font-bold overflow-hidden`}>
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(u.full_name).charAt(0)}
                    </div>
                    {u.full_name.split(' ')[0]}
                    <button onClick={() => toggleUser(u.id)} className="hover:text-rose-400 transition-colors ml-0.5">
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
                <input
                  autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search participants..."
                  className="w-full h-9 pl-8 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b border-[hsl(var(--border))]">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    activeTab === t.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
                  }`}>
                  {t.label}
                  <span className={`text-[8px] px-1 rounded-full ${activeTab === t.key ? 'bg-white/20' : 'bg-[hsl(var(--border))]'}`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border)/0.4)]">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--text-tertiary))]">
                  <Users className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-xs">No participants found</p>
                </div>
              ) : filtered.map(user => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <button key={user.id} onClick={() => toggleUser(user.id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-all text-left ${
                      isSelected ? 'bg-blue-600/5' : 'hover:bg-[hsl(var(--bg-tertiary))]'
                    }`}>
                    {/* Avatar with online dot */}
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full ${avatarColor(user.id)} text-white flex items-center justify-center font-bold text-xs overflow-hidden`}>
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(user.full_name)}
                      </div>
                      {user.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[hsl(var(--bg-primary))]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{user.full_name}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${ROLE_PILL[user.role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </div>
                    {/* Animated check circle */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-blue-600 border-blue-600 scale-110' : 'border-[hsl(var(--border))]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              <button
                disabled={selectedIds.length === 0}
                onClick={() => setStep(2)}
                className="w-full h-10 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                {selectedIds.length > 0 && (
                  <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{selectedIds.length}</span>
                )}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Group Details ── */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Group photo */}
              <div className="flex flex-col items-center gap-2">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]); }} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center cursor-pointer overflow-hidden group shadow-xl hover:shadow-blue-500/20 transition-all"
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <Users className="w-10 h-10 opacity-80" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Camera className="w-5 h-5 text-white" />
                    <span className="text-[9px] text-white font-bold">CHANGE</span>
                  </div>
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Tap to set group photo</p>
              </div>

              {/* Group name */}
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-primary))] mb-1.5 uppercase tracking-wide">Group Name *</label>
                <input
                  autoFocus
                  value={groupName} onChange={e => setGroupName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && groupName.trim() && selectedIds.length > 0) handleCreate(); }}
                  placeholder="e.g. Grade 10 Science, Staff Meeting..."
                  maxLength={60}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-blue-500/50 transition-colors font-semibold"
                />
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 text-right">{groupName.length}/60</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-primary))] mb-1.5 uppercase tracking-wide">Description <span className="text-[hsl(var(--text-tertiary))] normal-case font-normal">(optional)</span></label>
                <textarea
                  value={groupDesc} onChange={e => setGroupDesc(e.target.value)}
                  placeholder="What is this group about?"
                  rows={2}
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>

              {/* Permissions toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/15 flex items-center justify-center">
                    {onlyAdminsPost ? <Lock className="w-3.5 h-3.5 text-violet-400" /> : <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">
                      {onlyAdminsPost ? 'Admins only can post' : 'Everyone can post'}
                    </p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                      {onlyAdminsPost ? 'Other members can only read' : 'All members can send messages'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOnlyAdminsPost(p => !p)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${onlyAdminsPost ? 'bg-violet-600' : 'bg-[hsl(var(--border))]'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${onlyAdminsPost ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Members preview */}
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-primary))] mb-2 uppercase tracking-wide">{selectedUsers.length} Members</label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.slice(0, 12).map(u => (
                    <div key={u.id} title={u.full_name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-secondary))]">
                      <div className={`w-4 h-4 rounded-full ${avatarColor(u.id)} text-white flex items-center justify-center text-[7px] font-bold overflow-hidden`}>
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(u.full_name).charAt(0)}
                      </div>
                      {u.full_name.split(' ')[0]}
                    </div>
                  ))}
                  {selectedUsers.length > 12 && (
                    <div className="px-2.5 py-1 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-tertiary))]">
                      +{selectedUsers.length - 12} more
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex gap-2">
              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-primary))] transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
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
