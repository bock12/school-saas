'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Settings, School, Calendar, Users, Save, Palette, Globe, Clock } from 'lucide-react';

export default function SchoolSettingsPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: School },
    { id: 'academic', label: 'Academic Year', icon: Calendar },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'users', label: 'Users & Roles', icon: Users },
  ];

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">School Settings</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure your school&apos;s preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="glass-card p-4 sm:p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--border))]">
            <School className="w-5 h-5 text-[hsl(var(--accent))]" />
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">General Information</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Basic school details and contact</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">School Name</label>
              <input type="text" defaultValue={tenant.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Contact Email</label>
                <input type="email" defaultValue="admin@greenwood.edu" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Phone Number</label>
                <input type="tel" defaultValue="+1 555-0100" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Address</label>
              <input type="text" defaultValue="123 Academy Drive, Springfield" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" />Country</label>
                <select defaultValue="US" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                  <option value="US">United States</option><option value="NG">Nigeria</option><option value="GB">United Kingdom</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="IN">India</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" />Timezone</label>
                <select defaultValue="EST" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                  <option>America/New_York (EST)</option><option>America/Chicago (CST)</option><option>Africa/Lagos (WAT)</option><option>Europe/London (GMT)</option><option>Asia/Kolkata (IST)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[hsl(var(--border))]">
            <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto justify-center">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Academic Year Settings */}
      {activeTab === 'academic' && (
        <div className="glass-card p-4 sm:p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--border))]">
            <Calendar className="w-5 h-5 text-[hsl(var(--accent))]" />
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Academic Year Configuration</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Set up your academic calendar</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Year */}
            <div className="p-4 rounded-xl border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.05)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">2025-2026</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">Current Academic Year</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 w-fit">ACTIVE</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Term 1', start: 'Sep 1, 2025', end: 'Dec 15, 2025', status: 'completed' },
                  { name: 'Term 2', start: 'Jan 5, 2026', end: 'Apr 15, 2026', status: 'completed' },
                  { name: 'Term 3', start: 'May 1, 2026', end: 'Jul 31, 2026', status: 'active' },
                ].map(term => (
                  <div key={term.name} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 gap-2 rounded-lg bg-[hsl(var(--bg-primary)/0.5)]">
                    <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{term.name}</span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">{term.start} — {term.end}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded w-fit ${
                      term.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'
                    }`}>{term.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branding */}
      {activeTab === 'branding' && (
        <div className="glass-card p-4 sm:p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--border))]">
            <Palette className="w-5 h-5 text-[hsl(var(--accent))]" />
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Branding & Appearance</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Customize your school portal appearance</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">School Logo</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] flex-shrink-0"><School className="w-8 h-8" /></div>
                <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full sm:w-auto">Upload Logo</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Primary Color</label>
              <div className="flex flex-wrap gap-3">
                {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                  <button key={color} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/30 transition-all hover:scale-110" style={{ background: color }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users & Roles */}
      {activeTab === 'users' && (
        <div className="glass-card p-4 sm:p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--border))]">
            <Users className="w-5 h-5 text-[hsl(var(--accent))]" />
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Users & Roles</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Manage user access and permissions</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'John Admin', role: 'School Admin', email: 'admin@greenwood.edu', status: 'active' },
              { name: 'John Smith', role: 'Teacher', email: 'john.smith@school.edu', status: 'active' },
              { name: 'Maria Garcia', role: 'Teacher', email: 'maria.garcia@school.edu', status: 'active' },
            ].map(user => (
              <div key={user.email} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 rounded-xl hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{user.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] font-medium">{user.role}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 rounded-lg border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.3)] transition-all">
            + Invite User
          </button>
        </div>
      )}
    </div>
  );
}
