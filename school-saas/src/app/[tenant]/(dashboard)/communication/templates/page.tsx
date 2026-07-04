'use client';

import { useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';

const mockTemplates = [
  { id: '1', name: 'Student Absence Notification', subject: 'Absence Alert: {{StudentName}}', body: 'Dear {{ParentName}}, your child was absent today...', channel: 'SMS' },
  { id: '2', name: 'Welcome & Admission Offer Letter', subject: 'Congratulations! Admission Offer', body: 'Dear {{ParentName}}, we are pleased to offer {{StudentName}} a seat...', channel: 'Email' }
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(mockTemplates);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Communication Templates Library</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure placeholder-based variables tags (e.g. `{"{{StudentName}}"}`) used across automated alerts.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(tmpl => (
          <div key={tmpl.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-start gap-3 pb-3 border-b border-[hsl(var(--border))]">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{tmpl.name}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Subject: {tmpl.subject}</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-[hsl(var(--text-secondary))]">
              <p className="italic bg-[hsl(var(--bg-tertiary))] p-2.5 rounded border border-[hsl(var(--border))]">"{tmpl.body}"</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Channel format: <span className="font-semibold text-[hsl(var(--text-primary))]">{tmpl.channel}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
