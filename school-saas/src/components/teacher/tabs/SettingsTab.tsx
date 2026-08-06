'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { User, Camera, Save, Key, Shield, Palette, Bell, Monitor, Globe } from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: 'Profile & Account', icon: User },
  { id: 'security', label: 'Password & Security', icon: Key },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsTab({ teacher }: { teacher: TeacherData }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifPrefs, setNotifPrefs] = useState({
    emailAttendance: true,
    emailAssignments: true,
    emailMessages: true,
    emailAnnouncements: false,
    pushAll: true,
  });

  function toggleNotif(key: keyof typeof notifPrefs) {
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Settings & Preferences</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Manage your account, security, and notification settings</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Sidebar Nav */}
        <div className="glass-card rounded-2xl p-3 flex xl:flex-col gap-2 overflow-x-auto xl:overflow-visible">
          {settingsSections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                    : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="xl:col-span-3 glass-card rounded-2xl p-5">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-5">
              <h2 className="font-black text-[hsl(var(--text-primary))]">Profile Information</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center">
                    <User className="w-10 h-10 text-[hsl(var(--accent))]" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-black text-[hsl(var(--text-primary))]">{teacher.name}</p>
                  <p className="text-sm text-[hsl(var(--text-tertiary))]">{teacher.email}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] capitalize mt-0.5">{teacher.role.replace('_', ' ')} · {teacher.tenantName}</p>
                </div>
              </div>
              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: teacher.name, type: 'text' },
                  { label: 'Email Address', value: teacher.email, type: 'email' },
                  { label: 'Phone Number', value: '', placeholder: '+234 800 000 0000', type: 'tel' },
                  { label: 'Department', value: teacher.department || '', placeholder: 'e.g. Science Department', type: 'text' },
                  { label: 'Qualification', value: '', placeholder: 'e.g. B.Ed Mathematics', type: 'text' },
                  { label: 'Years of Experience', value: '', placeholder: 'e.g. 8', type: 'number' },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.value}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Bio / Note</label>
                  <textarea
                    rows={3}
                    placeholder="Short bio visible on your profile..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-105" style={{ background: teacher.primaryColor }}>
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-5">
              <h2 className="font-black text-[hsl(var(--text-primary))]">Password & Security</h2>
              <div className="space-y-4">
                {[
                  { label: 'Current Password', placeholder: '••••••••••' },
                  { label: 'New Password', placeholder: '••••••••••' },
                  { label: 'Confirm New Password', placeholder: '••••••••••' },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{f.label}</label>
                    <input type="password" placeholder={f.placeholder} className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
                  </div>
                ))}
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>
                  <Key className="w-4 h-4" /> Update Password
                </button>
              </div>
              <div className="border-t border-[hsl(var(--border)/0.5)] pt-4">
                <h3 className="font-black text-[hsl(var(--text-primary))] text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Two-Factor Authentication</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mb-3">Add an extra layer of security to your account using an authenticator app or SMS.</p>
                <button className="px-4 py-2 rounded-xl text-sm font-bold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">Enable 2FA</button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-black text-[hsl(var(--text-primary))]">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  { key: 'emailAttendance', label: 'Attendance Reminders', desc: 'Remind me to take attendance for each class' },
                  { key: 'emailAssignments', label: 'Assignment Deadlines', desc: 'Alert before assignment due dates' },
                  { key: 'emailMessages', label: 'New Messages', desc: 'Notify when I receive a new message' },
                  { key: 'emailAnnouncements', label: 'School Announcements', desc: 'Receive all-school broadcast notifications' },
                  { key: 'pushAll', label: 'Push Notifications', desc: 'Enable browser/mobile push notifications' },
                ].map((pref) => {
                  const key = pref.key as keyof typeof notifPrefs;
                  return (
                    <div key={pref.key} className="flex items-center justify-between p-3.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] hover:bg-[hsl(var(--bg-tertiary)/0.6)] transition-colors">
                      <div>
                        <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{pref.label}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleNotif(key)}
                        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${notifPrefs[key] ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))]'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${notifPrefs[key] ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="space-y-5">
              <h2 className="font-black text-[hsl(var(--text-primary))]">Appearance</h2>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Dark', colors: ['#0f172a', '#1e293b', '#6366f1'] },
                    { id: 'light', label: 'Light', colors: ['#f8fafc', '#f1f5f9', '#6366f1'] },
                    { id: 'system', label: 'System', colors: ['#0f172a', '#f8fafc', '#6366f1'] },
                  ].map((theme) => (
                    <button key={theme.id} className="glass-card rounded-xl p-4 text-center hover:ring-1 hover:ring-[hsl(var(--accent))] transition-all">
                      <div className="flex gap-1 justify-center mb-2">
                        {theme.colors.map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-[hsl(var(--text-secondary))]">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-3">Language</label>
                <select className="text-sm px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none w-full max-w-xs">
                  <option>English (Nigeria)</option>
                  <option>English (UK)</option>
                  <option>English (US)</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>
                <Save className="w-4 h-4" /> Save Appearance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
