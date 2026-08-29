'use client';

import { useState } from 'react';
import {
  Building2, Plus, MapPin, Users, Phone, Mail, CheckCircle2,
  Trash2, Edit2, Shield, Layers, X, Globe, Landmark,
  ExternalLink, ArrowUpRight, Lock, Key, ShieldCheck
} from 'lucide-react';

interface AutonomousSchool {
  id: string;
  name: string;
  slug: string;
  level: 'Pre-Primary' | 'Primary' | 'Junior Secondary (JSS)' | 'Senior Secondary (SSS)' | 'TVET' | 'Tertiary';
  headOfSchool: string;
  headTitle: 'Principal' | 'Head Teacher' | 'Rector' | 'Director' | 'Dean';
  contactEmail: string;
  contactPhone: string;
  studentCount: number;
  staffCount: number;
  status: 'active' | 'setup_required' | 'inactive';
}

interface Campus {
  id: string;
  name: string;
  code: string;
  address: string;
  headOfCampus: string;
  contactPhone: string;
  studentCapacity: number;
  currentEnrolled: number;
  status: 'active' | 'maintenance' | 'inactive';
}

const INITIAL_AUTONOMOUS_SCHOOLS: AutonomousSchool[] = [
  {
    id: 'sch_jss',
    name: 'Albert Academy Junior Secondary School',
    slug: 'albert-academy-jss',
    level: 'Junior Secondary (JSS)',
    headOfSchool: 'Mr. Joseph S. Tucker',
    headTitle: 'Principal',
    contactEmail: 'principal.jss@albertacademy.edu.sl',
    contactPhone: '+232 76 554 433',
    studentCount: 540,
    staffCount: 32,
    status: 'active',
  },
  {
    id: 'sch_sss',
    name: 'Albert Academy Senior Secondary School',
    slug: 'albert-academy-sss',
    level: 'Senior Secondary (SSS)',
    headOfSchool: 'Dr. Raymond B. Koroma',
    headTitle: 'Principal',
    contactEmail: 'principal.sss@albertacademy.edu.sl',
    contactPhone: '+232 78 998 877',
    studentCount: 680,
    staffCount: 46,
    status: 'active',
  },
  {
    id: 'sch_primary',
    name: 'Albert Academy Preparatory & Primary',
    slug: 'albert-academy-primary',
    level: 'Primary',
    headOfSchool: 'Mrs. Hawa Conteh',
    headTitle: 'Head Teacher',
    contactEmail: 'headteacher@albertacademy.edu.sl',
    contactPhone: '+232 30 112 233',
    studentCount: 390,
    staffCount: 22,
    status: 'active',
  },
];

const INITIAL_CAMPUSES: Campus[] = [
  {
    id: 'c1',
    name: 'Berry Street Main Campus',
    code: 'BSMC-01',
    address: 'Berry Street, Freetown, Sierra Leone',
    headOfCampus: 'Dr. Raymond B. Koroma',
    contactPhone: '+232 76 000 111',
    studentCapacity: 1500,
    currentEnrolled: 1220,
    status: 'active',
  },
  {
    id: 'c2',
    name: 'Waterloo Annex Branch',
    code: 'WAB-02',
    address: 'Main Highway, Waterloo, Western Area Rural',
    headOfCampus: 'Mr. Tamba S. Yamba',
    contactPhone: '+232 78 222 333',
    studentCapacity: 500,
    currentEnrolled: 390,
    status: 'active',
  },
];

export default function CampusesAndDivisionsSettings() {
  const [autonomousSchools, setAutonomousSchools] = useState<AutonomousSchool[]>(INITIAL_AUTONOMOUS_SCHOOLS);
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL_CAMPUSES);

  // Modals
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [isAddingCampus, setIsAddingCampus] = useState(false);

  const [schoolForm, setSchoolForm] = useState({
    name: '',
    slug: '',
    level: 'Junior Secondary (JSS)' as AutonomousSchool['level'],
    headOfSchool: '',
    headTitle: 'Principal' as AutonomousSchool['headTitle'],
    contactEmail: '',
    contactPhone: '',
  });

  const [campusForm, setCampusForm] = useState({
    name: '',
    code: '',
    address: '',
    headOfCampus: '',
    contactPhone: '',
    studentCapacity: 500,
  });

  const handleAddSchool = () => {
    if (!schoolForm.name.trim() || !schoolForm.slug.trim()) return;
    const newSch: AutonomousSchool = {
      id: `sch_${Date.now()}`,
      name: schoolForm.name,
      slug: schoolForm.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      level: schoolForm.level,
      headOfSchool: schoolForm.headOfSchool || 'Principal',
      headTitle: schoolForm.headTitle,
      contactEmail: schoolForm.contactEmail || `admin@${schoolForm.slug}.edu.sl`,
      contactPhone: schoolForm.contactPhone || '+232 76 000 000',
      studentCount: 0,
      staffCount: 0,
      status: 'active',
    };

    setAutonomousSchools(prev => [...prev, newSch]);
    setIsAddingSchool(false);
    setSchoolForm({
      name: '',
      slug: '',
      level: 'Junior Secondary (JSS)',
      headOfSchool: '',
      headTitle: 'Principal',
      contactEmail: '',
      contactPhone: '',
    });
  };

  const handleAddCampus = () => {
    if (!campusForm.name.trim() || !campusForm.code.trim()) return;
    const newCampus: Campus = {
      id: `c-${Date.now()}`,
      name: campusForm.name,
      code: campusForm.code.toUpperCase(),
      address: campusForm.address || 'Freetown, Sierra Leone',
      headOfCampus: campusForm.headOfCampus || 'Campus Director',
      contactPhone: campusForm.contactPhone || '+232 76 000 000',
      studentCapacity: campusForm.studentCapacity,
      currentEnrolled: 0,
      status: 'active',
    };
    setCampuses(prev => [...prev, newCampus]);
    setIsAddingCampus(false);
    setCampusForm({ name: '', code: '', address: '', headOfCampus: '', contactPhone: '', studentCapacity: 500 });
  };

  return (
    <div className="space-y-8">
      {/* ⚠️ Autonomous Administration Policy Banner */}
      <div className="p-6 rounded-3xl bg-[hsl(var(--accent)/0.08)] border border-[hsl(var(--accent)/0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] flex items-center justify-center shrink-0 border border-[hsl(var(--accent)/0.3)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
              Autonomous School Administrative Sovereignty
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Multi-Tenant Architecture
              </span>
            </h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed max-w-3xl">
              Any school or division with separate administration—even within the same umbrella organization, board, mission, or physical compound (such as JSS vs SSS, Primary vs Secondary, or AM vs PM shifts)—is provisioned as an <strong>autonomous school entity with its own dedicated admin dashboard, staff roster, admissions register, and database isolation</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Autonomous Schools with Separate Administrations */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Autonomous School Entities & Dashboards</h4>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                Schools under this group organization with independent administrations, leadership, and staff rosters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSchool(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Provision Separate School
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {autonomousSchools.map((sch) => (
            <div
              key={sch.id}
              className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-4 hover:border-[hsl(var(--accent)/0.5)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {sch.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutonomousSchools(prev => prev.filter(s => s.id !== sch.id))}
                    className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h5 className="text-base font-black text-[hsl(var(--text-primary))]">{sch.name}</h5>
                  <p className="text-xs text-[hsl(var(--accent))] font-mono font-semibold">
                    /{sch.slug}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.6)] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold uppercase">{sch.headTitle}</span>
                    <span className="font-bold text-[hsl(var(--text-primary))]">{sch.headOfSchool}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[hsl(var(--text-secondary))]">
                    <span>{sch.studentCount} Students</span>
                    <span>{sch.staffCount} Staff</span>
                  </div>
                </div>
              </div>

              {/* Direct Link to School Dashboard */}
              <div className="pt-2 border-t border-[hsl(var(--border)/0.5)]">
                <a
                  href={`/${sch.slug}/admin`}
                  className="w-full py-2.5 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all flex items-center justify-center gap-1.5 group"
                >
                  <span>Launch School Dashboard</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Physical Campuses & Satellite Branches */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Physical Campuses & Satellite Branches</h4>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                Manage physical grounds, premises, branch codes, and building quotas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingCampus(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Physical Campus
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campuses.map((campus) => {
            const usagePercent = Math.round((campus.currentEnrolled / campus.studentCapacity) * 100);
            return (
              <div
                key={campus.id}
                className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.25)]">
                      {campus.code}
                    </span>
                    <h5 className="text-base font-bold text-[hsl(var(--text-primary))] mt-1.5">{campus.name}</h5>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--accent))]" /> {campus.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCampuses(prev => prev.filter(c => c.id !== campus.id))}
                    className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.5)]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Campus Director</span>
                    <span className="font-bold text-[hsl(var(--text-primary))] truncate block">{campus.headOfCampus}</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.5)]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Contact Phone</span>
                    <span className="font-bold text-[hsl(var(--text-primary))] truncate block">{campus.contactPhone}</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-[hsl(var(--text-tertiary))]">
                    <span>Enrolled: {campus.currentEnrolled} / {campus.studentCapacity}</span>
                    <span className="text-[hsl(var(--text-primary))]">{usagePercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))]"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provision Separate School Modal */}
      {isAddingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg glass-card p-6 md:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Provision Separate Autonomous School</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Creates an independent tenant workspace with dedicated admin URL.</p>
              </div>
              <button onClick={() => setIsAddingSchool(false)} className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">School Entity Name *</label>
                <input
                  type="text"
                  value={schoolForm.name}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setSchoolForm(p => ({ ...p, name, slug: p.slug ? p.slug : slug }));
                  }}
                  placeholder="e.g. Albert Academy Junior Secondary"
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Dedicated Tenant URL Slug *</label>
                <div className="flex items-center">
                  <span className="h-11 px-3.5 rounded-l-xl bg-[hsl(var(--bg-tertiary))] border border-r-0 border-[hsl(var(--border))] text-xs font-mono text-[hsl(var(--text-tertiary))] flex items-center">
                    app.domain/
                  </span>
                  <input
                    type="text"
                    value={schoolForm.slug}
                    onChange={e => setSchoolForm(p => ({ ...p, slug: e.target.value }))}
                    placeholder="albert-academy-jss"
                    className="flex-1 h-11 px-4 rounded-r-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--accent))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Educational Level</label>
                  <select
                    value={schoolForm.level}
                    onChange={e => setSchoolForm(p => ({ ...p, level: e.target.value as any }))}
                    className="w-full h-11 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="Pre-Primary">Pre-Primary (KG)</option>
                    <option value="Primary">Primary School</option>
                    <option value="Junior Secondary (JSS)">Junior Secondary (JSS)</option>
                    <option value="Senior Secondary (SSS)">Senior Secondary (SSS)</option>
                    <option value="TVET">TVET / Technical</option>
                    <option value="Tertiary">Tertiary / Uni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Leader Title</label>
                  <select
                    value={schoolForm.headTitle}
                    onChange={e => setSchoolForm(p => ({ ...p, headTitle: e.target.value as any }))}
                    className="w-full h-11 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="Principal">Principal</option>
                    <option value="Head Teacher">Head Teacher</option>
                    <option value="Director">Director</option>
                    <option value="Rector">Rector</option>
                    <option value="Dean">Dean</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Head Administrator Name</label>
                  <input
                    type="text"
                    value={schoolForm.headOfSchool}
                    onChange={e => setSchoolForm(p => ({ ...p, headOfSchool: e.target.value }))}
                    placeholder="e.g. Mr. Tucker"
                    className="w-full h-11 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Direct Phone Number</label>
                  <input
                    type="tel"
                    value={schoolForm.contactPhone}
                    onChange={e => setSchoolForm(p => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="+232 76..."
                    className="w-full h-11 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setIsAddingSchool(false)}
                className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSchool}
                className="px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Provision School Entity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Physical Campus Modal */}
      {isAddingCampus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Add Physical Campus / Branch</h3>
              <button onClick={() => setIsAddingCampus(false)} className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Campus / Branch Name</label>
                <input
                  type="text"
                  value={campusForm.name}
                  onChange={e => setCampusForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Northgate Satellite Campus"
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={campusForm.code}
                    onChange={e => setCampusForm(p => ({ ...p, code: e.target.value }))}
                    placeholder="NSC-03"
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Capacity</label>
                  <input
                    type="number"
                    value={campusForm.studentCapacity}
                    onChange={e => setCampusForm(p => ({ ...p, studentCapacity: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Address & Location</label>
                <input
                  type="text"
                  value={campusForm.address}
                  onChange={e => setCampusForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Street, City, District"
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button onClick={() => setIsAddingCampus(false)} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]">Cancel</button>
              <button onClick={handleAddCampus} className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-sm">Save Campus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
