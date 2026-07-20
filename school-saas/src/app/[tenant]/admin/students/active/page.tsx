'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Search, Mail, Phone, BookOpen, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

const demoActiveStudents = [
  { id: '1', first_name: 'Amara', last_name: 'Johnson', admission_number: 'STU-001', email: 'amara@school.edu', className: 'Grade 10', sectionName: 'A', guardian_name: 'Patricia Johnson', guardian_phone: '+1 555-0101' },
  { id: '2', first_name: 'David', last_name: 'Okafor', admission_number: 'STU-002', email: 'david@school.edu', className: 'Grade 11', sectionName: 'B', guardian_name: 'Emeka Okafor', guardian_phone: '+1 555-0102' },
  { id: '3', first_name: 'Sarah', last_name: 'Williams', admission_number: 'STU-003', email: 'sarah@school.edu', className: 'Grade 7', sectionName: 'A', guardian_name: 'Linda Williams', guardian_phone: '+1 555-0103' },
  { id: '4', first_name: 'Michael', last_name: 'Chen', admission_number: 'STU-004', email: 'michael@school.edu', className: 'Grade 10', sectionName: 'C', guardian_name: 'Wei Chen', guardian_phone: '+1 555-0104' },
];

export default function ActiveStudentsPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [search, setSearch] = useState('');

  const filtered = demoActiveStudents.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Active Students Database</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Directory of all students currently enrolled and active.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search active database..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student', 'Admission #', 'Class/Stream', 'Guardian', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Mail className="w-3 h-3 flex-shrink-0" />{student.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{student.admission_number}</code>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /> {student.className} — {student.sectionName}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-[hsl(var(--text-secondary))]">{student.guardian_name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Phone className="w-3 h-3" />{student.guardian_phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" /> 360° Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
