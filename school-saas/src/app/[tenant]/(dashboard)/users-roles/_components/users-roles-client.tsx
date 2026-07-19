'use client';

import { useState } from 'react';
import { UsersRound, Plus, Shield, Key, Search, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { EditUserModal } from './edit-user-modal';
import { toggleUserStatus, sendPasswordReset, deleteUserAccount } from '@/app/actions/users';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  job_title: string | null;
  is_active: boolean;
  last_login_at: string | null;
  schoolName: string;
  schoolSlug: string;
  isOrgLevel: boolean;
}

interface UsersRolesClientProps {
  tenantSlug: string;
  profiles: Profile[];
  isOrgAdmin: boolean;
}

const ROLE_INFO: Record<string, { name: string, permissions: number, color: string, bg: string, description: string }> = {
  'super_admin': { name: 'Super Admin', permissions: 99, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', description: 'Platform-level global access' },
  'org_admin': { name: 'Org Admin', permissions: 60, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', description: 'Full control over the organization and its schools' },
  'school_admin': { name: 'School Admin', permissions: 48, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', description: 'Full control over school operations' },
  'teacher': { name: 'Teacher', permissions: 14, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', description: 'Class and student management' },
  'student': { name: 'Student', permissions: 5, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', description: 'Access to learning materials and assignments' },
  'parent': { name: 'Parent', permissions: 4, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20', description: 'View child progress and communication' },
};

export function UsersRolesClient({ tenantSlug, profiles, isOrgAdmin }: UsersRolesClientProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Stats calculation
  const roleStats = Object.keys(ROLE_INFO).map(roleKey => {
    return {
      ...ROLE_INFO[roleKey],
      key: roleKey,
      users: profiles.filter(p => p.role === roleKey).length
    };
  }).filter(r => r.users > 0 || r.key !== 'super_admin'); // Hide super_admin if 0

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = (p.full_name?.toLowerCase().includes(search.toLowerCase())) || 
                          (p.email?.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (user: Profile) => {
    if (!confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.full_name}?`)) return;
    setIsProcessing(user.id);
    await toggleUserStatus(user.id, user.is_active);
    window.location.reload();
  };

  const handleResetPassword = async (user: Profile) => {
    if (!user.email) return alert('User has no email address.');
    if (!confirm(`Send password reset email to ${user.email}?`)) return;
    setIsProcessing(user.id);
    const res = await sendPasswordReset(user.email, tenantSlug);
    if (res.success) alert('Password reset email sent successfully.');
    else alert('Failed to send reset email: ' + res.error);
    setIsProcessing(null);
  };

  const handleDelete = async (user: Profile) => {
    if (!confirm(`DANGER: Are you sure you want to completely delete ${user.full_name}'s account? This action is irreversible.`)) return;
    setIsProcessing(user.id);
    const res = await deleteUserAccount(user.id);
    if (res.success) window.location.reload();
    else {
      alert('Failed to delete user: ' + res.error);
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Users & Roles</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage user accounts, base roles, and access permissions</p>
        </div>
      </div>

      {/* Roles Grid */}
      <div>
        <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest mb-3">Roles & Permissions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {roleStats.map((role, i) => (
            <div key={role.name} className={`rounded-xl border p-4 animate-fade-in hover:scale-105 transition-transform cursor-default ${role.bg}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <Shield className={`w-5 h-5 ${role.color}`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.bg} ${role.color}`}>{role.permissions} perms</span>
              </div>
              <p className={`text-base font-bold ${role.color}`}>{role.users}</p>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{role.name}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">User Accounts</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-8 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors w-40" 
              />
            </div>
            <select 
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            >
              <option value="All">All Roles</option>
              {Object.entries(ROLE_INFO).map(([key, role]) => (
                <option key={key} value={key}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['User', 'Email', 'Role / Title', 'School', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-[hsl(var(--text-secondary))]">
                    No users found.
                  </td>
                </tr>
              ) : filteredProfiles.map((user, i) => (
                <tr key={user.id} className={`border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors ${isProcessing === user.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                        {(user.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[hsl(var(--text-primary))] whitespace-nowrap">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-tertiary))]">{user.email || 'N/A'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))]">
                        {ROLE_INFO[user.role]?.name || user.role}
                      </span>
                      {user.job_title && (
                        <span className="text-[10px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{user.job_title}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-tertiary))]">{user.schoolName}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors hover:opacity-80 ${user.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditUser(user)} title="Edit Role/Title" className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                      <button onClick={() => handleResetPassword(user)} title="Send Password Reset" className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"><Key className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                      <button onClick={() => handleDelete(user)} title="Delete Account" className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--danger))]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <EditUserModal 
          user={editUser} 
          onClose={() => setEditUser(null)} 
          isOrgAdmin={isOrgAdmin} 
        />
      )}
    </div>
  );
}
