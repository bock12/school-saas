'use client';
import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Send, CheckCircle2, Eye, EyeOff, Users, Bell } from 'lucide-react';

const results = [
  { class: 'SSS 1A', exam: 'End-of-Term', candidates: 38, approved: true, published: false, portal: false, sms: false, email: false },
  { class: 'SSS 1B', exam: 'End-of-Term', candidates: 41, approved: true, published: false, portal: false, sms: false, email: false },
  { class: 'SSS 2A', exam: 'End-of-Term', candidates: 35, approved: false, published: false, portal: false, sms: false, email: false },
  { class: 'SSS 3A', exam: 'End-of-Term', candidates: 32, approved: true, published: true, portal: true, sms: true, email: true },
];

export function PublicationTab({ officer }: { officer: OfficerData }) {
  const [publishing, setPublishing] = useState<string | null>(null);

  function handlePublish(cls: string) {
    setPublishing(cls);
    setTimeout(() => setPublishing(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Result Publication</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Controlled release of results to student portal, SMS, email, and parent app</p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
        <p className="text-xs font-bold text-amber-300">⚠ Publication is irreversible. Ensure Principal approval is obtained before releasing results to students.</p>
      </div>

      <div className="space-y-4">
        {results.map(r => (
          <div key={r.class} className={`glass-card rounded-2xl p-5 border ${r.published ? 'border-emerald-500/30 bg-emerald-500/5' : !r.approved ? 'opacity-60' : 'border-[hsl(var(--border))]'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-[hsl(var(--text-primary))]">{r.class} — {r.exam}</h3>
                  {r.published && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">✓ Published</span>}
                  {!r.approved && <span className="text-xs font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">⛔ Not Approved</span>}
                </div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{r.candidates} candidates</p>
              </div>
              {r.approved && !r.published && (
                <button
                  onClick={() => handlePublish(r.class)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  {publishing === r.class ? '⏳ Publishing...' : <><Send className="w-3.5 h-3.5" /> Publish Results</>}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Student Portal', icon: Eye, active: r.portal },
                { label: 'SMS Notification', icon: Bell, active: r.sms },
                { label: 'Email Notification', icon: Bell, active: r.email },
                { label: 'Parent App', icon: Users, active: r.portal },
              ].map(ch => (
                <div key={ch.label} className={`flex items-center gap-2 p-3 rounded-xl border ${ch.active ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[hsl(var(--border))]'}`}>
                  <ch.icon className={`w-4 h-4 ${ch.active ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`} />
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{ch.label}</p>
                    <p className={`text-[10px] font-bold ${ch.active ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`}>{ch.active ? 'Sent' : 'Pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
