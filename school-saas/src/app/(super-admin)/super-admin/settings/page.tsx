'use client';

import { Save, Upload, Palette, Globe, Mail, Bell } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Platform Settings</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure global platform settings and defaults</p>
      </div>

      {/* Branding */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Platform Branding</h2>
        </div>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Platform Name</label><input type="text" defaultValue={APP_NAME} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Platform Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-lg font-bold border border-[hsl(var(--border))]">SS</div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"><Upload className="w-4 h-4" />Upload Logo</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Primary Color</label><div className="flex gap-2"><input type="color" defaultValue="#6366f1" className="w-10 h-10 rounded-lg border border-[hsl(var(--border))] cursor-pointer" /><input type="text" defaultValue="#6366f1" className="flex-1 h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Accent Color</label><div className="flex gap-2"><input type="color" defaultValue="#3b82f6" className="w-10 h-10 rounded-lg border border-[hsl(var(--border))] cursor-pointer" /><input type="text" defaultValue="#3b82f6" className="flex-1 h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div></div>
          </div>
        </div>
      </div>

      {/* Domain */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Domain Settings</h2>
        </div>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Root Domain</label><input type="text" defaultValue="schoolsaas.com" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Default Tenant URL Pattern</label>
            <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
              <option>{'{slug}'}.schoolsaas.com (Subdomain)</option>
              <option>schoolsaas.com/t/{'{slug}'} (Path)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Email Configuration</h2>
        </div>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">From Email</label><input type="email" defaultValue="noreply@schoolsaas.com" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Support Email</label><input type="email" defaultValue="support@schoolsaas.com" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
        </div>
      </div>

      {/* Default Tenant Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Default Tenant Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Default Timezone</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>UTC</option><option>America/New_York</option><option>Europe/London</option><option>Africa/Lagos</option></select></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Trial Duration</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>7 days</option><option>14 days</option><option>30 days</option></select></div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
