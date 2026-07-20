'use client';

import { useState, useRef, useTransition } from 'react';
import { Upload, X, FileText, ChevronDown, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { bulkImportStaff } from '@/app/actions/tenant';
import { cn } from '@/lib/utils';

interface School { id: string; name: string; slug: string; }

interface BulkImportModalProps {
  orgId: string;
  orgSlug: string;
  schools: School[];
  onClose: () => void;
  onSuccess: () => void;
}

type RowResult = { email: string; success: boolean; error?: string };

const ROLES = ['teacher', 'coordinator', 'department_head', 'school_admin', 'accountant', 'librarian', 'counselor', 'nurse'];

export function BulkImportModal({ orgId, orgSlug, schools, onClose, onSuccess }: BulkImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [defaultSchoolId, setDefaultSchoolId] = useState(schools[0]?.id ?? '');
  const [defaultRole, setDefaultRole] = useState('teacher');
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'result'>('upload');
  const [results, setResults] = useState<RowResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;
    const hdrs = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line =>
      Object.fromEntries(hdrs.map((h, i) => [h, (line.split(',')[i] ?? '').trim().replace(/"/g, '')]))
    );
    setHeaders(hdrs);
    setRows(data);
    // Auto-map common field names
    const autoMap: Record<string, string> = {};
    hdrs.forEach(h => {
      const l = h.toLowerCase();
      if (l.includes('email')) autoMap.email = h;
      if (l.includes('name') && !l.includes('first') && !l.includes('last')) autoMap.name = h;
      if (l === 'first name' || l === 'firstname') autoMap.firstName = h;
      if (l === 'last name' || l === 'lastname') autoMap.lastName = h;
      if (l.includes('dept') || l.includes('department')) autoMap.department = h;
      if (l.includes('role')) autoMap.role = h;
    });
    setMapping(autoMap);
    setStep('map');
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.type.includes('csv'))) handleFile(f);
  };

  const getMapped = (row: Record<string, string>, key: string) => {
    const col = mapping[key];
    if (col && row[col]) return row[col];
    if (key === 'name' && mapping.firstName && mapping.lastName) {
      return `${row[mapping.firstName] ?? ''} ${row[mapping.lastName] ?? ''}`.trim();
    }
    return '';
  };

  const handleImport = () => {
    const school = schools.find(s => s.id === defaultSchoolId);
    const importRows = rows.map(row => ({
      email: getMapped(row, 'email'),
      name: getMapped(row, 'name') || 'Staff Member',
      role: getMapped(row, 'role') || defaultRole,
      tenantId: defaultSchoolId || orgId,
      tenantSlug: school?.slug ?? orgSlug,
      department: getMapped(row, 'department') || undefined,
    })).filter(r => r.email);

    startTransition(async () => {
      const res = await bulkImportStaff(importRows);
      setResults(res);
      setStep('result');
    });
  };

  const downloadTemplate = () => {
    const csv = 'name,email,role,department\nJane Smith,jane@school.edu,teacher,Sciences\nJohn Doe,john@school.edu,coordinator,Administration';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'staff_import_template.csv'; a.click();
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-card animate-fade-in-scale overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.12)] flex items-center justify-center">
              <Upload className="w-4 h-4 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Bulk Import Staff</h3>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Upload a CSV file to add multiple staff members</p>
            </div>
          </div>
          {/* Steps indicator */}
          <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))]">
            {(['upload', 'map', 'preview', 'result'] as const).map((s, i) => (
              <span key={s} className={cn('flex items-center gap-1',
                step === s ? 'text-[hsl(var(--accent))] font-semibold' : '')}>
                <span className={cn('w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold',
                  step === s ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))]')}>{i + 1}</span>
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {i < 3 && <span className="text-[hsl(var(--border))]">›</span>}
              </span>
            ))}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                  dragging
                    ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--bg-tertiary)/0.4)]'
                )}
              >
                <Upload className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Drop your CSV file here</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">or click to browse — max 100 rows</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
              <button onClick={downloadTemplate}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                <Download className="w-3.5 h-3.5" /> Download CSV Template
              </button>
            </div>
          )}

          {/* Step 2: Map columns */}
          {step === 'map' && (
            <div className="space-y-5">
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                Found <strong className="text-[hsl(var(--text-primary))]">{rows.length} rows</strong>. Map your CSV columns to staff fields:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'email', label: 'Email *', required: true },
                  { key: 'name', label: 'Full Name', required: false },
                  { key: 'firstName', label: 'First Name (alt)', required: false },
                  { key: 'lastName', label: 'Last Name (alt)', required: false },
                  { key: 'department', label: 'Department', required: false },
                  { key: 'role', label: 'Role', required: false },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 block">{label}</label>
                    <div className="relative">
                      <select value={mapping[key] ?? ''} onChange={e => setMapping(p => ({ ...p, [key]: e.target.value }))}
                        className={cn(inputCls, 'pr-8 appearance-none cursor-pointer')}>
                        <option value="">-- Skip --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <div>
                  <label className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 block">Default School</label>
                  <div className="relative">
                    <select value={defaultSchoolId} onChange={e => setDefaultSchoolId(e.target.value)} className={cn(inputCls, 'pr-8 appearance-none cursor-pointer')}>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 block">Default Role (if CSV lacks role)</label>
                  <div className="relative">
                    <select value={defaultRole} onChange={e => setDefaultRole(e.target.value)} className={cn(inputCls, 'pr-8 appearance-none cursor-pointer')}>
                      {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] pointer-events-none" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                ⚠ Invitation emails will be sent to all imported staff. They must set their own password before logging in.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep('upload')} className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">← Back</button>
                <button onClick={() => setStep('preview')} disabled={!mapping.email}
                  className="flex-1 py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all">
                  Preview Data →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(var(--text-secondary))]">Preview of first 10 rows:</p>
              <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
                <table className="w-full text-xs">
                  <thead className="bg-[hsl(var(--bg-tertiary))]">
                    <tr>
                      {['Email', 'Name', 'Role', 'Department'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-[hsl(var(--text-secondary))]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                    {rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)]">
                        <td className="px-3 py-2 text-[hsl(var(--text-primary))]">{getMapped(row, 'email') || <span className="text-red-400">—missing—</span>}</td>
                        <td className="px-3 py-2 text-[hsl(var(--text-secondary))]">{getMapped(row, 'name') || '—'}</td>
                        <td className="px-3 py-2 text-[hsl(var(--text-secondary))]">{getMapped(row, 'role') || defaultRole}</td>
                        <td className="px-3 py-2 text-[hsl(var(--text-secondary))]">{getMapped(row, 'department') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 10 && <p className="text-[11px] text-[hsl(var(--text-tertiary))] text-center">…and {rows.length - 10} more rows</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep('map')} className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">← Back</button>
                <button onClick={handleImport} disabled={isPending}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Importing {rows.length} staff…</> : `Import ${rows.length} Staff Members`}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Result */}
          {step === 'result' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-emerald-400">{successCount}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">Successfully imported</p>
                </div>
                <div className={cn('p-4 rounded-xl border text-center', failCount > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))]')}>
                  <AlertCircle className={cn('w-6 h-6 mx-auto mb-1', failCount > 0 ? 'text-red-400' : 'text-[hsl(var(--text-tertiary))]')} />
                  <p className={cn('text-xl font-black', failCount > 0 ? 'text-red-400' : 'text-[hsl(var(--text-tertiary))]')}>{failCount}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">Failed</p>
                </div>
              </div>

              {failCount > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {results.filter(r => !r.success).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="text-[hsl(var(--text-primary))] font-medium">{r.email}</span>
                      <span className="text-red-400 ml-auto">{r.error}</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => { onSuccess(); onClose(); }}
                className="w-full py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-semibold hover:opacity-90 transition-all">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
