'use client';

import { useState } from 'react';
import { Shield, Briefcase, Loader2, X } from 'lucide-react';
import { updateUserRole, AppRole } from '@/app/actions/users';

interface Profile {
  id: string;
  full_name: string;
  role: string;
  job_title: string | null;
}

interface EditUserModalProps {
  user: Profile;
  onClose: () => void;
  isOrgAdmin: boolean;
}

export function EditUserModal({ user, onClose, isOrgAdmin }: EditUserModalProps) {
  const [role, setRole] = useState<AppRole>(user.role as AppRole);
  const [jobTitle, setJobTitle] = useState(user.job_title || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableRoles: { value: AppRole, label: string }[] = [
    { value: 'student', label: 'Student' },
    { value: 'parent', label: 'Parent' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'school_admin', label: 'School Admin' },
  ];

  if (isOrgAdmin) {
    availableRoles.push({ value: 'org_admin', label: 'Org Admin' });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await updateUserRole(user.id, role, jobTitle.trim() || undefined);
    
    if (res.success) {
      window.location.reload();
    } else {
      setError(res.error || 'Failed to update user.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">Edit Role & Title</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-5 h-5 text-[hsl(var(--text-secondary))]" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] font-bold flex-shrink-0">
              {(user.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{user.full_name}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Editing Access Level</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
              Base Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <select
                value={role}
                onChange={e => setRole(e.target.value as AppRole)}
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors appearance-none"
              >
                {availableRoles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 block">
              Custom Job Title <span className="text-[hsl(var(--text-tertiary))] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Finance Officer, Head of English..."
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-1.5 leading-relaxed">
              Base roles determine system permissions. Job titles are strictly for display and organizational clarity.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
