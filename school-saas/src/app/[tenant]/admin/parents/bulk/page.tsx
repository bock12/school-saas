'use client';

import { useState } from 'react';
import { Upload, Download, QrCode, ClipboardCheck, AlertTriangle } from 'lucide-react';

export default function BulkOperationsPage() {
  const [selectedOperation, setSelectedOperation] = useState<'import' | 'link' | 'ids'>('import');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Bulk Operations Center</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Import parent CSV lists, link parent structures to student keys, or generate batch parent gate passes.</p>
      </div>

      <div className="glass-card p-1 flex gap-1 w-fit">
        {[
          { id: 'import', label: 'Import Parents CSV' },
          { id: 'link', label: 'Link Parents to Students' },
          { id: 'ids', label: 'Generate Gate Passes' }
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
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Import Parents CSV</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Upload parents CSV data sheet to populate the RMS database. Ensure headers match the template schema.</p>
              
              <div className="border border-dashed border-[hsl(var(--border))] p-8 rounded-xl text-center space-y-3">
                <Upload className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
                <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">Drag &amp; drop roster CSV file here</p>
                <button className="px-4 py-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-semibold text-[hsl(var(--text-secondary))]">Browse Files</button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <div className="text-xs text-[hsl(var(--text-secondary))]">
                  <p className="font-semibold text-[hsl(var(--text-primary))]">CSV Format Template</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Includes headers for legal name, phone, email, and occupation details.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>
            </div>
          )}

          {selectedOperation === 'link' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Bulk Link Relationships</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Upload a mapping spreadsheet file containing parent IDs and student IDs to establish links in bulk.</p>
              <div className="border border-dashed border-[hsl(var(--border))] p-8 rounded-xl text-center space-y-3">
                <Upload className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
                <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">Drag &amp; drop linking CSV file here</p>
                <button className="px-4 py-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-semibold text-[hsl(var(--text-secondary))]">Browse Files</button>
              </div>
            </div>
          )}

          {selectedOperation === 'ids' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Print Parent Gate Passes</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">Generate printable parents gate passes containing scanning QR identification codes.</p>
              <button className="w-full py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4" /> Queue Gate Passes Compilation Batch
              </button>
            </div>
          )}
        </div>

        <div className="glass-card p-5 space-y-4 h-fit text-xs text-[hsl(var(--text-secondary))]">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Database Checks</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[hsl(var(--text-primary))]">Audit Logs</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Linking actions create immediate security verification notifications on the parent portal accounts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
