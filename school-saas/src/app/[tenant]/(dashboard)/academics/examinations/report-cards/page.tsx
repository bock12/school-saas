'use client';

import { useState } from 'react';
import { Award, Plus, FileText, CheckCircle2 } from 'lucide-react';

const mockTemplates = [
  { id: '1', name: 'Primary Descriptive Report Card', target: 'Grade 1 - 6', format: 'Competency-based Grid', active: true },
  { id: '2', name: 'Secondary GPA Report Card', target: 'Grade 7 - 12', format: 'Percentage GPA Table', active: false }
];

export default function ReportCardsPage() {
  const [templates, setTemplates] = useState(mockTemplates);

  const activateTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      active: t.id === id
    })));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Report Card Templates</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure descriptive report cards layout and activate GPA grading grid templates.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(tmpl => (
          <div key={tmpl.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{tmpl.name}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                tmpl.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
              }`}>
                {tmpl.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-[hsl(var(--text-secondary))]">
              <p>Target levels: <span className="font-semibold text-[hsl(var(--text-primary))]">{tmpl.target}</span></p>
              <p>Format grid: <span className="font-semibold text-[hsl(var(--text-primary))]">{tmpl.format}</span></p>
            </div>

            {!tmpl.active && (
              <button
                onClick={() => activateTemplate(tmpl.id)}
                className="w-full py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Activate Template
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
