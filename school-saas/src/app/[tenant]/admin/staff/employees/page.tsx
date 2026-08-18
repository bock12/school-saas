'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Users, Search, Phone, Mail, ChevronRight, Eye, LayoutGrid,
  List, Filter, Plus, UserPlus, Download, Building, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { HCMHeader } from '../_components/hcm-header';

const demoEmployeesList = [
  { id: '1', name: 'Mrs. Patricia Osei', position: 'Head of Admin', dept: 'Administration', email: 'p.osei@school.edu', phone: '+1 555-8941', status: 'Active', type: 'Full-Time', joined: 'Sep 2020' },
  { id: '2', name: 'Mr. Benjamin Asante', position: 'Senior Accountant', dept: 'Finance', email: 'b.asante@school.edu', phone: '+1 555-8942', status: 'Active', type: 'Full-Time', joined: 'Jan 2021' },
  { id: '3', name: 'Mr. John Doe', position: 'Head of Mathematics', dept: 'Mathematics', email: 'john.doe@school.edu', phone: '+1 555-8948', status: 'Active', type: 'Full-Time', joined: 'Sep 2020' },
  { id: '4', name: 'Mr. Kwame Darko', position: 'Bus Driver', dept: 'Transport', email: 'k.darko@school.edu', phone: '+1 555-8944', status: 'On Leave', type: 'Full-Time', joined: 'Mar 2022' },
  { id: '5', name: 'Dr. Raj Sharma', position: 'Physics Instructor', dept: 'Science & Chemistry', email: 'r.sharma@school.edu', phone: '+1 555-8945', status: 'Active', type: 'Full-Time', joined: 'Aug 2021' },
  { id: '6', name: 'Ms. Sarah Mensah', position: 'Lead Librarian', dept: 'Library & Media', email: 's.mensah@school.edu', phone: '+1 555-8946', status: 'Active', type: 'Part-Time', joined: 'Feb 2023' }
];

const DEPARTMENTS = ['All Departments', 'Administration', 'Finance', 'Mathematics', 'Science & Chemistry', 'Transport', 'Library & Media'];
const STATUSES = ['All Statuses', 'Active', 'On Leave'];

export default function EmployeesPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = demoEmployeesList.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                        emp.position.toLowerCase().includes(search.toLowerCase()) ||
                        emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === 'All Departments' || emp.dept === selectedDept;
    const matchStatus = selectedStatus === 'All Statuses' || emp.status === selectedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Employee Master Registry"
        subtitle="Unified directory of all academic teachers, administrative officers, and operational staff."
        badge={`${filtered.length} Employees Found`}
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Staff</span>
            </button>
          </div>
        }
      />

      {/* Responsive Filter & View Switcher Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search by name, position, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        {/* Dropdown Filters & View Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Table / Cards Switcher */}
          <div className="hidden sm:flex items-center bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))] p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'cards' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dual Layout: Card Grid & Table View */}
      {viewMode === 'cards' ? (
        /* Responsive Card Grid View (1 col mobile, 2 col tablet, 3-4 col desktop) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(emp => (
            <div
              key={emp.id}
              className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.5)] transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Card Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--accent))] font-black text-base shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[hsl(var(--text-primary))] truncate group-hover:text-[hsl(var(--accent))] transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] truncate mt-0.5">{emp.position}</p>
                    </div>
                  </div>
                </div>

                {/* Badges: Department & Status */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] flex items-center gap-1">
                    <Building className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                    {emp.dept}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    emp.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: 360 Profile link */}
              <Link
                href={`/admin/staff/${emp.id}`}
                className="w-full py-2 px-3 rounded-xl bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>360° Profile</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* Full Desktop Table View */
        <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                  {['Employee', 'Position', 'Department', 'Employment Type', 'Contact', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--accent))] font-bold text-xs shrink-0">
                          {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{emp.name}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Joined {emp.joined}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-medium whitespace-nowrap">{emp.position}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[11px] font-semibold">
                        {emp.dept}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{emp.type}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {emp.email}</p>
                      <p className="flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {emp.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        emp.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/staff/${emp.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-bold"
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
      )}
    </div>
  );
}
