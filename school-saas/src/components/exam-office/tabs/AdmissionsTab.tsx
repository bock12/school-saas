'use client';

import { useState, useEffect } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  Users, Search, Plus, ChevronDown,
  CheckCircle2, XCircle, RefreshCw,
  BookOpen, Award, GraduationCap, Zap,
  FileText, ArrowRight, RotateCcw, Info,
  FlaskConical, Palette, Briefcase, Wrench,
  Printer, ShieldCheck
} from 'lucide-react';
import { AdmissionLetterModal, AdmissionApplicantData } from '../dashboard/AdmissionLetterModal';
import { CassExportModal } from '../dashboard/CassExportModal';

type ApplicantStage =
  | 'Application' | 'Document Review' | 'Assessment'
  | 'Interview' | 'Acceptance' | 'Enrolled' | 'Rejected';

type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender?: string;
  email?: string;
  phone?: string;
  school_level?: string;
  target_stream?: string;
  target_grade?: string;
  national_index_no?: string;
  npse_aggregate?: number;
  bece_aggregate?: number;
  bece_subjects?: { subject: string; grade: string; points: number }[];
  wassce_credits?: number;
  stream_auto_placed?: boolean;
  stage: ApplicantStage;
  created_at: string;
};

type SchoolLevel = {
  code: string;
  label: string;
  short_label: string;
  terminal_exam?: string;
  streams: string[];
};

type WaecGrade = {
  grade: string;
  min_score: number;
  max_score: number;
  grade_points: number;
  credit_value: number;
  remark: string;
};

type NationalExam = {
  code: string;
  full_name: string;
  school_level: string;
  sitting_class: string;
  core_subjects: string[];
};

const STAGE_CONFIG: Record<ApplicantStage, { color: string; bg: string; icon: React.ElementType }> = {
  'Application':     { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    icon: FileText },
  'Document Review': { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',  icon: BookOpen },
  'Assessment':      { color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', icon: FlaskConical },
  'Interview':       { color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20',    icon: Users },
  'Acceptance':      { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  'Enrolled':        { color: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20',  icon: GraduationCap },
  'Rejected':        { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',      icon: XCircle },
};

const STREAM_CONFIG: Record<string, { color: string; icon: React.ElementType; emoji: string }> = {
  'Science':    { color: 'text-cyan-400',   icon: FlaskConical, emoji: '🧪' },
  'Arts':       { color: 'text-pink-400',   icon: Palette,      emoji: '🎨' },
  'Commercial': { color: 'text-amber-400',  icon: Briefcase,    emoji: '💼' },
  'Technical':  { color: 'text-orange-400', icon: Wrench,       emoji: '🛠️' },
};

const LEVEL_COLORS: Record<string, string> = {
  KG:       'from-pink-500 to-rose-500',
  PRIMARY:  'from-blue-500 to-indigo-500',
  JSS:      'from-purple-500 to-violet-500',
  SSS:      'from-emerald-500 to-teal-500',
  TVET:     'from-orange-500 to-amber-500',
  TERTIARY: 'from-slate-500 to-zinc-500',
};

const STAGES: ApplicantStage[] = ['Application','Document Review','Assessment','Interview','Acceptance','Enrolled','Rejected'];
const BECE_CORE_SUBJECTS = ['Mathematics','English Language','Integrated Science','Social Studies'];
const BECE_GRADES = ['A1','B2','B3','C4','C5','C6','D7','E8','F9'];
const GRADE_POINTS: Record<string, number> = { A1:4.0,B2:3.5,B3:3.0,C4:2.5,C5:2.0,C6:1.5,D7:1.0,E8:0.5,F9:0.0 };

export function AdmissionsTab({ officer }: { officer: OfficerData }) {
  const [applicants, setApplicants]       = useState<Applicant[]>([]);
  const [schoolLevels, setSchoolLevels]   = useState<SchoolLevel[]>([]);
  const [gradeScale, setGradeScale]       = useState<WaecGrade[]>([]);
  const [nationalExams, setNationalExams] = useState<NationalExam[]>([]);
  const [stats, setStats]                 = useState<{ byStage: Record<string,number>; byStream: Record<string,number> } | null>(null);
  const [total, setTotal]                 = useState(0);
  const [isLoading, setIsLoading]         = useState(false);
  const [refreshKey, setRefreshKey]       = useState(0);
  const [search, setSearch]               = useState('');
  const [filterLevel, setFilterLevel]     = useState('');
  const [filterStream, setFilterStream]   = useState('');
  const [filterStage, setFilterStage]     = useState('');
  const [showForm, setShowForm]           = useState(false);
  const [formStep, setFormStep]           = useState(1);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitResult, setSubmitResult]   = useState<{stream?:string;auto?:boolean}|null>(null);
  const [selected, setSelected]           = useState<Applicant|null>(null);
  const [activeView, setActiveView]       = useState<'list'|'waec'|'cass'>('list');
  const [letterApplicant, setLetterApplicant] = useState<AdmissionApplicantData|null>(null);
  const [showCassExport, setShowCassExport]   = useState(false);
  const [form, setForm] = useState({
    firstName:'',lastName:'',dob:'',gender:'',email:'',phone:'',
    address:'',city:'',schoolLevel:'SSS',targetGrade:'SSS 1',
    previousSchool:'',nationalIndexNo:'',
    parentName:'',parentPhone:'',parentEmail:'',parentRelation:'Mother',
    npseAggregate:'',beceAggregate:'',preferredStream:'',
    beceSubjects: BECE_CORE_SUBJECTS.map(s => ({ subject: s, grade: 'C6', points: 1.5 })),
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ tenantSlug: officer.tenantSlug, limit: '50' });
        if (filterLevel)  params.append('schoolLevel', filterLevel);
        if (filterStream) params.append('stream', filterStream);
        if (filterStage)  params.append('stage', filterStage);
        if (search)       params.append('search', search);
        const res  = await fetch(`/api/admissions?${params}`);
        const json = await res.json();
        if (isMounted && json.success) {
          setApplicants(json.data.applicants ?? []);
          setTotal(json.data.total ?? 0);
          setSchoolLevels(json.data.referenceData?.schoolLevels ?? []);
          setGradeScale(json.data.referenceData?.gradeScale ?? []);
          setNationalExams(json.data.referenceData?.nationalExams ?? []);
          setStats(json.data.stats ?? null);
        }
      } catch (e) { console.warn('[AdmissionsTab]', e); }
      finally { if (isMounted) setIsLoading(false); }
    }
    load();
    return () => { isMounted = false; };
  }, [officer.tenantSlug, filterLevel, filterStream, filterStage, search, refreshKey]);

  const resetFilters = () => { setSearch(''); setFilterLevel(''); setFilterStream(''); setFilterStage(''); };

  const handleBeceGradeChange = (subject: string, grade: string) => {
    setForm(f => ({
      ...f,
      beceSubjects: f.beceSubjects.map(s =>
        s.subject === subject ? { ...s, grade, points: GRADE_POINTS[grade] ?? 0 } : s
      ),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        tenantSlug: officer.tenantSlug,
        firstName: form.firstName, lastName: form.lastName, dob: form.dob, gender: form.gender,
        email: form.email, phone: form.phone, address: form.address, city: form.city,
        schoolLevel: form.schoolLevel, targetGrade: form.targetGrade,
        previousSchool: form.previousSchool, nationalIndexNo: form.nationalIndexNo,
        parentName: form.parentName, parentPhone: form.parentPhone,
        parentEmail: form.parentEmail, parentRelation: form.parentRelation,
        npseAggregate: form.npseAggregate ? parseFloat(form.npseAggregate) : undefined,
        beceAggregate: form.beceAggregate ? parseFloat(form.beceAggregate) : undefined,
        beceSubjects:  form.schoolLevel === 'SSS' ? form.beceSubjects : undefined,
        preferredStream: form.preferredStream || undefined,
      };
      const res  = await fetch('/api/admissions', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        setSubmitResult({ stream: json.data.allocatedStream, auto: json.data.streamAutoPlaced });
        setFormStep(99);
        setRefreshKey(k => k + 1);
      }
    } catch (e) { console.warn('[submit]', e); }
    finally { setIsSubmitting(false); }
  };

  const defaultSchoolLevels: SchoolLevel[] = [
    {code:'KG',short_label:'KG',label:'Kindergarten',terminal_exam:undefined,streams:[]},
    {code:'PRIMARY',short_label:'Primary',label:'Primary School',terminal_exam:'NPSE',streams:[]},
    {code:'JSS',short_label:'JSS',label:'Junior Secondary',terminal_exam:'BECE',streams:[]},
    {code:'SSS',short_label:'SSS',label:'Senior Secondary',terminal_exam:'WASSCE',streams:['Science','Arts','Commercial']},
    {code:'TVET',short_label:'TVET',label:'Technical & Vocational',terminal_exam:'NCTVA',streams:[]},
    {code:'TERTIARY',short_label:'Uni',label:'University / Higher Ed',terminal_exam:undefined,streams:[]},
  ];
  const displayLevels = schoolLevels.length > 0 ? schoolLevels : defaultSchoolLevels;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">🇸🇱 National Admissions Center</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-0.5">Sierra Leone Education System — MBSSE · WAEC · NCTVA · MHERST</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveView(v => v === 'waec' ? 'list' : 'waec')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeView === 'waec' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'}`}>
            <Award className="w-3.5 h-3.5" /> WAEC Scale
          </button>
          <button onClick={() => setActiveView(v => v === 'cass' ? 'list' : 'cass')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeView === 'cass' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'}`}>
            <BookOpen className="w-3.5 h-3.5" /> CASS 30/70
          </button>
          <button onClick={() => setShowCassExport(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Export MBSSE CASS
          </button>
          <button onClick={() => { setShowForm(true); setFormStep(1); setSubmitResult(null); }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-lg">
            <Plus className="w-3.5 h-3.5" /> New Applicant
          </button>
        </div>
      </div>

      {activeView === 'waec' && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">WAEC 9-Point Grading Scale (Official)</h2>
            <span className="ml-auto text-xs text-[hsl(var(--text-tertiary))]">Credits: A1 — C6 · Pass: D7, E8 · Fail: F9</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Grade','Score Range','Grade Points','Credit?','Remark'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {gradeScale.length > 0 ? gradeScale.map(g => (
                  <tr key={g.grade} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="py-2.5 px-3 font-black text-[hsl(var(--text-primary))] text-base">{g.grade}</td>
                    <td className="py-2.5 px-3 text-xs text-[hsl(var(--text-secondary))]">{g.min_score} – {g.max_score}%</td>
                    <td className="py-2.5 px-3 text-xs font-bold text-violet-400">{g.grade_points.toFixed(1)}</td>
                    <td className="py-2.5 px-3">
                      {g.credit_value === 1
                        ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">Credit</span>
                        : <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 font-bold">—</span>}
                    </td>
                    <td className={`py-2.5 px-3 text-xs font-semibold ${g.grade === 'F9' ? 'text-red-400' : g.credit_value === 1 ? 'text-emerald-400' : 'text-amber-400'}`}>{g.remark}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-8 text-center text-xs text-[hsl(var(--text-tertiary))]">Run migration 037 to load WAEC grade scale data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'cass' && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">MBSSE CASS — Continuous Assessment System</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['PRIMARY','JSS','SSS'].map(level => (
              <div key={level} className="rounded-xl p-4 border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] space-y-3">
                <p className="font-black text-xs text-[hsl(var(--text-primary))] uppercase tracking-wider">{level}</p>
                <div className="flex gap-3">
                  <div className="flex-1 text-center p-2 rounded-lg bg-violet-500/10">
                    <p className="text-2xl font-black text-violet-400">30%</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold mt-0.5">CA (3×10%)</p>
                  </div>
                  <div className="flex-1 text-center p-2 rounded-lg bg-amber-500/10">
                    <p className="text-2xl font-black text-amber-400">70%</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold mt-0.5">Final Exam</p>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  {['CA 1','CA 2','CA 3'].map(ca => (
                    <div key={ca} className="flex justify-between text-[hsl(var(--text-secondary))]"><span>{ca}</span><span className="font-bold">10%</span></div>
                  ))}
                  <div className="flex justify-between text-[hsl(var(--text-tertiary))] border-t border-[hsl(var(--border))] pt-1"><span>Final Exam</span><span className="font-bold">70%</span></div>
                  <div className="flex justify-between font-black text-[hsl(var(--text-primary))] border-t border-[hsl(var(--border))] pt-1"><span>Total</span><span>100%</span></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            MBSSE standard: 30% Continuous Assessment + 70% External Examination. Customisable per tenant in Settings.
          </p>
        </div>
      )}

      {activeView === 'list' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
            {displayLevels.map(level => (
              <button key={level.code}
                onClick={() => setFilterLevel(filterLevel === level.code ? '' : level.code)}
                className={`rounded-xl p-3 text-left transition-all border ${filterLevel === level.code ? 'border-violet-500/50 bg-violet-500/10' : 'glass-card border-[hsl(var(--border))] hover:border-violet-500/30'}`}>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${LEVEL_COLORS[level.code] ?? 'from-slate-500 to-zinc-500'} flex items-center justify-center mb-2`}>
                  <span className="text-[10px] font-black text-white">{level.short_label}</span>
                </div>
                <p className="text-xs font-black text-[hsl(var(--text-primary))] leading-tight">{level.label}</p>
                {level.terminal_exam && (
                  <span className="text-[9px] font-bold text-violet-400 mt-0.5 block">{level.terminal_exam}</span>
                )}
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">
                  {applicants.filter(a => a.school_level === level.code).length} applicants
                </p>
              </button>
            ))}
          </div>

          {nationalExams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {nationalExams.map(exam => (
                <div key={exam.code} className="glass-card rounded-xl p-3 flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${LEVEL_COLORS[exam.school_level] ?? 'from-slate-500 to-zinc-500'}`}>
                    <span className="text-[9px] font-black text-white text-center leading-tight">{exam.code}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[hsl(var(--text-primary))] leading-snug truncate">{exam.full_name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Sitting: {exam.sitting_class}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exam.core_subjects.slice(0,3).map(s => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] font-medium">{s}</span>
                      ))}
                      {exam.core_subjects.length > 3 && <span className="text-[9px] text-[hsl(var(--text-tertiary))]">+{exam.core_subjects.length-3}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stats?.byStream && Object.keys(stats.byStream).length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <p className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider">SSS Stream Distribution</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Science','Arts','Commercial','Technical'].map(stream => {
                  const cfg = STREAM_CONFIG[stream];
                  const count = stats.byStream[stream] ?? 0;
                  return (
                    <button key={stream} onClick={() => setFilterStream(filterStream === stream ? '' : stream)}
                      className={`rounded-xl p-3 text-left transition-all border ${filterStream === stream ? 'border-violet-500/50 bg-violet-500/10' : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] hover:border-violet-500/30'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span>{cfg.emoji}</span>
                        <span className={`text-xs font-black ${cfg.color}`}>{stream}</span>
                      </div>
                      <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{count}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">SSS applicants</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {stats?.byStage && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
                <p className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider">Admissions Pipeline</p>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {STAGES.map((stage, i) => {
                  const cfg = STAGE_CONFIG[stage];
                  const count = stats.byStage[stage] ?? 0;
                  const Icon = cfg.icon;
                  return (
                    <div key={stage} className="flex items-center flex-shrink-0">
                      <button onClick={() => setFilterStage(filterStage === stage ? '' : stage)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${filterStage === stage ? 'border-violet-500/50 bg-violet-500/10' : `${cfg.bg} border`}`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className={`text-[10px] font-black ${cfg.color}`}>{stage.split(' ')[0]}</span>
                        <span className="text-sm font-black text-[hsl(var(--text-primary))]">{count}</span>
                      </button>
                      {i < STAGES.length - 1 && <div className="w-3 h-0.5 bg-[hsl(var(--border))] mx-0.5 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              <input type="text" placeholder="Search by name or index no…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-violet-500/50" />
            </div>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
              <option value="">All Levels</option>
              <option value="KG">Kindergarten</option>
              <option value="PRIMARY">Primary</option>
              <option value="JSS">JSS</option>
              <option value="SSS">SSS</option>
              <option value="TVET">TVET</option>
              <option value="TERTIARY">University</option>
            </select>
            {filterLevel === 'SSS' && (
              <select value={filterStream} onChange={e => setFilterStream(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
                <option value="">All Streams</option>
                <option value="Science">Science 🧪</option>
                <option value="Arts">Arts 🎨</option>
                <option value="Commercial">Commercial 💼</option>
                <option value="Technical">Technical 🛠️</option>
              </select>
            )}
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
              <option value="">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={resetFilters} className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors" title="Reset filters">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setRefreshKey(k => k + 1)} disabled={isLoading} className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-violet-400 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-violet-400' : ''}`} />
            </button>
            <span className="text-xs text-[hsl(var(--text-tertiary))] font-semibold ml-auto">{total} applicant{total !== 1 ? 's' : ''}</span>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                    {['Applicant','Level','Stream','Exam Score','Stage','Placed',''].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {isLoading ? (
                    <tr><td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                        <span className="text-xs text-[hsl(var(--text-tertiary))]">Loading applicants…</span>
                      </div>
                    </td></tr>
                  ) : applicants.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center">
                      <GraduationCap className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-[hsl(var(--text-tertiary))]">No applicants found</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Add your first Sierra Leone applicant using the &quot;New Applicant&quot; button above.</p>
                    </td></tr>
                  ) : applicants.map(a => {
                    const stageCfg = STAGE_CONFIG[a.stage] ?? STAGE_CONFIG['Application'];
                    const StageIcon = stageCfg.icon;
                    const streamCfg = a.target_stream ? STREAM_CONFIG[a.target_stream] : null;
                    return (
                      <tr key={a.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors cursor-pointer" onClick={() => setSelected(a)}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white bg-gradient-to-br ${LEVEL_COLORS[a.school_level ?? 'SSS'] ?? 'from-slate-500 to-zinc-500'}`}>
                              {a.first_name.charAt(0)}{a.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{a.first_name} {a.last_name}</p>
                              {a.national_index_no && <p className="text-[10px] text-violet-400 font-mono">{a.national_index_no}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-gradient-to-r ${LEVEL_COLORS[a.school_level ?? ''] ?? 'from-slate-500 to-zinc-500'} text-white`}>
                            {a.school_level ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {streamCfg ? (
                            <span className={`text-xs font-bold flex items-center gap-1 ${streamCfg.color}`}>
                              <streamCfg.icon className="w-3 h-3" />
                              {a.target_stream}
                              {a.stream_auto_placed && <span className="text-[9px] px-1 rounded bg-violet-500/15 text-violet-400 font-bold">Auto</span>}
                            </span>
                          ) : <span className="text-xs text-[hsl(var(--text-tertiary))]">—</span>}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          {a.school_level === 'PRIMARY' && a.npse_aggregate && <span className="text-blue-400 font-bold">NPSE: {a.npse_aggregate}</span>}
                          {(a.school_level === 'JSS' || a.school_level === 'SSS') && a.bece_aggregate && <span className="text-purple-400 font-bold">BECE: {a.bece_aggregate}</span>}
                          {a.wassce_credits != null && <span className="text-amber-400 font-bold"> · {a.wassce_credits} Credits</span>}
                          {!a.npse_aggregate && !a.bece_aggregate && !a.wassce_credits && <span className="text-[hsl(var(--text-tertiary))]">—</span>}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageCfg.bg} ${stageCfg.color}`}>
                            <StageIcon className="w-2.5 h-2.5" />{a.stage}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold ${a.stream_auto_placed ? 'text-violet-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                            {a.stream_auto_placed ? 'Auto' : 'Manual'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] rotate-[-90deg]" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-[hsl(var(--text-primary))]">{selected.first_name} {selected.last_name}</h2>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{selected.school_level} · {selected.stage}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase">DOB</p><p className="font-semibold text-[hsl(var(--text-primary))]">{selected.dob}</p></div>
              <div><p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase">Gender</p><p className="font-semibold text-[hsl(var(--text-primary))]">{selected.gender ?? '—'}</p></div>
              <div><p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase">National Index No.</p><p className="font-bold text-violet-400 font-mono">{selected.national_index_no ?? '—'}</p></div>
              <div><p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase">Target Grade</p><p className="font-semibold text-[hsl(var(--text-primary))]">{selected.target_grade ?? '—'}</p></div>
              {selected.npse_aggregate != null && <div><p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase">NPSE Aggregate</p><p className="font-black text-blue-400 text-lg">{selected.npse_aggregate}</p></div>}
              {selected.bece_aggregate != null && <div><p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase">BECE Aggregate</p><p className="font-black text-purple-400 text-lg">{selected.bece_aggregate}</p></div>}
            </div>
            {selected.target_stream && (
              <div className="rounded-xl p-3 flex items-center gap-3 bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))]">
                <span className="text-2xl">{STREAM_CONFIG[selected.target_stream]?.emoji ?? '📚'}</span>
                <div>
                  <p className={`font-black text-sm ${STREAM_CONFIG[selected.target_stream]?.color ?? 'text-violet-400'}`}>{selected.target_stream} Stream</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{selected.stream_auto_placed ? '✓ Auto-placed by BECE stream allocator' : 'Manually assigned'}</p>
                </div>
              </div>
            )}
            {selected.bece_subjects && Array.isArray(selected.bece_subjects) && selected.bece_subjects.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">BECE Results</p>
                <div className="space-y-1">
                  {(selected.bece_subjects as { subject: string; grade: string; points: number }[]).map(s => (
                    <div key={s.subject} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                      <span className="text-[hsl(var(--text-secondary))]">{s.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${['A1','B2','B3','C4','C5','C6'].includes(s.grade) ? 'text-emerald-400' : s.grade === 'F9' ? 'text-red-400' : 'text-amber-400'}`}>{s.grade}</span>
                        <span className="text-[hsl(var(--text-tertiary))]">{s.points.toFixed(1)} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[hsl(var(--border))] flex justify-end">
              <button
                onClick={() => { setLetterApplicant(selected); setSelected(null); }}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" /> Print Official Admission Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setFormStep(1); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl glass-card rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">🇸🇱 New Admission Applicant</h2>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">
                  {formStep === 1 ? 'Step 1 / 3 — Personal Information' : formStep === 2 ? 'Step 2 / 3 — Academic & Exam Records' : formStep === 3 ? 'Step 3 / 3 — Parent / Guardian' : 'Application Submitted!'}
                </p>
              </div>
              <button onClick={() => { setShowForm(false); setFormStep(1); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            {formStep < 99 && (
              <div className="px-5 pt-3 flex gap-1.5 flex-shrink-0">
                {[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded-full transition-all ${formStep >= s ? 'bg-violet-500' : 'bg-[hsl(var(--border))]'}`} />)}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {formStep === 99 && submitResult && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-[hsl(var(--text-primary))] text-lg">Application Submitted!</h3>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Applicant has been added to the admissions pipeline.</p>
                  </div>
                  {submitResult.stream && (
                    <div className={`rounded-xl p-4 flex items-center gap-3 mx-auto max-w-xs ${submitResult.auto ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]'}`}>
                      <span className="text-2xl">{STREAM_CONFIG[submitResult.stream]?.emoji ?? '📚'}</span>
                      <div className="text-left">
                        <p className={`font-black text-sm ${STREAM_CONFIG[submitResult.stream]?.color ?? 'text-violet-400'}`}>{submitResult.stream} Stream</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{submitResult.auto ? '✓ Auto-placed by BECE stream allocator' : 'Manually assigned'}</p>
                      </div>
                    </div>
                  )}
                  <button onClick={() => { setShowForm(false); setFormStep(1); }} className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold">Done</button>
                </div>
              )}
              {formStep === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">First Name *</label>
                      <input value={form.firstName} onChange={e => setForm(f=>({...f,firstName:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Last Name *</label>
                      <input value={form.lastName} onChange={e => setForm(f=>({...f,lastName:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Date of Birth *</label>
                      <input type="date" value={form.dob} onChange={e => setForm(f=>({...f,dob:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Gender</label>
                      <select value={form.gender} onChange={e => setForm(f=>({...f,gender:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
                        <option value="">Select</option><option>Male</option><option>Female</option>
                      </select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Phone</label>
                      <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                  </div>
                  <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Home Address</label>
                    <input value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                </div>
              )}
              {formStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Applying For Level *</label>
                      <select value={form.schoolLevel} onChange={e => setForm(f=>({...f,schoolLevel:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
                        <option value="KG">Kindergarten (KG)</option>
                        <option value="PRIMARY">Primary (Class 1-6)</option>
                        <option value="JSS">Junior Secondary (JSS 1-3)</option>
                        <option value="SSS">Senior Secondary (SSS 1-3)</option>
                        <option value="TVET">Technical / Vocational (TVET)</option>
                        <option value="TERTIARY">University / Higher Ed</option>
                      </select></div>
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Target Class</label>
                      <input value={form.targetGrade} onChange={e => setForm(f=>({...f,targetGrade:e.target.value}))} placeholder="e.g. SSS 1" className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">WAEC National Index No.</label>
                      <input value={form.nationalIndexNo} onChange={e => setForm(f=>({...f,nationalIndexNo:e.target.value}))} placeholder="e.g. 4230123001" className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] font-mono focus:outline-none focus:border-violet-500/50" /></div>
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Previous School</label>
                      <input value={form.previousSchool} onChange={e => setForm(f=>({...f,previousSchool:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                  </div>
                  {(form.schoolLevel === 'PRIMARY' || form.schoolLevel === 'JSS') && (
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">NPSE Aggregate Score</label>
                      <input type="number" value={form.npseAggregate} onChange={e => setForm(f=>({...f,npseAggregate:e.target.value}))} placeholder="e.g. 235" className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                  )}
                  {form.schoolLevel === 'SSS' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">BECE Results (Auto Stream Allocation)</label>
                        <span className="text-[9px] text-violet-400 font-bold flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> Auto-allocates stream</span>
                      </div>
                      <input type="number" value={form.beceAggregate} onChange={e => setForm(f=>({...f,beceAggregate:e.target.value}))} placeholder="BECE Aggregate (e.g. 248)" className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" />
                      <div className="space-y-1.5">
                        {form.beceSubjects.map(s => (
                          <div key={s.subject} className="flex items-center gap-2">
                            <span className="flex-1 text-xs text-[hsl(var(--text-secondary))] truncate">{s.subject}</span>
                            <select value={s.grade} onChange={e => handleBeceGradeChange(s.subject, e.target.value)} className="px-2 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
                              {BECE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <span className={`text-[10px] font-bold w-14 text-right ${['A1','B2','B3','C4','C5','C6'].includes(s.grade) ? 'text-emerald-400' : s.grade === 'F9' ? 'text-red-400' : 'text-amber-400'}`}>{GRADE_POINTS[s.grade]?.toFixed(1)} pts</span>
                          </div>
                        ))}
                      </div>
                      <select value={form.preferredStream} onChange={e => setForm(f=>({...f,preferredStream:e.target.value}))} className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
                        <option value="">Auto-allocate from BECE ⚡</option>
                        <option value="Science">Science 🧪</option>
                        <option value="Arts">Arts 🎨</option>
                        <option value="Commercial">Commercial 💼</option>
                        <option value="Technical">Technical 🛠️</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
              {formStep === 3 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Parent / Guardian Name *</label>
                      <input value={form.parentName} onChange={e => setForm(f=>({...f,parentName:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Relation</label>
                      <select value={form.parentRelation} onChange={e => setForm(f=>({...f,parentRelation:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50">
                        <option>Mother</option><option>Father</option><option>Guardian</option><option>Sibling</option><option>Other</option>
                      </select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Parent Phone *</label>
                      <input value={form.parentPhone} onChange={e => setForm(f=>({...f,parentPhone:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                    <div><label className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Parent Email</label>
                      <input type="email" value={form.parentEmail} onChange={e => setForm(f=>({...f,parentEmail:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50" /></div>
                  </div>
                  <div className="rounded-xl p-3 border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-1.5 text-xs">
                    <p className="font-black text-[hsl(var(--text-primary))] text-[10px] uppercase tracking-wider mb-2">Application Summary</p>
                    <div className="flex justify-between"><span className="text-[hsl(var(--text-tertiary))]">Applicant</span><span className="font-bold text-[hsl(var(--text-primary))]">{form.firstName} {form.lastName}</span></div>
                    <div className="flex justify-between"><span className="text-[hsl(var(--text-tertiary))]">Level</span><span className="font-bold text-[hsl(var(--text-primary))]">{form.schoolLevel}</span></div>
                    <div className="flex justify-between"><span className="text-[hsl(var(--text-tertiary))]">Target Class</span><span className="font-bold text-[hsl(var(--text-primary))]">{form.targetGrade}</span></div>
                    {form.schoolLevel === 'SSS' && <div className="flex justify-between"><span className="text-[hsl(var(--text-tertiary))]">Stream</span><span className="font-bold text-violet-400">{form.preferredStream || 'Auto (BECE) ⚡'}</span></div>}
                  </div>
                </div>
              )}
            </div>
            {formStep < 99 && (
              <div className="p-4 border-t border-[hsl(var(--border))] flex items-center gap-2 flex-shrink-0">
                {formStep > 1 && (
                  <button onClick={() => setFormStep(s => s - 1)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">Back</button>
                )}
                <div className="flex-1" />
                {formStep < 3 ? (
                  <button onClick={() => setFormStep(s => s + 1)} disabled={formStep === 1 && (!form.firstName || !form.lastName || !form.dob)} className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5">
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={isSubmitting || !form.parentName || !form.parentPhone} className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5">
                    {isSubmitting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting…</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Submit Application</>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Sierra Leone Admission Letter Modal */}
      {letterApplicant && (
        <AdmissionLetterModal
          applicant={letterApplicant}
          officer={officer}
          onClose={() => setLetterApplicant(null)}
        />
      )}

      {/* MBSSE CASS Mark Exporter & Auditor Modal */}
      {showCassExport && (
        <CassExportModal
          officer={officer}
          onClose={() => setShowCassExport(false)}
        />
      )}
    </div>
  );
}
