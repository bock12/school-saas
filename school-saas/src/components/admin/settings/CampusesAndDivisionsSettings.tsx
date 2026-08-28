'use client';

import { useState } from 'react';
import {
  Building2, Plus, MapPin, Users, Phone, Mail, CheckCircle2,
  Trash2, Edit2, Shield, Layers, X, Globe, Landmark
} from 'lucide-react';

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

interface Division {
  id: string;
  name: string;
  campusId: string;
  headOfDivision: string;
  grades: string[];
  studentCount: number;
}

const INITIAL_CAMPUSES: Campus[] = [
  {
    id: 'c1',
    name: 'Main Central Campus',
    code: 'MCC-01',
    address: '14 Education Boulevard, Victoria Island, Lagos',
    headOfCampus: 'Dr. Evelyn Mensah',
    contactPhone: '+234 1 890 1234',
    studentCapacity: 1200,
    currentEnrolled: 840,
    status: 'active',
  },
  {
    id: 'c2',
    name: 'Northgate Annex',
    code: 'NGA-02',
    address: '88 Innovation Road, Ikeja, Lagos',
    headOfCampus: 'Mr. Kwame Boateng',
    contactPhone: '+234 1 890 5678',
    studentCapacity: 600,
    currentEnrolled: 410,
    status: 'active',
  },
];

const INITIAL_DIVISIONS: Division[] = [
  {
    id: 'd1',
    name: 'Early Years & Kindergarten',
    campusId: 'c1',
    headOfDivision: 'Mrs. Abigail Clark',
    grades: ['Nursery 1', 'Nursery 2', 'KG 1', 'KG 2'],
    studentCount: 180,
  },
  {
    id: 'd2',
    name: 'Primary Academy',
    campusId: 'c1',
    headOfDivision: 'Mr. David Adeyemi',
    grades: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
    studentCount: 390,
  },
  {
    id: 'd3',
    name: 'Junior Secondary School',
    campusId: 'c2',
    headOfDivision: 'Dr. Sarah Appiah',
    grades: ['JSS 1', 'JSS 2', 'JSS 3'],
    studentCount: 270,
  },
  {
    id: 'd4',
    name: 'Senior Secondary College',
    campusId: 'c1',
    headOfDivision: 'Prof. Marcus Osei',
    grades: ['SS 1', 'SS 2', 'SS 3'],
    studentCount: 410,
  },
];

export default function CampusesAndDivisionsSettings() {
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL_CAMPUSES);
  const [divisions, setDivisions] = useState<Division[]>(INITIAL_DIVISIONS);
  const [isAddingCampus, setIsAddingCampus] = useState(false);
  const [isAddingDivision, setIsAddingDivision] = useState(false);

  const [campusForm, setCampusForm] = useState({
    name: '',
    code: '',
    address: '',
    headOfCampus: '',
    contactPhone: '',
    studentCapacity: 500,
  });

  const [divisionForm, setDivisionForm] = useState({
    name: '',
    campusId: 'c1',
    headOfDivision: '',
    grades: 'Grade 1, Grade 2, Grade 3',
  });

  const handleAddCampus = () => {
    if (!campusForm.name.trim() || !campusForm.code.trim()) return;
    const newCampus: Campus = {
      id: `c-${Date.now()}`,
      name: campusForm.name,
      code: campusForm.code.toUpperCase(),
      address: campusForm.address || 'Campus Location',
      headOfCampus: campusForm.headOfCampus || 'Campus Director',
      contactPhone: campusForm.contactPhone || '+234 80 0000 0000',
      studentCapacity: campusForm.studentCapacity,
      currentEnrolled: 0,
      status: 'active',
    };
    setCampuses(prev => [...prev, newCampus]);
    setIsAddingCampus(false);
    setCampusForm({ name: '', code: '', address: '', headOfCampus: '', contactPhone: '', studentCapacity: 500 });
  };

  const handleAddDivision = () => {
    if (!divisionForm.name.trim()) return;
    const newDiv: Division = {
      id: `d-${Date.now()}`,
      name: divisionForm.name,
      campusId: divisionForm.campusId,
      headOfDivision: divisionForm.headOfDivision || 'Division Head',
      grades: divisionForm.grades.split(',').map(g => g.trim()).filter(Boolean),
      studentCount: 0,
    };
    setDivisions(prev => [...prev, newDiv]);
    setIsAddingDivision(false);
    setDivisionForm({ name: '', campusId: 'c1', headOfDivision: '', grades: 'Grade 1, Grade 2, Grade 3' });
  };

  return (
    <div className="space-y-6">
      {/* Campuses Section */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Multi-Campus Management</h4>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Configure institutional satellite locations, premises, and branch quotas.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingCampus(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Campus
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campuses.map(campus => {
            const usagePercent = Math.round((campus.currentEnrolled / campus.studentCapacity) * 100);
            return (
              <div key={campus.id} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]">
                      {campus.code}
                    </span>
                    <h5 className="text-base font-bold text-[hsl(var(--text-primary))] mt-1.5">{campus.name}</h5>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {campus.address}
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
                  <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.5)]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Campus Director</span>
                    <span className="font-bold text-[hsl(var(--text-primary))] truncate block">{campus.headOfCampus}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.5)]">
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Phone</span>
                    <span className="font-bold text-[hsl(var(--text-primary))] truncate block">{campus.contactPhone}</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-[hsl(var(--text-tertiary))]">
                    <span>Enrolled: {campus.currentEnrolled} / {campus.studentCapacity}</span>
                    <span className="text-[hsl(var(--text-primary))]">{usagePercent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
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

      {/* Divisions Section */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Academic Divisions & Stages</h4>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Organize sections by early years, primary, and secondary faculties.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingDivision(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Division
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {divisions.map(division => {
            const parentCampus = campuses.find(c => c.id === division.campusId);
            return (
              <div key={division.id} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-sm font-bold text-[hsl(var(--text-primary))]">{division.name}</h5>
                    <p className="text-xs text-[hsl(var(--accent))] font-medium mt-0.5">
                      Head: {division.headOfDivision} · {parentCampus?.name || 'Main Campus'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDivisions(prev => prev.filter(d => d.id !== division.id))}
                    className="p-1 text-[hsl(var(--text-tertiary))] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {division.grades.map(g => (
                    <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Campus Modal */}
      {isAddingCampus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Add New Campus</h3>
              <button onClick={() => setIsAddingCampus(false)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Campus Name</label>
                <input
                  type="text"
                  value={campusForm.name}
                  onChange={e => setCampusForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. West Coast Branch"
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={campusForm.code}
                    onChange={e => setCampusForm(p => ({ ...p, code: e.target.value }))}
                    placeholder="WCB-03"
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Capacity</label>
                  <input
                    type="number"
                    value={campusForm.studentCapacity}
                    onChange={e => setCampusForm(p => ({ ...p, studentCapacity: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Address</label>
                <input
                  type="text"
                  value={campusForm.address}
                  onChange={e => setCampusForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Street, City, State"
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button onClick={() => setIsAddingCampus(false)} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]">Cancel</button>
              <button onClick={handleAddCampus} className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold">Add Campus</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Division Modal */}
      {isAddingDivision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Add Academic Division</h3>
              <button onClick={() => setIsAddingDivision(false)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Division Name</label>
                <input
                  type="text"
                  value={divisionForm.name}
                  onChange={e => setDivisionForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Middle School Division"
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Assigned Campus</label>
                <select
                  value={divisionForm.campusId}
                  onChange={e => setDivisionForm(p => ({ ...p, campusId: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Grades (comma separated)</label>
                <input
                  type="text"
                  value={divisionForm.grades}
                  onChange={e => setDivisionForm(p => ({ ...p, grades: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button onClick={() => setIsAddingDivision(false)} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]">Cancel</button>
              <button onClick={handleAddDivision} className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold">Add Division</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
