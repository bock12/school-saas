'use client';

import { useState } from 'react';
import { FileText, Search, Download, ShieldCheck } from 'lucide-react';

const mockTranscripts = [
  { id: '1', name: 'Sarah Smith', code: 'TR-Smith-99201', activeYear: '2026/2027', verificationHash: 'sha256-88492d...' },
  { id: '2', name: 'Amara Johnson', code: 'TR-Johnson-88402', activeYear: '2026/2027', verificationHash: 'sha256-44929a...' }
];

export default function TranscriptsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockTranscripts.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Verified Academic Transcripts</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Compile comprehensive academic history transcripts containing verification keys for universities.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          Generate Transcript
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(row => (
          <div key={row.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-start gap-3 pb-3 border-b border-[hsl(var(--border))]">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{row.name}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Code: <code className="font-mono text-[hsl(var(--accent))]">{row.code}</code></p>
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-[hsl(var(--text-secondary))]">
              <p>Active Session: <span className="font-semibold text-[hsl(var(--text-primary))]">{row.activeYear}</span></p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Hash verification: <code className="font-mono text-[hsl(var(--text-tertiary))] truncate max-w-[150px]" title={row.verificationHash}>{row.verificationHash}</code></p>
            </div>

            <button className="w-full py-2 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary)/0.8)] transition-all flex items-center justify-center gap-1.5">
              <Download className="w-4 h-4" /> Download Official Transcript PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
