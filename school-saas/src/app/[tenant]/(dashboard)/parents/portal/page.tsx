'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  GraduationCap, CalendarCheck, BookOpen, Clock, Users, ShieldAlert,
  Menu, Plus, Search, RotateCcw, AlertTriangle, CheckCircle2,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  Calendar, Layers, MessageSquare, Landmark, HelpCircle, Save, Sparkles, UserCheck,
  Award, ClipboardList, Send, Lightbulb, UserX, Heart, BookOpenCheck, Brain, PlusCircle,
  DollarSign, ShieldCheck, Briefcase, Eye, Shield, UsersRound, Scale, Phone, Trash2, BookMarked,
  CheckSquare, Trophy, HeartHandshake, Bus
} from 'lucide-react';

type ParentTab =
  | 'dashboard'
  | 'academics'
  | 'attendance'
  | 'timetable'
  | 'fees'
  | 'communication'
  | 'conduct'
  | 'health'
  | 'ai-assistant'
  | 'settings';

interface Sibling {
  id: string;
  name: string;
  photoUrl?: string;
  class: string;
  stream: string;
  house: string;
  dob: string;
  rollNo: string;
  admissionNo: string;
  gpa: string;
  attendancePercent: string;
  feeStatus: string;
  outstandingBalance: number;
  clinicAlerts: string;
  conductSummary: string;
  transportStatus: string;
  hostelStatus: string;
  homeroomTeacher: string;
  recentGrades: { subject: string; score: number; grade: string }[];
  todayClasses: { time: string; subject: string; teacher: string; room: string }[];
}

const mockSiblings: Sibling[] = [
  {
    id: 'child_1',
    name: 'Sarah Obi',
    class: 'Senior Secondary 2',
    stream: 'SS2 Blue',
    house: 'Red House',
    dob: '12th April 2010',
    rollNo: '#14',
    admissionNo: 'ADM-908122-SL',
    gpa: '3.82 / 4.0',
    attendancePercent: '96.4%',
    feeStatus: 'Outstanding Balance',
    outstandingBalance: 120000,
    clinicAlerts: 'Asthma Inhaler required inside backpack & Penicillin Allergy',
    conductSummary: '+15 Merit points for Science Fair runner-up',
    transportStatus: 'Bus Route 4 (Aberdeen Road) - Picked Up at 07:15 AM',
    hostelStatus: 'Day Student (Non-Boarding)',
    homeroomTeacher: 'Mr. Kwame Darko',
    recentGrades: [
      { subject: 'Mathematics (Algebra)', score: 92, grade: 'A' },
      { subject: 'Organic Chemistry', score: 78, grade: 'B' },
      { subject: 'English Grammar', score: 85, grade: 'A' }
    ],
    todayClasses: [
      { time: '08:30 AM — 09:30 AM', subject: 'Grade 10 Algebra', teacher: 'Mr. Kwame Darko', room: 'Room 104' },
      { time: '09:45 AM — 10:45 AM', subject: 'Organic Chemistry', teacher: 'Mrs. Beatrice Mensah', room: 'Chemistry Lab B' },
      { time: '11:30 AM — 12:30 PM', subject: 'English Literature', teacher: 'Dr. Stella Gbandi', room: 'Main Lecture Hall 1' }
    ]
  },
  {
    id: 'child_2',
    name: 'Chinedu Obi',
    class: 'Junior Secondary 1',
    stream: 'JS1 Gold',
    house: 'Blue House',
    dob: '5th August 2013',
    rollNo: '#08',
    admissionNo: 'ADM-412255-SL',
    gpa: '3.15 / 4.0',
    attendancePercent: '98.2%',
    feeStatus: 'Fully Cleared',
    outstandingBalance: 0,
    clinicAlerts: 'No active medical conditions logged',
    conductSummary: 'Outstanding performance in Junior Debate group',
    transportStatus: 'Day student - Parent drop-off',
    hostelStatus: 'Boarding Student (Boys Dormitory Room 12)',
    homeroomTeacher: 'Mrs. Cynthia Cole',
    recentGrades: [
      { subject: 'Introductory Technology', score: 72, grade: 'C' },
      { subject: 'Basic Mathematics', score: 81, grade: 'B' },
      { subject: 'Integrated Science', score: 90, grade: 'A' }
    ],
    todayClasses: [
      { time: '08:30 AM — 09:30 AM', subject: 'Basic Mathematics', teacher: 'Mr. Kofi Mensah', room: 'Room 202' },
      { time: '09:45 AM — 10:45 AM', subject: 'Integrated Science', teacher: 'Mrs. Cynthia Cole', room: 'Biology Lab A' },
      { time: '11:30 AM — 12:30 PM', subject: 'Introductory Technology', teacher: 'Engr. David Bell', room: 'Workshops Room C' }
    ]
  }
];

export default function ParentPortalDashboard() {
  const params = useParams();
  const tenant = params.tenant as string;
  
  const [siblings, setSiblings] = useState<Sibling[]>(mockSiblings);
  const [selectedChildId, setSelectedChildId] = useState<string>('child_1');
  const [activeTab, setActiveTab] = useState<ParentTab>('dashboard');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // AI assistant prompt
  const [aiPrompt, setAiPrompt] = useState('Suggest ways to support Sarah in Organic Chemistry');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  
  // Action notifications
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Active child context
  const activeChild = siblings.find(s => s.id === selectedChildId) || siblings[0];

  const handleAction = (msg: string) => {
    setSaving(true);
    setSavedMessage(null);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(`Action "${msg}" completed!`);
      setTimeout(() => setSavedMessage(null), 3000);
    }, 800);
  };

  const handlePayFees = () => {
    setSaving(true);
    setSavedMessage(null);
    setTimeout(() => {
      setSaving(false);
      // Update balance to 0 for selected child
      setSiblings(prev => prev.map(s => {
        if (s.id === selectedChildId) {
          return { ...s, outstandingBalance: 0, feeStatus: 'Fully Cleared' };
        }
        return s;
      }));
      setSavedMessage(`Payment of ₦${activeChild.outstandingBalance.toLocaleString()} processed successfully! Receipt REC-${Math.floor(Math.random() * 90000) + 10000} generated.`);
      setTimeout(() => setSavedMessage(null), 5000);
    }, 1200);
  };

  const handleAskAI = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (aiPrompt.toLowerCase().includes('chemistry')) {
        setAiResponse(
          "Based on Sarah's score (78% / B), she has a solid foundation in chemistry but needs support with organic carbon formulas. Suggestion: Dedicate 30 mins each Tuesday to flashcards covering naming rules (alkanes/alkenes). Check LMS chemistry notes under Chapter 4."
        );
      } else {
        setAiResponse(
          `AI Assistant Output: Here is a custom progress summary and recommended study strategies for ${activeChild.name} based on active teacher comment history and subject scores. Review chapter notes on LMS and set week targets.`
        );
      }
    }, 800);
  };

  const tabItems = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'academics', label: 'Grades & Reports', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'fees', label: 'Fees & Invoices', icon: DollarSign },
    { id: 'communication', label: 'Teachers Contact', icon: MessageSquare },
    { id: 'conduct', label: 'Behavior Records', icon: Scale },
    { id: 'health', label: 'Health Center', icon: Heart },
    { id: 'ai-assistant', label: 'AI Parent Guide', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Sibling child selector and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <UsersRound className="w-8 h-8 text-[hsl(var(--accent))]" />
            Parent Portal Workspace
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Secure parent console. Access report cards, review balances, message homeroom teachers, and sync events calendar.
          </p>
        </div>

        {/* Dynamic Sibling Quick Cards */}
        <div className="flex gap-3">
          {siblings.map(sib => (
            <button
              key={sib.id}
              onClick={() => setSelectedChildId(sib.id)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                selectedChildId === sib.id
                  ? 'bg-[hsl(var(--accent)/0.12)] border-[hsl(var(--accent))] text-[hsl(var(--text-primary))] shadow-glow'
                  : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent)/0.2)] flex items-center justify-center font-bold text-xs text-[hsl(var(--accent))]">
                {sib.name.split(' ')[0][0]}
              </div>
              <div>
                <p className="font-bold text-xs">{sib.name}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">{sib.stream}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Desktop Horizontal Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as ParentTab);
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md shadow-[hsl(var(--accent)/0.15)]'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] flex items-center justify-around py-2 px-4 shadow-2xl md:hidden">
        {tabItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as ParentTab);
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
              activeTab === item.id && !showMoreMenu
                ? 'text-[hsl(var(--accent))] font-bold'
                : 'text-[hsl(var(--text-tertiary))]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMoreMenu(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
            showMoreMenu
              ? 'text-[hsl(var(--accent))] font-bold'
              : 'text-[hsl(var(--text-tertiary))]'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {!tabItems.slice(0, 4).map(i => i.id).includes(activeTab) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight">More</span>
        </button>
      </div>

      {/* Bottom Sheet Backdrop & Panel for Mobile */}
      {showMoreMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="fixed bottom-14 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto md:hidden animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-[hsl(var(--border))] mb-3">
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Parent Sections</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tabItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ParentTab);
                    setShowMoreMenu(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] font-bold'
                      : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Pages Content Switcher */}
      <div className="pb-24 md:pb-0">
        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick KPI stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)] rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Attendance Percentage</span>
                <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">{activeChild.attendancePercent}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Target threshold met</p>
              </div>

              <div className="glass-card p-4 border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)] rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Fee Standings</span>
                <p className={`text-xl font-extrabold ${activeChild.outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {activeChild.outstandingBalance > 0 ? `₦${activeChild.outstandingBalance.toLocaleString()}` : 'Cleared'}
                </p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">{activeChild.feeStatus}</p>
              </div>

              <div className="glass-card p-4 border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)] rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Child GPA average</span>
                <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">{activeChild.gpa}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">SS2 Cumulative</p>
              </div>

              <div className="glass-card p-4 border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)] rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Boarding / Hostel</span>
                <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">{activeChild.hostelStatus.split(' ')[0]}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">{activeChild.hostelStatus}</p>
              </div>
            </div>

            {/* Split layout: Child specs and announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Child card detail specs */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[hsl(var(--accent))]" /> Sibling Information Card
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Class Stream</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))]">{activeChild.stream} &bull; {activeChild.house}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Homeroom / Class Teacher</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))]">{activeChild.homeroomTeacher}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Student Admission Number</p>
                      <p className="font-semibold font-mono text-[hsl(var(--text-primary))]">{activeChild.admissionNo}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Transit Transport Route</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))]">{activeChild.transportStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Sibling Recent Grades test results */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[hsl(var(--accent))]" /> Recent Quiz &amp; Grade Results
                  </p>
                  <div className="space-y-3">
                    {activeChild.recentGrades.map((grade, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                        <div>
                          <p className="font-bold text-[hsl(var(--text-primary))]">{grade.subject}</p>
                          <p className="text-[9px] text-[hsl(var(--text-tertiary))]">Continuous Assessment</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[hsl(var(--accent))]">Grade {grade.grade}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">Score: {grade.score}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sidebar options */}
              <div className="space-y-6">
                
                {/* AI Parent Guide assistant */}
                <div className="glass-card p-5 border border-indigo-500/20 bg-indigo-500/5 space-y-3 rounded-xl">
                  <p className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Brain className="w-4 h-4" /> AI Parent Assistant
                  </p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Translate report card grading structures or draft emails directly to the subject teachers.</p>
                  <textarea
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg p-2.5 text-[11px] text-[hsl(var(--text-primary))] h-20"
                  />
                  <button onClick={handleAskAI} className="w-full py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:opacity-90 transition-all text-xs">
                    Draft Strategy Advice
                  </button>
                  {aiResponse && (
                    <div className="p-3 border border-indigo-500/10 bg-indigo-950/20 rounded-lg text-[10px] leading-relaxed text-[hsl(var(--text-secondary))] mt-2">
                      {aiResponse}
                    </div>
                  )}
                </div>

                {/* Health Clinic warnings */}
                <div className="glass-card p-5 border border-rose-500/20 bg-rose-500/5 space-y-2 rounded-xl">
                  <p className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" /> Active Health Alerts
                  </p>
                  <p className="text-[11px] text-[hsl(var(--text-primary))] leading-relaxed font-semibold">
                    {activeChild.clinicAlerts}
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Academics */}
        {activeTab === 'academics' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Academic Gradebook Transcript</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Consolidated Continuous Assessments and terminal exam grades records.</p>
              </div>
              <button onClick={() => handleAction('Report Card slip download')} className="px-3.5 py-1.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--border))] font-bold">
                Download Official Report Card PDF
              </button>
            </div>

            <div className="space-y-4">
              {activeChild.recentGrades.map((g, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{g.subject}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Subject Tutor: {activeChild.homeroomTeacher}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-[hsl(var(--accent))]">Grade {g.grade}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Raw Score: {g.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Attendance */}
        {activeTab === 'attendance' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Attendance Track Timeline</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Monthly present percentage ratios and check-in timeline.</p>
            <div className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))] text-center">
              Active Attendance Calendar Tracker for {activeChild.name} ({activeChild.attendancePercent} Present rate logged).
            </div>
          </div>
        )}

        {/* Tab 4: Timetable */}
        {activeTab === 'timetable' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Lecture periods timetable</h3>
            <div className="space-y-4">
              {activeChild.todayClasses.map((cl, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{cl.subject}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{cl.teacher} &bull; Room {cl.room}</p>
                  </div>
                  <p className="text-xs font-mono text-[hsl(var(--text-secondary))]">{cl.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Fees & Invoices */}
        {activeTab === 'fees' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Outstanding Balances &amp; Online Payments</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Review invoices and pay online securely using linked cards/accounts.</p>
              </div>
              {activeChild.outstandingBalance > 0 ? (
                <button onClick={handlePayFees} className="px-5 py-2.5 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white rounded-lg font-bold hover:opacity-90">
                  Pay Outstanding ₦{activeChild.outstandingBalance.toLocaleString()}
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  Balance Fully Cleared
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">Tuition Fee Installment 1 - Term 2</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold mt-1">Invoice: INV-2026-908221</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[hsl(var(--text-primary))]">₦120,000</p>
                  <p className="text-[10px] text-amber-400 font-bold mt-1">{activeChild.outstandingBalance > 0 ? 'Pending Payment' : 'Settled'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Communication */}
        {activeTab === 'communication' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Message Homeroom Teacher</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Send messages directly to {activeChild.homeroomTeacher}.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Type a message to the tutor..." className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg p-2.5 flex-1 text-[hsl(var(--text-primary))]" />
              <button onClick={() => handleAction('Message Sent')} className="px-4 py-2 bg-[hsl(var(--accent))] text-white font-bold rounded-lg hover:opacity-90">Send</button>
            </div>
          </div>
        )}

        {/* Tab 7: Behavior */}
        {activeTab === 'conduct' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Conduct &amp; Discipline Logs</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Disciplinary actions, counselor references, or class merit warnings.</p>
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-semibold text-center">
              {activeChild.conductSummary}
            </div>
          </div>
        )}

        {/* Tab 8: Health */}
        {activeTab === 'health' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">School Clinic Visits &amp; Warnings</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Immunizations and allergy files tracked inside campus clinics.</p>
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-semibold text-center">
              {activeChild.clinicAlerts}
            </div>
          </div>
        )}

        {/* Tab 9: AI Guide */}
        {activeTab === 'ai-assistant' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">AI Parent Guide Assistant</h3>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-[hsl(var(--text-primary))]"
            />
            <button onClick={handleAskAI} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:opacity-90">
              Generate Revision Strategy Advice
            </button>
            {aiResponse && (
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 mt-4 text-[11px] leading-relaxed text-[hsl(var(--text-secondary))]">
                {aiResponse}
              </div>
            )}
          </div>
        )}

        {/* Tab 10: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* Split layout grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Preferences (Parent Controlled) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Profile Preferences */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[hsl(var(--accent))]" /> Parent Account Preferences
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Preferred Display Name</label>
                      <input type="text" defaultValue="Mr. Chidi Obi" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Contact Mobile Number</label>
                      <input type="text" defaultValue="+234 802 555 1199" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 font-mono text-[hsl(var(--text-primary))]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Personal Email Address</label>
                      <input type="email" defaultValue="c.obi@dreamday.com" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 font-mono text-[hsl(var(--text-primary))]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">System color theme</label>
                      <select className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))]">
                        <option>Dark Mode</option>
                        <option>Light Mode</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notifications Channels */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-3 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))]">Email &amp; SMS alerts channels</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--accent))]" />
                      <span>SMS alerts on child absence or late arrivals</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--accent))]" />
                      <span>Term tuition installment payment reminders</span>
                    </label>
                  </div>
                </div>

                {/* Profile update request lodging form */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.2)]">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">Lodge Child Record Update Request</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Submit an official update ticket to the principal for child records modification subject to verification audits.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2 text-[hsl(var(--text-secondary))]">
                      <option>Select Child Field...</option>
                      <option>Child Legal Name Correction</option>
                      <option>Home Address Update</option>
                      <option>Emergency Guardian Change</option>
                      <option>Child Medical Alerts Update</option>
                    </select>
                    <input type="text" placeholder="Proposed value..." className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg p-2 text-[hsl(var(--text-primary))]" />
                    <button onClick={() => handleAction('Change Request submitted to administration')} className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white font-bold hover:opacity-90 transition-all">Lodge Request</button>
                  </div>
                </div>

              </div>

              {/* Right Column: Protected children records (Read-Only) */}
              <div className="space-y-6">
                <div className="glass-card p-5 border border-rose-500/20 bg-rose-500/5 space-y-4 rounded-xl">
                  <div className="border-b border-rose-500/20 pb-3">
                    <p className="font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Locked Children Records
                    </p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Official records can only be updated by authorized registrars.</p>
                  </div>

                  <div className="space-y-4 text-[11px] leading-relaxed">
                    <div className="p-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                      <p className="font-bold text-[hsl(var(--text-tertiary))] uppercase text-[9px]">{activeChild.name} Official ID</p>
                      <p className="text-[hsl(var(--text-primary))] font-semibold">Admission: {activeChild.admissionNo}</p>
                      <p className="text-[hsl(var(--text-secondary))]">Legal Name: {activeChild.name}</p>
                      <p className="text-[hsl(var(--text-secondary))]">DOB: {activeChild.dob}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                      <p className="font-bold text-[hsl(var(--text-tertiary))] uppercase text-[9px]">Class allocation &amp; House</p>
                      <p className="text-[hsl(var(--text-primary))] font-semibold">{activeChild.class} ({activeChild.stream})</p>
                      <p className="text-[hsl(var(--text-secondary))]">{activeChild.house}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                      <p className="font-bold text-[hsl(var(--text-tertiary))] uppercase text-[9px]">Academic Transcript averages</p>
                      <p className="text-[hsl(var(--text-primary))] font-semibold">GPA average: {activeChild.gpa}</p>
                      <p className="text-[hsl(var(--text-secondary))]">Attendance: {activeChild.attendancePercent}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
