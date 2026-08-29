'use client';

import { useState, useMemo } from 'react';
import {
  UserPlus, Clock, CheckCircle2, XCircle, FileText, Search, Filter,
  ArrowRight, MoreHorizontal, Eye, Edit2, Calendar, Users, Award,
  GraduationCap, Download, Check, X, ShieldCheck, Sparkles, Building2,
  Phone, Mail, MapPin, Tag, ExternalLink
} from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  level: 'Pre-Primary' | 'Primary' | 'JSS' | 'SSS' | 'TVET' | 'Tertiary';
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  appliedDate: string;
  status: 'pending' | 'under_review' | 'interview_scheduled' | 'approved' | 'enrolled' | 'rejected';
  dob: string;
  nin?: string;
  address: string;
  city: string;
  previousSchool?: string;
  // Sierra Leone Exam Metrics
  examType?: 'NPSE' | 'BECE' | 'WASSCE' | 'TVET';
  examIndexNo?: string;
  npseScore?: number; // e.g. 274
  becePasses?: number; // e.g. 8
  beceStream?: 'Science' | 'Arts' | 'Commercial' | 'Technical';
  wassceCredits?: number; // e.g. 6
  scratchCardPin?: string;
  documentsCount: number;
  documentsVerified: boolean;
}

const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: '1',
    name: 'Amara Kamara',
    level: 'JSS',
    grade: 'JSS 1',
    parentName: 'Mrs. Rachel Kamara',
    parentPhone: '+232 76 112 233',
    parentEmail: 'rachel.kamara@gmail.com',
    appliedDate: 'Aug 24, 2026',
    status: 'pending',
    dob: '2014-03-12',
    nin: 'NCRA-849201-14',
    address: '12 Sanders Street, Central Freetown',
    city: 'Freetown',
    previousSchool: 'St. Edwards Primary School',
    examType: 'NPSE',
    examIndexNo: '102948271',
    npseScore: 278,
    documentsCount: 4,
    documentsVerified: true,
  },
  {
    id: '2',
    name: 'David Fornah',
    level: 'SSS',
    grade: 'SSS 1',
    parentName: 'Mr. Emmanuel Fornah',
    parentPhone: '+232 78 445 566',
    parentEmail: 'efornah@yahoo.com',
    appliedDate: 'Aug 22, 2026',
    status: 'under_review',
    dob: '2011-08-05',
    address: '44 Wilkinson Road',
    city: 'Freetown',
    previousSchool: 'Albert Academy JSS',
    examType: 'BECE',
    examIndexNo: '001928374',
    becePasses: 8,
    beceStream: 'Science',
    documentsCount: 3,
    documentsVerified: false,
  },
  {
    id: '3',
    name: 'Fatmata Sesay',
    level: 'SSS',
    grade: 'SSS 1',
    parentName: 'Dr. Alimamy Sesay',
    parentPhone: '+232 77 889 900',
    parentEmail: 'dr.sesay@clinic.sl',
    appliedDate: 'Aug 20, 2026',
    status: 'approved',
    dob: '2011-11-22',
    address: '8 Signal Hill',
    city: 'Freetown',
    previousSchool: 'Annie Walsh Memorial School',
    examType: 'BECE',
    examIndexNo: '002819401',
    becePasses: 7,
    beceStream: 'Arts',
    documentsCount: 4,
    documentsVerified: true,
  },
  {
    id: '4',
    name: 'Michael Bangura',
    level: 'JSS',
    grade: 'JSS 1',
    parentName: 'Mr. Abu Bangura',
    parentPhone: '+232 88 332 211',
    parentEmail: 'abu.bangura@gmail.com',
    appliedDate: 'Aug 18, 2026',
    status: 'approved',
    dob: '2014-01-30',
    address: '29 Kissy Road',
    city: 'Freetown',
    previousSchool: 'Holy Trinity Primary School',
    examType: 'NPSE',
    examIndexNo: '109283719',
    npseScore: 264,
    documentsCount: 4,
    documentsVerified: true,
  },
  {
    id: '5',
    name: 'Mariama Turay',
    level: 'Primary',
    grade: 'Class 1',
    parentName: 'Mrs. Hawa Turay',
    parentPhone: '+232 30 556 677',
    parentEmail: 'hawa.turay@gmail.com',
    appliedDate: 'Aug 15, 2026',
    status: 'enrolled',
    dob: '2020-05-14',
    address: '15 Lumley Beach Road',
    city: 'Freetown',
    documentsCount: 3,
    documentsVerified: true,
  },
  {
    id: '6',
    name: 'Sahr Yamba',
    level: 'TVET',
    grade: 'NTC Level 1',
    parentName: 'Mr. Tamba Yamba',
    parentPhone: '+232 79 123 987',
    parentEmail: 'tamba.yamba@gmail.com',
    appliedDate: 'Aug 10, 2026',
    status: 'approved',
    dob: '2009-02-14',
    address: '3 Bo Road, Kenema',
    city: 'Kenema',
    examType: 'TVET',
    documentsCount: 3,
    documentsVerified: true,
  },
  {
    id: '7',
    name: 'Ibrahim Mansaray',
    level: 'Tertiary',
    grade: 'Year 1 (Freshman)',
    parentName: 'Alhaji Mansaray',
    parentPhone: '+232 76 998 877',
    parentEmail: 'alhajimansaray@gmail.com',
    appliedDate: 'Aug 08, 2026',
    status: 'under_review',
    dob: '2007-09-18',
    address: '14 Regent Road',
    city: 'Freetown',
    examType: 'WASSCE',
    examIndexNo: '5019283719',
    wassceCredits: 6,
    documentsCount: 4,
    documentsVerified: true,
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Pending Review', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Eye },
  interview_scheduled: { label: 'Interview Set', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: Calendar },
  approved: { label: 'Approved / Placed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  enrolled: { label: 'Enrolled in SIS', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Users },
  rejected: { label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

export default function AdmissionsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | 'Pre-Primary' | 'Primary' | 'JSS' | 'SSS' | 'TVET' | 'Tertiary'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // New Application Modal
  const [isAddingApplicant, setIsAddingApplicant] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    level: 'JSS' as Applicant['level'],
    grade: 'JSS 1',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    npseScore: 250,
    becePasses: 7,
    beceStream: 'Science' as Applicant['beceStream'],
    address: 'Freetown',
  });

  const filtered = useMemo(() => {
    return applicants.filter(app => {
      const matchSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentPhone.includes(searchTerm) ||
        (app.examIndexNo && app.examIndexNo.includes(searchTerm));
      const matchLevel = levelFilter === 'All' || app.level === levelFilter;
      const matchStatus = statusFilter === 'All' || app.status === statusFilter;
      return matchSearch && matchLevel && matchStatus;
    });
  }, [applicants, searchTerm, levelFilter, statusFilter]);

  const stageCounts = useMemo(() => {
    return {
      total: applicants.length,
      pending: applicants.filter(a => a.status === 'pending').length,
      under_review: applicants.filter(a => a.status === 'under_review').length,
      approved: applicants.filter(a => a.status === 'approved').length,
      enrolled: applicants.filter(a => a.status === 'enrolled').length,
    };
  }, [applicants]);

  const handleUpdateStatus = (id: string, newStatus: Applicant['status']) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (selectedApplicant?.id === id) {
      setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleUpdateStream = (id: string, stream: Applicant['beceStream']) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, beceStream: stream } : a));
    if (selectedApplicant?.id === id) {
      setSelectedApplicant(prev => prev ? { ...prev, beceStream: stream } : null);
    }
  };

  const handleCreateApplicant = () => {
    if (!newAppForm.name.trim() || !newAppForm.parentName.trim()) return;
    const newApp: Applicant = {
      id: `app-${Date.now()}`,
      name: newAppForm.name,
      level: newAppForm.level,
      grade: newAppForm.grade,
      parentName: newAppForm.parentName,
      parentPhone: newAppForm.parentPhone || '+232 76 000 000',
      parentEmail: newAppForm.parentEmail || 'guardian@email.com',
      appliedDate: 'Just now',
      status: 'pending',
      dob: '2013-05-10',
      address: newAppForm.address,
      city: 'Freetown',
      examType: newAppForm.level === 'JSS' ? 'NPSE' : newAppForm.level === 'SSS' ? 'BECE' : undefined,
      npseScore: newAppForm.level === 'JSS' ? newAppForm.npseScore : undefined,
      becePasses: newAppForm.level === 'SSS' ? newAppForm.becePasses : undefined,
      beceStream: newAppForm.level === 'SSS' ? newAppForm.beceStream : undefined,
      documentsCount: 3,
      documentsVerified: false,
    };

    setApplicants(prev => [newApp, ...prev]);
    setIsAddingApplicant(false);
    setNewAppForm({
      name: '',
      level: 'JSS',
      grade: 'JSS 1',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      npseScore: 250,
      becePasses: 7,
      beceStream: 'Science',
      address: 'Freetown',
    });
  };

  const handleExportCSV = () => {
    let csv = 'ID,Applicant Name,Level,Grade,Exam Type,Score / Passes,Stream,Parent Name,Phone,Email,Status\n';
    filtered.forEach(a => {
      const score = a.npseScore ? `${a.npseScore}/300` : a.becePasses ? `${a.becePasses} Passes` : a.wassceCredits ? `${a.wassceCredits} Credits` : 'N/A';
      csv += `"${a.id}","${a.name}","${a.level}","${a.grade}","${a.examType || 'N/A'}","${score}","${a.beceStream || 'N/A'}","${a.parentName}","${a.parentPhone}","${a.parentEmail}","${a.status}"\n`;
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `admissions_mbsse_registry_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              MBSSE & WAEC Standard Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <GraduationCap className="w-8 h-8 text-[hsl(var(--accent))]" />
            National Admissions & Placement Hub
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[hsl(var(--text-secondary))]">
            Manage student applications under the Sierra Leone 6-3-3-4 system with automated NPSE/BECE/WASSCE validation and stream allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export MBSSE Register
          </button>

          <button
            type="button"
            onClick={() => setIsAddingApplicant(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" />
            Direct Registration
          </button>
        </div>
      </div>

      {/* Pipeline Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-tertiary))]">Total Lodged</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{stageCounts.total}</p>
          <span className="text-[10px] text-blue-400 font-semibold">Across all 6 tiers</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border text-center space-y-1 border-amber-500/20 bg-amber-500/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pending Review</span>
          <p className="text-2xl font-black text-amber-400">{stageCounts.pending}</p>
          <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold">Awaiting credential audit</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border text-center space-y-1 border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Approved & Placed</span>
          <p className="text-2xl font-black text-emerald-400">{stageCounts.approved}</p>
          <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold">Stream allocated</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border text-center space-y-1 border-purple-500/20 bg-purple-500/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Enrolled into SIS</span>
          <p className="text-2xl font-black text-purple-400">{stageCounts.enrolled}</p>
          <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold">Active roster</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-card p-4 rounded-3xl space-y-4">
        {/* Tier Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[hsl(var(--border))]">
          {(['All', 'Pre-Primary', 'Primary', 'JSS', 'SSS', 'TVET', 'Tertiary'] as const).map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                levelFilter === lvl
                  ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] shadow-sm'
                  : 'bg-[hsl(var(--bg-tertiary)/0.4)] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              {lvl === 'All' ? 'All Educational Levels' : lvl}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search by student name, guardian, phone number, or WAEC index..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
          >
            <option value="All">All Pipeline Stages</option>
            <option value="pending">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="interview_scheduled">Interview Set</option>
            <option value="approved">Approved / Placed</option>
            <option value="enrolled">Enrolled in SIS</option>
            <option value="rejected">Declined</option>
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="glass-card overflow-hidden rounded-3xl border border-[hsl(var(--border))]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                <th className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-5 py-4">Applicant</th>
                <th className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-4 py-4">Tier & Class</th>
                <th className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-4 py-4">National Exam Metrics</th>
                <th className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-4 py-4">Guardian Contacts</th>
                <th className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-4 py-4">Documents</th>
                <th className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-4 py-4">Stage Status</th>
                <th className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.4)] text-xs">
              {filtered.map(app => {
                const cfg = statusConfig[app.status] || statusConfig.pending;
                const Icon = cfg.icon;

                return (
                  <tr key={app.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.25)] transition-colors">
                    {/* Applicant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-blue-500/20 text-[hsl(var(--accent))] flex items-center justify-center font-black text-sm shrink-0 border border-[hsl(var(--accent)/0.2)]">
                          {app.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{app.name}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1">
                            <span>DOB: {app.dob}</span>
                            {app.nin && <span className="text-[hsl(var(--accent))] font-mono font-semibold">· {app.nin}</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Level & Grade */}
                    <td className="px-4 py-4">
                      <span className="font-bold text-[hsl(var(--text-primary))] block">{app.grade}</span>
                      <span className="text-[10px] font-black uppercase text-[hsl(var(--text-tertiary))]">{app.level} Tier</span>
                    </td>

                    {/* SL National Exam Score */}
                    <td className="px-4 py-4">
                      {app.level === 'JSS' && app.npseScore && (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                            app.npseScore >= 230 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            <Award className="w-3 h-3" /> NPSE: {app.npseScore}/300
                          </span>
                          <span className="text-[10px] text-[hsl(var(--text-tertiary))] block font-mono">Index: {app.examIndexNo || 'Verified'}</span>
                        </div>
                      )}

                      {app.level === 'SSS' && app.becePasses && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            BECE: {app.becePasses} Passes
                          </span>
                          <span className="text-[10px] font-black text-purple-400 block">Stream: {app.beceStream || 'Science'}</span>
                        </div>
                      )}

                      {app.level === 'Tertiary' && app.wassceCredits && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            WASSCE: {app.wassceCredits} Credits
                          </span>
                        </div>
                      )}

                      {app.level === 'Pre-Primary' || app.level === 'Primary' || app.level === 'TVET' ? (
                        <span className="text-[11px] text-[hsl(var(--text-tertiary))] font-medium">
                          {app.level === 'TVET' ? 'Trade Direct Entry' : 'Age Eligibility Verified'}
                        </span>
                      ) : null}
                    </td>

                    {/* Guardian */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-[hsl(var(--text-primary))]">{app.parentName}</p>
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))] font-mono">{app.parentPhone}</p>
                    </td>

                    {/* Documents */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[hsl(var(--accent))]" />
                        <span className="font-bold text-[hsl(var(--text-secondary))]">{app.documentsCount} Docs</span>
                        {app.documentsVerified && (
                          <span title="All documents verified">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedApplicant(app)}
                        className="px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[hsl(var(--text-tertiary))]">
                    No applicants found matching this filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Inspection & Stream Allocation Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl glass-card p-6 md:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-black text-lg flex items-center justify-center border border-[hsl(var(--accent)/0.3)]">
                  {selectedApplicant.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{selectedApplicant.name}</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">
                    Applying for <strong>{selectedApplicant.grade}</strong> · {selectedApplicant.level} Tier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="p-2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sierra Leone Exam Audit Card */}
            {selectedApplicant.level === 'JSS' && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> National Primary School Examination (NPSE) Audit
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    {selectedApplicant.npseScore && selectedApplicant.npseScore >= 230 ? '✓ Exceeds Cutoff' : 'Below Cutoff'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Aggregate Score</span>
                    <span className="font-black text-lg text-[hsl(var(--text-primary))]">{selectedApplicant.npseScore} / 300</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">WAEC Index Number</span>
                    <span className="font-mono font-bold text-[hsl(var(--text-primary))]">{selectedApplicant.examIndexNo || '102948271'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Primary School</span>
                    <span className="font-bold text-[hsl(var(--text-primary))]">{selectedApplicant.previousSchool || 'St. Edwards Primary'}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedApplicant.level === 'SSS' && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> BECE Results & Senior Secondary Stream Placement
                  </span>
                  <span className="text-xs font-black text-emerald-400">✓ 8 Subject Passes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-tertiary))] block mb-1">
                      Assigned Academic Stream
                    </label>
                    <select
                      value={selectedApplicant.beceStream || 'Science'}
                      onChange={e => handleUpdateStream(selectedApplicant.id, e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-black text-[hsl(var(--accent))] focus:outline-none"
                    >
                      <option value="Science">🧪 Pure Science (Physics, Chem, Bio, Further Maths)</option>
                      <option value="Arts">🏛️ Arts & Humanities (Lit, Gov, History, CRK/IRK)</option>
                      <option value="Commercial">📈 Commercial (Accounting, Commerce, Economics)</option>
                      <option value="Technical">⚙️ Technical & Vocational</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs space-y-1">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block font-bold uppercase">Core Subject Status:</span>
                    <p className="text-[11px] text-emerald-400 font-bold">✓ English, Maths, Science & Social Studies Passed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Guardian & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-2">
                <span className="text-[10px] font-black uppercase text-[hsl(var(--text-tertiary))]">Guardian Contacts</span>
                <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{selectedApplicant.parentName}</p>
                <p className="text-[11px] text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> {selectedApplicant.parentPhone}
                </p>
                <p className="text-[11px] text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> {selectedApplicant.parentEmail}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-2">
                <span className="text-[10px] font-black uppercase text-[hsl(var(--text-tertiary))]">Address & Location</span>
                <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{selectedApplicant.address}</p>
                <p className="text-[11px] text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {selectedApplicant.city}
                </p>
              </div>
            </div>

            {/* Pipeline Stage Transitions */}
            <div className="space-y-3 pt-3 border-t border-[hsl(var(--border))]">
              <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-tertiary))] block">
                Update Admission Stage:
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, 'under_review')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedApplicant.status === 'under_review' ? 'bg-blue-500 text-white' : 'hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  Under Review
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, 'approved')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedApplicant.status === 'approved' ? 'bg-emerald-500 text-white' : 'hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  Approve / Confirm Placement
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, 'enrolled')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedApplicant.status === 'enrolled' ? 'bg-purple-500 text-white' : 'hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  Enroll in SIS Student Directory
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all ${
                    selectedApplicant.status === 'rejected' ? 'bg-red-500 text-white' : ''
                  }`}
                >
                  Decline
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Registration Modal */}
      {isAddingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg glass-card p-6 md:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Direct Student Registration</h3>
              <button onClick={() => setIsAddingApplicant(false)} className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Student Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Samuel Koroma"
                  value={newAppForm.name}
                  onChange={e => setNewAppForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Level Tier</label>
                  <select
                    value={newAppForm.level}
                    onChange={e => setNewAppForm(p => ({ ...p, level: e.target.value as any, grade: e.target.value === 'JSS' ? 'JSS 1' : e.target.value === 'SSS' ? 'SSS 1' : 'Class 1' }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="Pre-Primary">Pre-Primary (KG)</option>
                    <option value="Primary">Primary (Class 1-6)</option>
                    <option value="JSS">Junior Secondary (JSS)</option>
                    <option value="SSS">Senior Secondary (SSS)</option>
                    <option value="TVET">TVET / Technical</option>
                    <option value="Tertiary">Tertiary / Uni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Assigned Grade</label>
                  <input
                    type="text"
                    value={newAppForm.grade}
                    onChange={e => setNewAppForm(p => ({ ...p, grade: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              {newAppForm.level === 'JSS' && (
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">NPSE Score (out of 300)</label>
                  <input
                    type="number"
                    value={newAppForm.npseScore}
                    onChange={e => setNewAppForm(p => ({ ...p, npseScore: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              )}

              {newAppForm.level === 'SSS' && (
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Senior Secondary Stream</label>
                  <select
                    value={newAppForm.beceStream}
                    onChange={e => setNewAppForm(p => ({ ...p, beceStream: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="Science">Pure Science</option>
                    <option value="Arts">Arts & Humanities</option>
                    <option value="Commercial">Commercial / Business</option>
                    <option value="Technical">Technical & Applied</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={newAppForm.parentName}
                    onChange={e => setNewAppForm(p => ({ ...p, parentName: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    value={newAppForm.parentPhone}
                    onChange={e => setNewAppForm(p => ({ ...p, parentPhone: e.target.value }))}
                    placeholder="+232..."
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setIsAddingApplicant(false)}
                className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateApplicant}
                className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                Save Applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
