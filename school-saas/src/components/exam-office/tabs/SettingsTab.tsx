'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Settings, Bell, Lock, Shield, Save } from 'lucide-react';

export function SettingsTab({ officer }: { officer: OfficerData }) {
  const sections = [
    {
      label: 'Examination Defaults',
      icon: Settings,
      fields: [
        { label: 'Default Pass Mark (%)', type: 'number', value: '50' },
        { label: 'Minimum Attendance for Eligibility (%)', type: 'number', value: '75' },
        { label: 'Mark Entry Deadline (days after exam)', type: 'number', value: '5' },
        { label: 'Default Max Score', type: 'number', value: '100' },
        { label: 'Default Grading System', type: 'select', value: 'WAEC-Style Senior Secondary' },
      ],
    },
    {
      label: 'Notification Preferences',
      icon: Bell,
      fields: [
        { label: 'Email alerts for missing marks', type: 'toggle', value: 'true' },
        { label: 'SMS when results are published', type: 'toggle', value: 'true' },
        { label: 'Alert on malpractice report', type: 'toggle', value: 'true' },
        { label: 'Notify on result appeal submission', type: 'toggle', value: 'false' },
      ],
    },
    {
      label: 'Publication Controls',
      icon: Shield,
      fields: [
        { label: 'Require Principal approval before publication', type: 'toggle', value: 'true' },
        { label: 'Enable parent portal access on publish', type: 'toggle', value: 'true' },
        { label: 'Auto-send SMS on publish', type: 'toggle', value: 'false' },
        { label: 'Auto-generate transcripts after approval', type: 'toggle', value: 'false' },
      ],
    },
    {
      label: 'Access & Permissions',
      icon: Lock,
      fields: [
        { label: 'Teachers can view published results', type: 'toggle', value: 'true' },
        { label: 'HODs can approve moderation', type: 'toggle', value: 'true' },
        { label: 'Vice Principal can approve results', type: 'toggle', value: 'false' },
        { label: 'Allow score correction after 48 hrs', type: 'toggle', value: 'false' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Exam Office Settings</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Configure examination rules, notification preferences, and access controls</p>
      </div>

      {sections.map(section => (
        <div key={section.label} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <section.icon className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">{section.label}</h2>
          </div>
          <div className="space-y-4">
            {section.fields.map(f => (
              <div key={f.label} className="flex items-center justify-between py-3 border-b border-[hsl(var(--border)/0.5)]">
                <label className="text-sm text-[hsl(var(--text-secondary))]">{f.label}</label>
                {f.type === 'toggle' ? (
                  <div className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${f.value === 'true' ? 'bg-violet-600' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${f.value === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                ) : f.type === 'select' ? (
                  <select className="text-sm bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 outline-none">
                    <option>{f.value}</option>
                  </select>
                ) : (
                  <input type={f.type} defaultValue={f.value} className="w-24 text-sm bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 outline-none text-right" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
