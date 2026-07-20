'use client';

import { useState } from 'react';
import { Upload, Download, QrCode, ClipboardCheck, AlertTriangle, Layers } from 'lucide-react';

export default function BulkOperationsPage() {
  const [selectedOperation, setSelectedOperation] = useState<'import' | 'export' | 'ids'>('import');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Bulk Operations Center</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Execute bulk registrations, download roster templates, configure admission numbers, or export batches.</p>
      </div>

      <div className="glass-card p-1 flex gap-1 w-fit">
        {[
          { id: 'import', label: 'Bulk Import CSV' },
          { id: 'export', label: 'Export Batches' },
          { id: 'ids', label: 'Bulk ID Cards Generation' }
        ].map((op) => (
          <button
            key={op.id}
            onClick={() => setSelectedOperation(op.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedOperation === op.id
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {selectedOperation === 'import' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Import Student Rosters</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Upload student CSV sheet to populate the lifecycle system database. Ensure columns match the required template fields.</p>
              
              <div className="border border-dashed border-[hsl(var(--border))] p-8 rounded-xl text-center space-y-3">
                <Upload className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
                <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">Drag &amp; drop roster CSV file here</p>
                <button className="px-4 py-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-semibold text-[hsl(var(--text-secondary))]">Browse Files</button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <div className="text-xs text-[hsl(var(--text-secondary))]">
                  <p className="font-semibold text-[hsl(var(--text-primary))]">Required format template</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Includes header fields for DOB, name, parent phone, blood group.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>
            </div>
          )}

          {selectedOperation === 'export' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Export Batch Roster</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Roster Cohort</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                    <option>All Enrolled Students</option>
                    <option>Grade 9 Cohort</option>
                    <option>Grade 10 Cohort</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">File Format</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                    <option>Microsoft Excel (.xlsx)</option>
                    <option>Comma Separated (.csv)</option>
                  </select>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-95 transition-opacity">
                Generate &amp; Download Batch
              </button>
            </div>
          )}

          {selectedOperation === 'ids' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Bulk ID Card Generator</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Generate printable Student ID cards complete with barcode scanner tags and profile photos.</p>
              <button className="w-full py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4" /> Queue ID Cards Compilation Batch
              </button>
            </div>
          )}
        </div>

        {/* Validation side notes */}
        <div className="glass-card p-5 space-y-4 h-fit text-xs text-[hsl(var(--text-secondary))]">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">File Validation Checks</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[hsl(var(--text-primary))]">Duplicate Check</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Admission numbers will auto-generate if blank to avoid collisions.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[hsl(var(--text-primary))]">Status Mapping</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">By default, imported candidates are placed into "Admission Application" status.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
