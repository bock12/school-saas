'use client';

import { useState } from 'react';
import { Upload, Download, QrCode, ClipboardCheck, AlertTriangle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

export default function StaffBulkOperationsPage() {
  const [selectedOperation, setSelectedOperation] = useState<'import' | 'ids'>('import');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Bulk Operations Center"
        subtitle="Batch import employee rosters via CSV, configure batch system roles, or execute printable staff ID cards batches."
        badge="Batch Engine Ready"
      />

      {/* Operation Tabs */}
      <div className="flex items-center gap-1 bg-[hsl(var(--bg-secondary))] p-1 rounded-2xl border border-[hsl(var(--border))] w-fit">
        {[
          { id: 'import', label: 'Import Staff CSV', icon: FileSpreadsheet },
          { id: 'ids', label: 'Bulk ID Cards Generator', icon: QrCode },
        ].map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setSelectedOperation(op.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedOperation === op.id
                ? 'bg-[hsl(var(--accent))] text-white shadow-md shadow-[hsl(var(--accent)/0.25)]'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <op.icon className="w-4 h-4" />
            <span>{op.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {selectedOperation === 'import' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-5 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Import Staff CSV Spreadsheet</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                  Upload an Excel or CSV file containing staff records. The system will automatically validate columns and insert employee entries.
                </p>
              </div>

              <div className="border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] p-8 sm:p-12 rounded-2xl text-center space-y-3 transition-colors bg-[hsl(var(--bg-tertiary)/0.4)]">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[hsl(var(--text-primary))]">Drag &amp; drop your CSV sheet here</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Supports .csv, .xlsx files up to 25MB</p>
                </div>
                <button type="button" className="px-4 py-2 bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl text-xs font-bold text-[hsl(var(--text-primary))] transition-colors shadow-sm">
                  Browse File
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <div>
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Download Standard Roster Template</p>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">
                    Includes required column headers: full_name, email, phone, position, department, salary_grade.
                  </p>
                </div>
                <button type="button" className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors shrink-0">
                  <Download className="w-3.5 h-3.5" /> Template
                </button>
              </div>
            </div>
          )}

          {selectedOperation === 'ids' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-5 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Batch Staff ID Card Generation</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                  Queue bulk generation of high-resolution printable ID cards formatted with school logo, staff photo, QR check-in code, and emergency contact details.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[hsl(var(--text-primary))]">Target Staff Roster</span>
                  <span className="text-[hsl(var(--accent))] font-bold">84 Cards</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[hsl(var(--text-tertiary))]">Card Format</span>
                  <span className="text-[hsl(var(--text-secondary))] font-medium">Standard CR80 (85.6mm × 54mm)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[hsl(var(--text-tertiary))]">Barcode Type</span>
                  <span className="text-[hsl(var(--text-secondary))] font-medium">QR Code + Code-128</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-[hsl(var(--accent)/0.25)] transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Generate &amp; Download 84 ID Cards (PDF)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Bulk Safety &amp; Compliance
            </h3>
            <div className="space-y-3 text-xs text-[hsl(var(--text-secondary))]">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">Role Mapping Safeguard</p>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5 leading-snug">
                    Newly imported employees do not receive portal login access until role assignment is approved by an administrator.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-[hsl(var(--border))]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">Unique ID Enforcement</p>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5 leading-snug">
                    Duplicates matching existing employee national IDs or email addresses will be flagged before DB insertion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
