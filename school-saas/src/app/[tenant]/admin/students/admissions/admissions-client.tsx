'use client';

import { useState } from 'react';
import {
  UserPlus, Clock, CheckCircle2, AlertCircle, FileText, Search, Filter,
  ArrowRight, MoreHorizontal, Eye, Edit2, Calendar, ClipboardCheck,
  CheckCircle, MessageSquare, ChevronRight, Play, BarChart3, Layers, X, Upload, Camera, Kanban, List, Link2, Copy
} from 'lucide-react';
import Link from 'next/link';
import { createApplicant, progressApplicantStage } from './actions';

export interface Applicant {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  appliedDate: string;
  dob: string;
  stage: 'Application' | 'Verification' | 'Interview' | 'Assessment' | 'Acceptance' | 'Enrollment' | 'Allocation';
  docsVerified: boolean;
  interviewScore: number | null;
  assessmentScore: number | null;
  comment: string;
  photoUrl?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  prevSchool?: string;
}

const stagesList = [
  { name: 'Application', label: '1. Application', desc: 'Online Submission', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'Verification', label: '2. Verification', desc: 'Docs Audit', icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { name: 'Interview', label: '3. Interview', desc: 'Face-to-Face', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Assessment', label: '4. Assessment', desc: 'Skill Evaluat.', icon: BarChart3, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { name: 'Acceptance', label: '5. Acceptance', desc: 'Offer Sent', icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { name: 'Enrollment', label: '6. Enrollment', desc: 'Fees Paid', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { name: 'Allocation', label: '7. Allocation', desc: 'Class Set', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export function AdmissionsClient({ serverApplicants, tenantSlug }: { serverApplicants: Applicant[], tenantSlug: string }) {
  const [applicants, setApplicants] = useState<Applicant[]>(serverApplicants);
  const [selectedStage, setSelectedStage] = useState<string>('Application');
  const [showApproveModal, setShowApproveModal] = useState<Applicant | null>(null);
  const [approveComment, setApproveComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');

  const filteredApplicants = applicants.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.parentName.toLowerCase().includes(search.toLowerCase())
  );

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    nin: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Nigeria',
    grade: 'Grade 7',
    prevSchool: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'Father',
    photo: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.parentName) return;

    setIsSubmitting(true);
    const formDataObj = new FormData();
    formDataObj.append('tenant', tenantSlug);
    formDataObj.append('first_name', formData.firstName);
    formDataObj.append('last_name', formData.lastName);
    formDataObj.append('dob', formData.dob);
    formDataObj.append('gender', formData.gender);
    formDataObj.append('blood_group', formData.bloodGroup);
    formDataObj.append('nin', formData.nin);
    formDataObj.append('email', formData.email);
    formDataObj.append('phone', formData.phone);
    formDataObj.append('address', formData.address);
    formDataObj.append('city', formData.city);
    formDataObj.append('target_grade', formData.grade);
    formDataObj.append('previous_school', formData.prevSchool);
    formDataObj.append('parent_name', formData.parentName);
    formDataObj.append('parent_phone', formData.parentPhone);
    formDataObj.append('parent_email', formData.parentEmail);
    formDataObj.append('parent_relation', formData.parentRelation);
    if (formData.photo) formDataObj.append('avatar_url', formData.photo);

    const res = await createApplicant(formDataObj);
    setIsSubmitting(false);

    if (res.success) {
      setShowCreateModal(false);
      setFormData({
        firstName: '', lastName: '', dob: '', gender: 'Male', bloodGroup: '', nin: '',
        email: '', phone: '', address: '', city: '', country: 'Nigeria', grade: 'Grade 7',
        prevSchool: '', parentName: '', parentPhone: '', parentEmail: '', parentRelation: 'Father', photo: ''
      });
      // The page will revalidate and we'll receive updated serverApplicants
    } else {
      alert(res.error);
    }
  };

  const nextStageMap: Record<string, string> = {
    'Application': 'Verification',
    'Verification': 'Interview',
    'Interview': 'Assessment',
    'Assessment': 'Acceptance',
    'Acceptance': 'Enrollment',
    'Enrollment': 'Allocation',
    'Allocation': 'Allocation', // Final
  };

  const handleProgress = async (appId: string) => {
    const app = applicants.find(a => a.id === appId);
    if (!app) return;
    
    const nextStage = nextStageMap[app.stage] as any;
    if (!nextStage || nextStage === app.stage) {
      setShowApproveModal(null);
      return;
    }

    setIsSubmitting(true);
    const res = await progressApplicantStage(tenantSlug, appId, app.stage, nextStage, approveComment);
    setIsSubmitting(false);

    if (res.success) {
      setShowApproveModal(null);
      setApproveComment('');
      // optimistic update
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, stage: nextStage, comment: approveComment || a.comment } : a));
    } else {
      alert(res.error);
    }
  };

  // Sync state if serverApplicants changes (e.g. after revalidatePath)
  if (applicants !== serverApplicants) {
    setApplicants(serverApplicants);
  }

  return (
    <>
      <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Admissions Workflow Desk</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Progress applications chronologically through verification, interviews, assessments, and allocations.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-[hsl(var(--bg-tertiary))] p-1 rounded-lg border border-[hsl(var(--border))]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
            >
              <Kanban className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>
          <button
            onClick={() => {
              const url = `${window.location.origin}/apply`;
              navigator.clipboard.writeText(url);
              alert('Public Application Link copied to clipboard!\n\n' + url);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-sm font-semibold hover:bg-[hsl(var(--border))] transition-colors"
          >
            <Link2 className="w-4 h-4" /> Copy Public Link
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" /> New Application
          </button>
        </div>
      </div>

      
      {viewMode === 'kanban' ? (
        <>
          {/* Stage progression timeline cards */}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stagesList.map((stg) => {
          const count = applicants.filter(a => a.stage === stg.name).length;
          const isActive = selectedStage === stg.name;
          const Icon = stg.icon;
          return (
            <div
              key={stg.name}
              onClick={() => setSelectedStage(stg.name)}
              className={`rounded-xl border p-4 text-center cursor-pointer hover:scale-105 transition-all select-none ${
                isActive
                  ? 'bg-[hsl(var(--accent)/0.12)] border-[hsl(var(--accent))] shadow-md'
                  : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${stg.bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-4 h-4 ${stg.color}`} />
              </div>
              <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{stg.name}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{stg.desc}</p>
              <p className={`text-base font-bold mt-2 ${isActive ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-secondary))]'}`}>
                {count} {count === 1 ? 'applicant' : 'applicants'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Applicants List in Current Stage */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">
            Stage: {selectedStage}
          </h3>
          <span className="text-xs text-[hsl(var(--text-tertiary))]">
            {applicants.filter(a => a.stage === selectedStage).length} applicants currently active in this step
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Applicant', 'Grade', 'Parent/Guardian', 'Docs Audit', 'Assessments/Notes', 'Workflow comments', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applicants.filter(a => a.stage === selectedStage).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">
                    No applicants in this stage currently. Select another stage above to review candidates.
                  </td>
                </tr>
              ) : (
                applicants.filter(a => a.stage === selectedStage).map(app => (
                  <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {app.photoUrl ? (
                          <img src={app.photoUrl} alt={app.name} className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                            {app.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{app.name}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Applied: {app.appliedDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.grade}</td>
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.parentName}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${app.docsVerified ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                        {app.docsVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs space-y-1">
                        {selectedStage === 'Interview' && <p className="text-[hsl(var(--text-secondary))]">Interview Score: <span className="font-semibold text-[hsl(var(--text-primary))]">{app.interviewScore || 'Not graded'}</span></p>}
                        {selectedStage === 'Assessment' && <p className="text-[hsl(var(--text-secondary))]">Assessment Score: <span className="font-semibold text-[hsl(var(--text-primary))]">{app.assessmentScore || 'Not graded'}</span></p>}
                        {selectedStage !== 'Interview' && selectedStage !== 'Assessment' && <p className="text-[hsl(var(--text-tertiary))]">Compliant</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] max-w-[250px] truncate" title={app.comment}>
                      {app.comment}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {selectedStage !== 'Allocation' ? (
                        <button
                          onClick={() => {
                            setShowApproveModal(app);
                            setApproveComment('');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold"
                        >
                          Approve Step <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Allocated & Enrolled ${app.name} to class successfully!`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold"
                        >
                          Complete Allocation &amp; Enroll <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    {['Applicant', 'Grade', 'Parent/Guardian', 'Applied Date', 'Documents', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">No applications found.</td>
                    </tr>
                  ) : (
                    applicants.map(app => (
                      <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {app.photoUrl ? (
                              <img src={app.photoUrl} alt={app.name} className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                                {app.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{app.name}</p>
                              <p className="text-xs text-[hsl(var(--text-tertiary))]">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.grade}</td>
                        <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.parentName}</td>
                        <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {app.docsVerified ? 'Verified' : 'Pending'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            stagesList.find(s => s.name === app.stage)?.bg || 'bg-gray-500/10'
                          } ${stagesList.find(s => s.name === app.stage)?.color || 'text-gray-400'} border-current/20`}>
                            {app.stage}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* New Application Creation Modal with Detailed Profile Fields */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
          <div className="glass-card max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between border-b border-[hsl(var(--border))] p-5 sm:p-6 bg-[hsl(var(--bg-secondary))] z-10">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Student Admission Application Form</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-6 flex-1">
              <form onSubmit={handleCreateApplicant} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))]">
                <div className="relative w-24 h-24 rounded-full bg-[hsl(var(--bg-tertiary))] border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center overflow-hidden group">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-[hsl(var(--text-tertiary))] group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1 font-semibold">Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Upload Student Profile Picture</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Supports PNG, JPG, or JPEG formats. Max weight limit 2.0 MB.</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">1. Student Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="e.g. Sarah"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="e.g. Smith"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      placeholder="e.g. O+"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">National ID / NIN</label>
                    <input
                      type="text"
                      value={formData.nin}
                      onChange={(e) => setFormData(prev => ({ ...prev, nin: e.target.value }))}
                      placeholder="e.g. 120492019"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">2. Contact &amp; Residential Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Student Personal Email (optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. sarah.smith@mail.com"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Mobile Phone (optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +234 80 1234 5678"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Home Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="e.g. 12 Broad Street"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">City/State *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Lagos"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Academic History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">3. Academic Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Target Entry Grade *</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option>Grade 7</option>
                      <option>Grade 8</option>
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Previous School Attended (optional)</label>
                    <input
                      type="text"
                      value={formData.prevSchool}
                      onChange={(e) => setFormData(prev => ({ ...prev, prevSchool: e.target.value }))}
                      placeholder="e.g. Kings College Lagos"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Relationships */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">4. Parent / Legal Guardian Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Parent Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                      placeholder="e.g. Patricia Smith"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Parent Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                      placeholder="e.g. +234 80 9876 5432"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Parent Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.parentEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                      placeholder="e.g. parent.smith@mail.com"
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Relationship Type *</label>
                    <select
                      value={formData.parentRelation}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentRelation: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Legal Guardian</option>
                      <option>Sponsor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? 'Registering...' : 'Register Application'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Approve comment modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Approve Workflow Step</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Approve <strong>{showApproveModal.name}</strong> to progress from <strong>{showApproveModal.stage}</strong> to the next workflow stage.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))]">Workflow Comments</label>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                placeholder="Enter approval details or audit comments..."
                className="w-full min-h-[80px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProgress(showApproveModal.id)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-90"
              >
                {isSubmitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
