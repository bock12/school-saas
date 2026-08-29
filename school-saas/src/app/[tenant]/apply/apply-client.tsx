'use client';

import { useState, useMemo } from 'react';
import {
  Camera, CheckCircle2, Award, GraduationCap, FileText, Check,
  AlertCircle, ChevronRight, Upload, Info, ShieldCheck, Sparkles,
  BookOpen, Building2, UserCheck, HelpCircle
} from 'lucide-react';
import { submitPublicApplication } from './actions';

function compressFileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };

    img.src = url;
  });
}

// ── Educational Levels & Grades according to Sierra Leone 6-3-3-4 System ──
const LEVEL_CONFIG = {
  'Pre-Primary': {
    label: 'Kindergarten & Pre-Primary (Ages 3–5)',
    grades: ['Nursery 1', 'Nursery 2', 'KG 1', 'KG 2', 'KG 3'],
    examRequired: null,
    defaultDocs: [
      { type: 'Child Birth Certificate', name: '', url: '' },
      { type: 'Child Health & Immunization Record', name: '', url: '' },
      { type: 'Parent / Guardian Valid ID', name: '', url: '' },
    ],
  },
  'Primary': {
    label: 'Primary School (Classes 1–6 / FQSE)',
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'],
    examRequired: null,
    defaultDocs: [
      { type: 'Birth Certificate', name: '', url: '' },
      { type: 'Previous Primary Record Card / Transfer Slip', name: '', url: '' },
      { type: 'Immunization Records', name: '', url: '' },
    ],
  },
  'JSS': {
    label: 'Junior Secondary School (JSS 1–3)',
    grades: ['JSS 1', 'JSS 2', 'JSS 3'],
    examRequired: 'NPSE',
    defaultDocs: [
      { type: 'Official NPSE Result Slip', name: '', url: '' },
      { type: 'MBSSE Placement Confirmation Form', name: '', url: '' },
      { type: 'Primary School Continuous Assessment (CASS) Card', name: '', url: '' },
      { type: 'Birth Certificate', name: '', url: '' },
    ],
  },
  'SSS': {
    label: 'Senior Secondary School (SSS 1–3 / Streams)',
    grades: ['SSS 1', 'SSS 2', 'SSS 3'],
    examRequired: 'BECE',
    defaultDocs: [
      { type: 'Official BECE Statement of Results', name: '', url: '' },
      { type: 'JSS 3 Continuous Assessment Record Card', name: '', url: '' },
      { type: 'Birth Certificate', name: '', url: '' },
    ],
  },
  'TVET': {
    label: 'Technical & Vocational Education (TVET / NTC / Diploma)',
    grades: ['NTC Level 1', 'NTC Level 2', 'Level 3 Trade', 'National Diploma (ND)'],
    examRequired: 'TVET_EXAM',
    defaultDocs: [
      { type: 'BECE / NPSE Statement of Results', name: '', url: '' },
      { type: 'Prior Apprenticeship / Literacy Certificate', name: '', url: '' },
      { type: 'National ID / Birth Certificate', name: '', url: '' },
    ],
  },
  'Tertiary': {
    label: 'University & Tertiary Education (Undergraduate)',
    grades: ['Year 1 (Freshman)', 'Year 2 (Direct Entry)', 'Year 3', 'Year 4'],
    examRequired: 'WASSCE',
    defaultDocs: [
      { type: 'Certified WASSCE Result Slip / Certificate', name: '', url: '' },
      { type: 'WAEC Scratch Card Verification Voucher', name: '', url: '' },
      { type: 'Letter of Recommendation / Testimonial', name: '', url: '' },
      { type: 'Birth Certificate / National Passport', name: '', url: '' },
    ],
  },
};

type LevelKey = keyof typeof LEVEL_CONFIG;

export function ApplyClient({ tenantSlug, schoolName }: { tenantSlug: string; schoolName: string }) {
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('JSS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  // Form State
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
    city: 'Freetown',
    grade: 'JSS 1',
    prevSchool: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'Father',
    photo: '',
  });

  // Sierra Leone National Exam Details
  const [npseDetails, setNpseDetails] = useState({
    indexNumber: '',
    examYear: '2026',
    aggregateScore: 260,
    mbsseChoiceNumber: 'First Choice',
    primarySchoolName: '',
  });

  const [beceDetails, setBeceDetails] = useState({
    indexNumber: '',
    examYear: '2026',
    totalPasses: 8,
    passedEnglish: true,
    passedMaths: true,
    passedScience: true,
    passedSocialStudies: true,
    selectedStream: 'Science', // Science, Arts, Commercial, Technical
  });

  const [wassceDetails, setWassceDetails] = useState({
    indexNumber: '',
    examYear: '2026',
    creditsCount: 6,
    scratchCardPin: '',
    scratchCardSerial: '',
    targetFaculty: 'Faculty of Pure & Applied Sciences',
  });

  const [tvetDetails, setTvetDetails] = useState({
    chosenTrade: 'Information & Communications Technology (ICT)',
    entryQualification: 'BECE Passed',
  });

  // Documents
  const [documents, setDocuments] = useState<Array<{ type: string; name: string; url: string }>>(
    LEVEL_CONFIG['JSS'].defaultDocs
  );

  const handleLevelChange = (level: LevelKey) => {
    setSelectedLevel(level);
    const config = LEVEL_CONFIG[level];
    setFormData(prev => ({ ...prev, grade: config.grades[0] }));
    setDocuments(config.defaultDocs);
  };

  const handleDocumentFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await compressFileToBase64(file);
      setDocuments(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          name: file.name,
          url: dataUrl,
        };
        return updated;
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await compressFileToBase64(file);
      setFormData(prev => ({ ...prev, photo: dataUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.parentName) {
      alert('Please fill out all required personal and guardian fields.');
      return;
    }

    setIsSubmitting(true);
    const formDataObj = new FormData();
    formDataObj.append('tenantSlug', tenantSlug);
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
    formDataObj.append('previous_school', formData.prevSchool || npseDetails.primarySchoolName);
    formDataObj.append('parent_name', formData.parentName);
    formDataObj.append('parent_phone', formData.parentPhone);
    formDataObj.append('parent_email', formData.parentEmail);
    formDataObj.append('parent_relation', formData.parentRelation);

    // Build Sierra Leone Examination Metadata Payload
    const examMeta: Record<string, unknown> = {
      level: selectedLevel,
    };
    if (selectedLevel === 'JSS') {
      examMeta.npse = npseDetails;
      examMeta.isNpseQualified = npseDetails.aggregateScore >= 230;
    } else if (selectedLevel === 'SSS') {
      examMeta.bece = beceDetails;
      examMeta.stream = beceDetails.selectedStream;
      examMeta.isBeceQualified = beceDetails.totalPasses >= 6 && beceDetails.passedEnglish && beceDetails.passedMaths;
    } else if (selectedLevel === 'Tertiary') {
      examMeta.wassce = wassceDetails;
      examMeta.isWassceQualified = wassceDetails.creditsCount >= 5;
    } else if (selectedLevel === 'TVET') {
      examMeta.tvet = tvetDetails;
    }

    // Attach exam metadata inside documents array as a certified record item
    const activeDocs = documents.filter(d => d.url && d.name);
    activeDocs.push({
      type: 'SL_NATIONAL_EXAM_METADATA',
      name: `SL_${selectedLevel}_Record.json`,
      url: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(examMeta))}`,
    });

    formDataObj.append('documents', JSON.stringify(activeDocs));

    if (formData.photo) {
      formDataObj.append('avatar_url', formData.photo);
    }

    const res = await submitPublicApplication(formDataObj);
    setIsSubmitting(false);

    if (res.success && res.referenceCode) {
      setReferenceCode(res.referenceCode);
      setIsSuccess(true);
    } else {
      alert(res.error || 'Failed to submit application. Please verify your internet connection.');
    }
  };

  if (isSuccess) {
    return (
      <div className="glass-card p-8 sm:p-12 text-center flex flex-col items-center justify-center animate-in fade-in duration-200 min-h-[50vh] space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2 inline-block">
            Sierra Leone 6-3-3-4 System
          </span>
          <h2 className="text-3xl font-black text-[hsl(var(--text-primary))]">Application Successfully Lodged!</h2>
          <p className="text-[hsl(var(--text-secondary))] max-w-md mx-auto mt-2 text-sm font-medium">
            Thank you for applying to <strong>{schoolName}</strong> for <strong>{formData.grade}</strong> ({selectedLevel} level).
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] max-w-md w-full space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-[hsl(var(--text-tertiary))]">Your Official Application Reference Code</span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-extrabold text-[hsl(var(--accent))] tracking-widest bg-[hsl(var(--bg-primary))] px-4 py-2.5 rounded-2xl border border-[hsl(var(--border))] select-all shadow-inner">
              {referenceCode}
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--text-tertiary))] pt-1">
            Keep this reference code secure. You can use it to track MBSSE placement verification, interview invitations, and registrar decisions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href={`/${tenantSlug}/apply/status`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
          >
            Track Application Status
          </a>
          <a
            href={`/${tenantSlug}`}
            className="px-6 py-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold text-xs uppercase tracking-wider hover:bg-[hsl(var(--border))] transition-colors"
          >
            Return to School Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 sm:p-10 animate-in fade-in duration-200 space-y-8">
      {/* Form Header */}
      <div className="border-b border-[hsl(var(--border))] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]">
            Official MBSSE / WAEC 6-3-3-4 Intake
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">Student Admission Portal</h2>
        <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] font-medium">
          Apply for admission to <strong>{schoolName}</strong>. Choose your educational level below to see specific national examination and credential requirements.
        </p>
      </div>

      {/* Educational Level Selection Selector */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-[hsl(var(--text-tertiary))] block">
          Select Entry Educational Level *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(Object.keys(LEVEL_CONFIG) as LevelKey[]).map(lvl => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] shadow-md font-bold'
                    : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border)/0.8)] font-semibold'
                }`}
              >
                <span className="text-sm font-black uppercase">{lvl}</span>
                <span className="text-[10px] opacity-80 truncate w-full">{lvl === 'JSS' ? 'NPSE' : lvl === 'SSS' ? 'BECE' : lvl === 'Tertiary' ? 'WASSCE' : 'General'}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[hsl(var(--accent))] font-bold flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5" />
          {LEVEL_CONFIG[selectedLevel].label}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo Upload Card */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]">
          <div className="relative w-28 h-28 rounded-3xl bg-[hsl(var(--bg-primary))] border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center overflow-hidden group hover:border-[hsl(var(--accent))] transition-colors cursor-pointer shadow-inner">
            {formData.photo ? (
              <img src={formData.photo} alt="Student Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-7 h-7 text-[hsl(var(--text-tertiary))] group-hover:scale-110 group-hover:text-[hsl(var(--accent))] transition-all" />
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] mt-1.5 uppercase">Passport Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm font-black text-[hsl(var(--text-primary))]">Applicant Passport Photograph</h4>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              Recent color passport photo with clear white background. (Max 2MB, PNG/JPG).
            </p>
          </div>
        </div>

        {/* 1. Student Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.12)] flex items-center justify-center text-xs">1</span>
            Student Personal Dossier
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">First Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sahr"
                value={formData.firstName}
                onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Last Name / Surname *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bangura"
                value={formData.lastName}
                onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Gender *</label>
              <select
                value={formData.gender}
                onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">National Identification Number (NIN)</label>
              <input
                type="text"
                placeholder="NCRA / NIN Number"
                value={formData.nin}
                onChange={e => setFormData(p => ({ ...p, nin: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Target Grade / Class *</label>
              <select
                value={formData.grade}
                onChange={e => setFormData(p => ({ ...p, grade: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                {LEVEL_CONFIG[selectedLevel].grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Sierra Leone National Exam Verification Details */}
        {selectedLevel === 'JSS' && (
          <div className="p-6 rounded-3xl bg-[hsl(var(--accent)/0.06)] border border-[hsl(var(--accent)/0.3)] space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[hsl(var(--accent)/0.2)]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">National Primary School Examination (NPSE) Results</h4>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                National Cutoff: 230/300
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">NPSE Candidate Index Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 102948271"
                  value={npseDetails.indexNumber}
                  onChange={e => setNpseDetails(p => ({ ...p, indexNumber: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">NPSE Aggregate Score (out of 300) *</label>
                  <span className={`text-xs font-black ${npseDetails.aggregateScore >= 230 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {npseDetails.aggregateScore >= 230 ? '✓ Meets Cutoff' : '⚠ Below 230 Cutoff'}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="300"
                  required
                  value={npseDetails.aggregateScore}
                  onChange={e => setNpseDetails(p => ({ ...p, aggregateScore: parseInt(e.target.value) || 0 }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-black text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Primary School Attended</label>
                <input
                  type="text"
                  placeholder="e.g. St. Edwards Primary School"
                  value={npseDetails.primarySchoolName}
                  onChange={e => setNpseDetails(p => ({ ...p, primarySchoolName: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {selectedLevel === 'SSS' && (
          <div className="p-6 rounded-3xl bg-[hsl(var(--accent)/0.06)] border border-[hsl(var(--accent)/0.3)] space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[hsl(var(--accent)/0.2)]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Basic Education Certificate Examination (BECE) & Stream</h4>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Min. 6 Passes Req.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">BECE Candidate Index Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 001928374"
                  value={beceDetails.indexNumber}
                  onChange={e => setBeceDetails(p => ({ ...p, indexNumber: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Total Subject Passes (Min. 6) *</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  required
                  value={beceDetails.totalPasses}
                  onChange={e => setBeceDetails(p => ({ ...p, totalPasses: parseInt(e.target.value) || 0 }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Preferred Senior Secondary Stream *</label>
                <select
                  value={beceDetails.selectedStream}
                  onChange={e => setBeceDetails(p => ({ ...p, selectedStream: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-black text-[hsl(var(--accent))] focus:outline-none"
                >
                  <option value="Science">🧪 Pure Science (Physics, Chem, Bio, Further Maths)</option>
                  <option value="Arts">🏛️ Arts & Humanities (Lit, Gov, History, CRK/IRK)</option>
                  <option value="Commercial">📈 Commercial / Business (Accounting, Commerce, Econ)</option>
                  <option value="Technical">⚙️ Technical & Applied Sciences</option>
                </select>
              </div>
            </div>

            {/* Core passes checklist */}
            <div className="pt-2 border-t border-[hsl(var(--accent)/0.15)]">
              <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-tertiary))] block mb-2">
                Compulsory Core Subjects Passed:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-[hsl(var(--text-primary))]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={beceDetails.passedEnglish}
                    onChange={e => setBeceDetails(p => ({ ...p, passedEnglish: e.target.checked }))}
                    className="w-4 h-4 accent-[hsl(var(--accent))]"
                  />
                  English Language
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={beceDetails.passedMaths}
                    onChange={e => setBeceDetails(p => ({ ...p, passedMaths: e.target.checked }))}
                    className="w-4 h-4 accent-[hsl(var(--accent))]"
                  />
                  Mathematics
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={beceDetails.passedScience}
                    onChange={e => setBeceDetails(p => ({ ...p, passedScience: e.target.checked }))}
                    className="w-4 h-4 accent-[hsl(var(--accent))]"
                  />
                  Integrated Science
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={beceDetails.passedSocialStudies}
                    onChange={e => setBeceDetails(p => ({ ...p, passedSocialStudies: e.target.checked }))}
                    className="w-4 h-4 accent-[hsl(var(--accent))]"
                  />
                  Social Studies
                </label>
              </div>
            </div>
          </div>
        )}

        {selectedLevel === 'TVET' && (
          <div className="p-6 rounded-3xl bg-[hsl(var(--accent)/0.06)] border border-[hsl(var(--accent)/0.3)] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[hsl(var(--accent)/0.2)]">
              <BookOpen className="w-5 h-5 text-[hsl(var(--accent))]" />
              <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Technical & Vocational Trade Specialization</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Vocational Trade Department *</label>
                <select
                  value={tvetDetails.chosenTrade}
                  onChange={e => setTvetDetails(p => ({ ...p, chosenTrade: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                >
                  <option>Information & Communications Technology (ICT)</option>
                  <option>Electrical Installation & Solar Maintenance</option>
                  <option>Automotive & Diesel Mechanics</option>
                  <option>Building Construction & Masonry</option>
                  <option>Fashion Design & Garment Technology</option>
                  <option>Catering & Hotel Management</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Prior Educational Pathway</label>
                <select
                  value={tvetDetails.entryQualification}
                  onChange={e => setTvetDetails(p => ({ ...p, entryQualification: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                >
                  <option>BECE Graduate (Direct NTC Entry)</option>
                  <option>WASSCE Candidate (National Diploma Entry)</option>
                  <option>NPSE / Community Literacy Certificate</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedLevel === 'Tertiary' && (
          <div className="p-6 rounded-3xl bg-[hsl(var(--accent)/0.06)] border border-[hsl(var(--accent)/0.3)] space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[hsl(var(--accent)/0.2)]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">WASSCE Accreditation & WAEC Scratch Card</h4>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Min. 5 Credits (C6+)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">WASSCE Index Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5019283719"
                  value={wassceDetails.indexNumber}
                  onChange={e => setWassceDetails(p => ({ ...p, indexNumber: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Total Credits (A1–C6) *</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  required
                  value={wassceDetails.creditsCount}
                  onChange={e => setWassceDetails(p => ({ ...p, creditsCount: parseInt(e.target.value) || 0 }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">WAEC Scratch Card PIN</label>
                <input
                  type="password"
                  placeholder="12-digit PIN"
                  value={wassceDetails.scratchCardPin}
                  onChange={e => setWassceDetails(p => ({ ...p, scratchCardPin: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Contact & Residence Details */}
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
          <h3 className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.12)] flex items-center justify-center text-xs">2</span>
            Contact & Residential Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Home Address *</label>
              <input
                type="text"
                required
                placeholder="Street address, community, or compound"
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">City / District *</label>
              <select
                value={formData.city}
                onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
              >
                <option>Freetown (Western Area Urban)</option>
                <option>Waterloo (Western Area Rural)</option>
                <option>Bo (Southern Province)</option>
                <option>Kenema (Eastern Province)</option>
                <option>Makeni (Northern Province)</option>
                <option>Port Loko (North West Province)</option>
                <option>Koidu (Kono District)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Applicant Phone Number</label>
              <input
                type="tel"
                placeholder="+232 76 000 000"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Parent / Guardian Details */}
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
          <h3 className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.12)] flex items-center justify-center text-xs">3</span>
            Parent & Guardian Emergency Contacts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Guardian Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mrs. Fatmata Koroma"
                value={formData.parentName}
                onChange={e => setFormData(p => ({ ...p, parentName: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Relationship *</label>
              <select
                value={formData.parentRelation}
                onChange={e => setFormData(p => ({ ...p, parentRelation: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
              >
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian / Sponsor</option>
                <option>Uncle / Aunt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Guardian Phone Number (Orange/Africell) *</label>
              <input
                type="tel"
                required
                placeholder="+232 78 123 456"
                value={formData.parentPhone}
                onChange={e => setFormData(p => ({ ...p, parentPhone: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Guardian Email Address *</label>
              <input
                type="email"
                required
                placeholder="guardian@gmail.com"
                value={formData.parentEmail}
                onChange={e => setFormData(p => ({ ...p, parentEmail: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Required Supporting Documents */}
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.12)] flex items-center justify-center text-xs">4</span>
              Required National Certification Documents ({selectedLevel})
            </h3>
            <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold">PDF, PNG, JPG (Max 5MB)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc, idx) => (
              <div key={doc.type} className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                    {doc.type}
                  </h4>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 truncate">
                    {doc.name ? `✓ ${doc.name}` : 'No document uploaded yet'}
                  </p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                      doc.name
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    {doc.name ? 'Change Document' : 'Select Document'}
                  </button>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => handleDocumentFileUpload(idx, e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[hsl(var(--border))]">
          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
            By submitting, you certify that all information and national exam scores are accurate and verifiable through WAEC / MBSSE registers.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Lodging Application…' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
