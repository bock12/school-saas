'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Search, Filter, Plus, Mail, Phone, MoreVertical, CheckCircle2,
  ChevronRight, Building, Award, Clock, LayoutGrid, Table as TableIcon,
  GraduationCap, Shield, UserPlus, Download, MessageSquare
} from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

interface Employee {
  id: string;
  name: string;
  avatar_initials: string;
  category: 'teaching' | 'support';
  position: string;
  department: string;
  employee_id: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave';
  type: string;
  // Category specific fields
  subjects?: string[];
  license?: string;
  periods?: number;
  shift?: string;
  zone?: string;
}

const mockStaffDirectory: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar_initials: 'JD',
    category: 'teaching',
    position: 'Head of Mathematics',
    department: 'Mathematics',
    employee_id: 'EMP-084920',
    email: 'john.doe@school.edu',
    phone: '+1 (555) 894-8820',
    status: 'Active',
    type: 'Full-Time',
    subjects: ['Advanced Calculus', 'Pure Mathematics (Gr 11-12)'],
    license: 'State Licensed (EDU-994820)',
    periods: 22,
  },
  {
    id: '2',
    name: 'Dr. Raj Sharma',
    avatar_initials: 'RS',
    category: 'teaching',
    position: 'Senior Physics Instructor',
    department: 'Science',
    employee_id: 'EMP-084921',
    email: 'raj.sharma@school.edu',
    phone: '+1 (555) 894-8821',
    status: 'Active',
    type: 'Full-Time',
    subjects: ['AP Physics C', 'Applied Mechanics'],
    license: 'State Licensed (EDU-482910)',
    periods: 20,
  },
  {
    id: '3',
    name: 'Mrs. Hannah Cole',
    avatar_initials: 'HC',
    category: 'teaching',
    position: 'English Literature Lead',
    department: 'Languages',
    employee_id: 'EMP-084922',
    email: 'hannah.cole@school.edu',
    phone: '+1 (555) 894-8822',
    status: 'Active',
    type: 'Full-Time',
    subjects: ['World Literature', 'Creative Writing'],
    license: 'State Licensed (EDU-110293)',
    periods: 18,
  },
  {
    id: '4',
    name: 'Patricia Osei',
    avatar_initials: 'PO',
    category: 'support',
    position: 'Head of Administration',
    department: 'Administration',
    employee_id: 'EMP-084923',
    email: 'patricia.osei@school.edu',
    phone: '+1 (555) 894-8823',
    status: 'On Leave',
    type: 'Full-Time',
    shift: '07:30 AM – 04:30 PM',
    zone: 'Admin Block (Room 102)',
  },
  {
    id: '5',
    name: 'Benjamin Asante',
    avatar_initials: 'BA',
    category: 'support',
    position: 'Senior Accountant & Bursar',
    department: 'Finance',
    employee_id: 'EMP-084924',
    email: 'benjamin.asante@school.edu',
    phone: '+1 (555) 894-8824',
    status: 'Active',
    type: 'Full-Time',
    shift: '08:00 AM – 05:00 PM',
    zone: 'Finance Office (Room 105)',
  },
  {
    id: '6',
    name: 'Kwame Darko',
    avatar_initials: 'KD',
    category: 'support',
    position: 'Head of Transport & Fleet',
    department: 'Transport',
    employee_id: 'EMP-084925',
    email: 'kwame.darko@school.edu',
    phone: '+1 (555) 894-8825',
    status: 'Active',
    type: 'Full-Time',
    shift: '06:00 AM – 03:00 PM',
    zone: 'Campus Depot & Garage',
  },
  {
    id: '7',
    name: 'Grace Taylor',
    avatar_initials: 'GT',
    category: 'support',
    position: 'Head Librarian & Resource Lead',
    department: 'Library',
    employee_id: 'EMP-084926',
    email: 'grace.taylor@school.edu',
    phone: '+1 (555) 894-8826',
    status: 'Active',
    type: 'Full-Time',
    shift: '08:00 AM – 04:30 PM',
    zone: 'Central Learning Resource Center',
  },
];

export default function UnifiedStaffDirectoryPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'teaching' | 'support'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredStaff = mockStaffDirectory.filter(emp => {
    const matchCategory = categoryFilter === 'all' || emp.category === categoryFilter;
    const matchDept = departmentFilter === 'All' || emp.department === departmentFilter;
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchDept && matchStatus && matchSearch;
  });

  const teachingCount = mockStaffDirectory.filter(s => s.category === 'teaching').length;
  const supportCount = mockStaffDirectory.filter(s => s.category === 'support').length;

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in pb-16">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Workforce & Staff Directory"
        subtitle="Comprehensive personnel directory with teaching allocations, support rosters, and 360° employee dossiers."
        badge="84 Active Records"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <Link
              href="/admin/staff/employees"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.25)] transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </Link>
          </div>
        }
      />

      {/* SEGMENT TOGGLE PILLS: All vs Teaching Faculty vs Support Staff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === 'all'
                ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Staff (84)</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('teaching')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === 'teaching'
                ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Teaching Faculty (48)</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('support')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === 'support'
                ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Support Staff (36)</span>
          </button>
        </div>

        {/* View Mode Toggle: Cards vs Table */}
        <div className="flex items-center gap-1 bg-[hsl(var(--bg-secondary))] p-1 rounded-xl border border-[hsl(var(--border))] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-[hsl(var(--accent))] text-white'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-[hsl(var(--accent))] text-white'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
            title="Dense Table View"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search by staff name, designation, department, employee ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          >
            <option value="All">All Departments</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="Languages">Languages</option>
            <option value="Administration">Administration</option>
            <option value="Finance">Finance</option>
            <option value="Transport">Transport</option>
            <option value="Library">Library</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: RESPONSIVE CARD GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredStaff.map((emp) => (
            <div
              key={emp.id}
              className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)] hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3.5">
                {/* Header: Avatar, Name, Status & Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-bold text-[hsl(var(--accent))] text-base shrink-0 group-hover:scale-105 transition-transform">
                      {emp.avatar_initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{emp.name}</h3>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {emp.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[hsl(var(--accent))] truncate mt-0.5">{emp.position}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    emp.category === 'teaching'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                  }`}>
                    {emp.category === 'teaching' ? 'Teaching' : 'Support'}
                  </span>
                </div>

                {/* Key Metadata Block */}
                <div className="space-y-1.5 text-xs text-[hsl(var(--text-tertiary))] pt-1">
                  <p className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                    <span>Dept: <strong className="text-[hsl(var(--text-secondary))]">{emp.department}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] bg-[hsl(var(--bg-tertiary))] px-1.5 py-0.5 rounded border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">
                      {emp.employee_id}
                    </span>
                    <span>• {emp.type}</span>
                  </p>
                </div>

                {/* Contextual Data: Teaching vs Support */}
                {emp.category === 'teaching' && emp.subjects && (
                  <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[hsl(var(--text-tertiary))]">Teaching Load</span>
                      <span className="font-bold text-[hsl(var(--accent))]">{emp.periods} Periods / wk</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {emp.subjects.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-secondary))] font-medium border border-[hsl(var(--border))]">
                          {s}
                        </span>
                      ))}
                    </div>
                    {emp.license && (
                      <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                        <Award className="w-3 h-3" /> {emp.license}
                      </p>
                    )}
                  </div>
                )}

                {emp.category === 'support' && (
                  <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-1 text-xs">
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                      Shift: <strong className="text-[hsl(var(--text-secondary))]">{emp.shift}</strong>
                    </p>
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                      Location: <strong className="text-[hsl(var(--text-secondary))]">{emp.zone}</strong>
                    </p>
                  </div>
                )}

                {/* Contact Coordinates */}
                <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-xs text-[hsl(var(--text-tertiary))]">
                  <a href={`mailto:${emp.email}`} className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1 truncate max-w-[170px]" title={emp.email}>
                    <Mail className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </a>
                  <a href={`tel:${emp.phone}`} className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{emp.phone.split(' ')[1]}</span>
                  </a>
                </div>
              </div>

              {/* Card Footer: 360 Profile CTA */}
              <Link
                href={`/admin/staff/${emp.id}`}
                className="w-full py-2 rounded-xl bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--accent))] hover:text-white border border-[hsl(var(--border))] hover:border-transparent text-xs font-bold text-[hsl(var(--text-primary))] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View 360° Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: DENSE RESPONSIVE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass-card overflow-hidden rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                  {['Staff Member', 'Category', 'Role & Dept', 'Staff ID', 'Contact', 'Contextual Details', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filteredStaff.map(emp => (
                  <tr key={emp.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-bold text-[hsl(var(--accent))] text-xs shrink-0">
                          {emp.avatar_initials}
                        </div>
                        <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{emp.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        emp.category === 'teaching'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                      }`}>
                        {emp.category === 'teaching' ? 'Teaching' : 'Support'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-[hsl(var(--text-primary))]">{emp.position}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{emp.department}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[hsl(var(--accent))] font-bold whitespace-nowrap">
                      {emp.employee_id}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-[hsl(var(--text-secondary))]">{emp.email}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{emp.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {emp.category === 'teaching' ? (
                        <div>
                          <p className="text-emerald-400 font-bold text-[10px]">{emp.license}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{emp.periods} Periods / wk</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[hsl(var(--text-secondary))] font-medium text-[10px]">{emp.shift}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{emp.zone}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        emp.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/admin/staff/${emp.id}`}
                        className="text-xs font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
                      >
                        360° Profile <ChevronRight className="w-3 h-3" />
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
