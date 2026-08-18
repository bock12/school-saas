'use client';

import { useState } from 'react';
import { FileText, Search, Download, Upload, Filter, Building } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockStaffDocs = [
  { id: '1', name: 'Employment Contract - John Doe.pdf', staff: 'John Doe', category: 'Contract', size: '1.4 MB', date: 'Aug 18, 2020', dept: 'Mathematics' },
  { id: '2', name: 'MSc Degree Certificate.pdf', staff: 'John Doe', category: 'Academic Cert', size: '2.1 MB', date: 'Aug 10, 2020', dept: 'Mathematics' },
  { id: '3', name: 'Police Background Check.pdf', staff: 'Benjamin Asante', category: 'Security Clearance', size: '1.1 MB', date: 'Jan 15, 2021', dept: 'Finance' },
  { id: '4', name: 'Teacher Certification License.pdf', staff: 'Dr. Raj Sharma', category: 'Academic Cert', size: '1.8 MB', date: 'Aug 22, 2021', dept: 'Science' },
  { id: '5', name: 'Annual Medical Fitness Form.pdf', staff: 'Kwame Darko', category: 'Medical Report', size: '890 KB', date: 'Mar 12, 2022', dept: 'Transport' },
];

export default function StaffDocumentsPage() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const categories = ['All', 'Contract', 'Academic Cert', 'Security Clearance', 'Medical Report'];

  const filtered = mockStaffDocs.filter(d => {
    const matchCat = selectedCat === 'All' || d.category === selectedCat;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.staff.toLowerCase().includes(search.toLowerCase()) ||
                        d.dept.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Digital Personnel Document Vault"
        subtitle="Secure document repository for signed employment contracts, degree certificates, background checks, and ID proofs."
        badge={`${mockStaffDocs.length} Verified Documents`}
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        }
      />

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              selectedCat === cat
                ? 'bg-[hsl(var(--accent))] text-white shadow-md shadow-[hsl(var(--accent)/0.25)]'
                : 'bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search document vault by filename, employee, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.5)] transition-all duration-300 shadow-sm flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[hsl(var(--accent)/0.12)] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] shrink-0 shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate" title={doc.name}>
                  {doc.name}
                </p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] truncate mt-0.5">
                  Staff: <strong className="text-[hsl(var(--text-secondary))]">{doc.staff}</strong> • {doc.dept}
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] block w-fit mt-2">
                  {doc.category}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
              <span>{doc.size} • {doc.date}</span>
              <button type="button" className="flex items-center gap-1 text-[hsl(var(--accent))] font-bold hover:underline">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
