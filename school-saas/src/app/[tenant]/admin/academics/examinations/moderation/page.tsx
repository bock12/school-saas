'use client';

import { useState } from 'react';
import { ClipboardList, Plus, Search, HelpCircle, CheckCircle2 } from 'lucide-react';

const mockModerationLogs = [
  { id: '1', subject: 'Physics Mechanics', classLink: 'SS1 Arts', teacher: 'Dr. Mensah', deviationScore: '+14% Deviation', comment: 'CA tests show standard deviation check anomaly. Needs grade moderation.' },
  { id: '2', subject: 'General Mathematics', classLink: 'SS2 Science', teacher: 'John Doe', deviationScore: '0.2%', comment: 'Syllabus alignment verified ok.' }
];

export default function ModerationPage() {
  const [moderations, setModerations] = useState(mockModerationLogs);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Head of Department (HOD) Moderation</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review grade distributions variances, correct marking anomalies, and sign off departmental grade registers.</p>
      </div>

      <div className="space-y-4">
        {moderations.map(row => (
          <div key={row.id} className="glass-card p-5 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{row.subject}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Teacher: {row.teacher} • Class: {row.classLink}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                row.deviationScore.startsWith('+') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                Variance: {row.deviationScore}
              </span>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">HOD Audit Comment: {row.comment}</p>

            <div className="flex gap-2 pt-2">
              <button className="px-3.5 py-1.5 rounded bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-90 transition-opacity">Adjust Grades</button>
              <button className="px-3.5 py-1.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-xs font-semibold hover:bg-[hsl(var(--bg-tertiary)/0.8)] transition-all">Request corrections</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
