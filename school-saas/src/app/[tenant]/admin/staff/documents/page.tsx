'use client';

import { useState } from 'react';
import { FileText, Search, Download, Upload } from 'lucide-react';

const mockStaffDocs = [
  { name: 'Employment Contract - John Doe.pdf', staff: 'John Doe', category: 'Contract', size: '1.4 MB' },
  { name: 'MSc Degree Certificate.pdf', staff: 'John Doe', category: 'Academic Cert', size: '2.1 MB' },
  { name: 'Police Background Check.pdf', staff: 'Benjamin Asante', category: 'Security Clearance', size: '1.1 MB' }
];

export default function StaffDocumentsPage() {
  const [selectedCat, setSelectedCat] = useState('All');
  const categories = ['All', 'Contract', 'Academic Cert', 'Security Clearance', 'Medical Report'];

  const filtered = selectedCat === 'All'
    ? mockStaffDocs
    : mockStaffDocs.filter(d => d.category === selectedCat);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Digital Personnel Vault</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Access verified staff contracts, academic credentials, and police background clearance records.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCat === cat
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, idx) => (
          <div key={idx} className="glass-card p-5 space-y-4 flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate" title={doc.name}>{doc.name}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] truncate">Employee: {doc.staff}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] block w-fit mt-1.5">{doc.category}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
              <span>{doc.size}</span>
              <button className="flex items-center gap-1 text-[hsl(var(--accent))] hover:underline">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
