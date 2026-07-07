'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  GraduationCap, CalendarCheck, BookOpen, Clock, Users, ShieldAlert,
  Menu, Plus, Search, RotateCcw, AlertTriangle, CheckCircle2,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  Calendar, Layers, MessageSquare, Landmark, HelpCircle, Save, Sparkles, UserCheck,
  Award, ClipboardList, Send, Lightbulb, UserX, Heart, BookOpenCheck, Brain, PlusCircle, DollarSign
} from 'lucide-react';

type TeacherTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'attendance'
  | 'gradebook'
  | 'assignments'
  | 'lessons'
  | 'materials'
  | 'homework'
  | 'exams'
  | 'assessments'
  | 'communication'
  | 'behavior'
  | 'reports'
  | 'calendar'
  | 'timetable'
  | 'lms'
  | 'resources'
  | 'analytics'
  | 'parents'
  | 'documents'
  | 'ai-copilot'
  | 'profile'
  | 'tasks'
  | 'settings';

export default function TeacherPortalPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // States for interactive demo actions
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // AI Copilot prompt state
  const [aiPrompt, setAiPrompt] = useState('Generate 5 organic chemistry questions for Grade 11');
  const [aiOutput, setAiOutput] = useState<string | null>(null);

  // Today's classes state
  const [classes, setClasses] = useState([
    { id: '1', period: 'Period 1 (08:30 AM — 09:30 AM)', subject: 'Grade 9 Algebra', room: 'Room 104', studentsCount: 28, status: 'Completed' },
    { id: '2', period: 'Period 2 (09:45 AM — 10:45 AM)', subject: 'Grade 10 Geometry', room: 'Room 104', studentsCount: 30, status: 'In Progress' },
    { id: '3', period: 'Period 4 (11:30 AM — 12:30 PM)', subject: 'Grade 11 Calculus', room: 'Math Lab B', studentsCount: 22, status: 'Pending' }
  ]);

  // Students attendance list
  const [attendanceList, setAttendanceList] = useState([
    { id: 'S-001', name: 'Amara Johnson', status: 'Present', arrival: '08:24 AM', notes: '' },
    { id: 'S-002', name: 'David Okafor', status: 'Late', arrival: '08:42 AM', notes: 'Traffic delay' },
    { id: 'S-003', name: 'Priya Sharma', status: 'Absent', arrival: '—', notes: 'Sickness call' },
    { id: 'S-004', name: 'Michael Chen', status: 'Present', arrival: '08:15 AM', notes: '' }
  ]);

  // Gradebook weights & values calculator
  const [gradeRows, setGradeRows] = useState([
    { name: 'Amara Johnson', quiz1: 85, hw1: 90, midterm: 78, weightedFinal: 81.8 },
    { name: 'David Okafor', quiz1: 72, hw1: 80, midterm: 88, weightedFinal: 83.2 },
    { name: 'Priya Sharma', quiz1: 94, hw1: 92, midterm: 90, weightedFinal: 91.2 },
    { name: 'Michael Chen', quiz1: 68, hw1: 75, midterm: 70, weightedFinal: 70.8 }
  ]);

  const [quizWeight, setQuizWeight] = useState(20);
  const [hwWeight, setHwWeight] = useState(30);
  const [examWeight, setExamWeight] = useState(50);

  const calculateWeighted = (quiz: number, hw: number, exam: number) => {
    return Number(((quiz * quizWeight / 100) + (hw * hwWeight / 100) + (exam * examWeight / 100)).toFixed(1));
  };

  const handleAction = (msg: string) => {
    setSaving(true);
    setSavedMessage(null);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(`Action "${msg}" completed successfully!`);
      setTimeout(() => setSavedMessage(null), 3000);
    }, 800);
  };

  const handleRunAi = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (aiPrompt.toLowerCase().includes('chemistry')) {
        setAiOutput(`**Organic Chemistry Quiz Questions (Grade 11):**\n1. Define isomerism and draw structural isomers of butane.\n2. State the difference between saturated and unsaturated hydrocarbons.\n3. What is the IUPAC name for CH3-CH2-CH(OH)-CH3?\n4. Explain the mechanism of electrophilic addition in alkenes.\n5. Write the chemical equation for the combustion of propane.`);
      } else if (aiPrompt.toLowerCase().includes('parent') || aiPrompt.toLowerCase().includes('message')) {
        setAiOutput(`**Draft Email Template:**\nSubject: Update regarding David Okafor's math progress\n\nDear Parent/Guardian,\nI wanted to update you on David's academic performance in Grade 10 Geometry. Over the past week, David has demonstrated great progress, achieving 88% on his midterm exam. He remains attentive and active in class. Keep up the good work!\n\nBest regards,\n[Your Name]`);
      } else {
        setAiOutput(`**AI Generated Lesson Material:**\n\nTopic: ${aiPrompt}\n- Learning Objectives: Understand key definitions, evaluate basic exercises.\n- Homework Assignment: Answer textbook questions 1 through 5.`);
      }
    }, 1200);
  };

  // 25 menu tabs configuration
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: BarChart3 },
    { id: 'classes', label: 'Class Management', icon: Layers },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'attendance', label: 'Attendance Module', icon: CalendarCheck },
    { id: 'gradebook', label: 'Gradebook CA', icon: Award },
    { id: 'assignments', label: 'Assignment Planners', icon: BookOpenCheck },
    { id: 'lessons', label: 'Lesson Planning', icon: ClipboardList },
    { id: 'materials', label: 'Learning Materials', icon: Download },
    { id: 'homework', label: 'Homework Logs', icon: FileText },
    { id: 'exams', label: 'Exams & Invigilation', icon: Clock },
    { id: 'assessments', label: 'Assessments Quiz', icon: HelpCircle },
    { id: 'communication', label: 'Notice & SMS Messages', icon: MessageSquare },
    { id: 'behavior', label: 'Behavior & Discipline', icon: ShieldAlert },
    { id: 'reports', label: 'Workload Reports', icon: TrendingDown },
    { id: 'calendar', label: 'Events Calendar', icon: Calendar },
    { id: 'timetable', label: 'Substitution Timetable', icon: Clock },
    { id: 'lms', label: 'LMS Courses', icon: BookOpen },
    { id: 'resources', label: 'Resource Booking', icon: Landmark },
    { id: 'analytics', label: 'Performance Charts', icon: BarChart3 },
    { id: 'parents', label: 'Parent Engagement', icon: UserCheck },
    { id: 'documents', label: 'Teacher Share Files', icon: FileText },
    { id: 'ai-copilot', label: 'AI Teaching Copilot', icon: Brain },
    { id: 'profile', label: 'Teacher Profile', icon: GraduationCap },
    { id: 'tasks', label: 'Approvals & Tasks', icon: Zap },
    { id: 'settings', label: 'Portal Settings', icon: Settings }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[hsl(var(--accent))]" />
            Teacher Portal Workspace
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Manage your daily subject classes, register attendance tracking codes, continuous assessments grading sheets, and AI lesson tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            Active Subscriptions: All Modules Enabled
          </span>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Desktop Horizontal Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap scrollbar-none">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as TeacherTab);
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

      {/* Mobile/Tablet Sticky Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] flex items-center justify-around py-2 px-4 shadow-2xl md:hidden">
        {menuItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as TeacherTab);
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
            {!menuItems.slice(0, 4).map(i => i.id).includes(activeTab) && (
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
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Teacher Modules</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TeacherTab);
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

      {/* Main Configurations Container */}
      <div className="pb-20 md:pb-0">
        {/* Dashboard Home */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Widgets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Today's Classes", value: '3 Classes', sub: 'Calculus pending next', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Students Present', value: '56 Students', sub: '92% attendance rate', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Absent Today', value: '4 Absent', sub: '2 approved absences', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { label: 'Awaiting Grading', value: '18 Assignments', sub: 'Geometry homework', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Average Performance', value: '78.4%', sub: 'Class benchmark average', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { label: 'Attendance Trend', value: '+2.4%', sub: 'Higher than last week', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'New Announcements', value: '2 Active', sub: 'Sports day planning', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Student Birthdays', value: '1 Today', sub: 'Amara Johnson (Grade 9)', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { label: 'Next Class Count', value: '42 Mins', sub: 'Geometry room 104', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { label: 'Needs Attention', value: '2 Students', sub: 'Performance alerts active', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
              ].map(card => (
                <div key={card.label} className={`glass-card p-4 border flex flex-col justify-between ${card.bg}`}>
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block mb-2">{card.label}</span>
                  <div>
                    <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">{card.value}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4">
              <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Quick Actions</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button onClick={() => { setActiveTab('attendance'); }} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--accent))]">✅ Quick Attendance</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Take period attendance check</p>
                </button>
                <button onClick={() => { setActiveTab('gradebook'); }} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--accent))]">📝 Quick Grade Entry</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Lodge exam / quiz scores</p>
                </button>
                <button onClick={() => { setActiveTab('lessons'); }} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--accent))]">📄 Quick Lesson Plan</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Configure weekly topics scheme</p>
                </button>
                <button onClick={() => { setActiveTab('ai-copilot'); }} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--accent))]">🤖 AI Assistant</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Generate chemistry quiz items</p>
                </button>
                <button onClick={() => handleAction('Send Emergency Notice')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-rose-400">⚠️ Send Notice</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Broadcast quick emergency alert</p>
                </button>
              </div>
            </div>

            {/* Today's classes schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-5 border border-[hsl(var(--border))] rounded-2xl space-y-4">
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Today&apos;s Class Schedule</p>
                <div className="space-y-3 text-xs">
                  {classes.map(cls => (
                    <div key={cls.id} className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[hsl(var(--text-primary))]">{cls.subject}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{cls.period} | Location: {cls.room}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${cls.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : cls.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' : 'bg-zinc-500/10 text-zinc-400'}`}>{cls.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Alerts */}
              <div className="glass-card p-5 border border-[hsl(var(--border))] rounded-2xl space-y-4">
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Students Needing Attention</p>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <p className="font-bold">David Okafor</p>
                    <p className="text-[10px] mt-0.5">Alert: Low performance (midterm grade 70%). Recommend math lab intervention.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <p className="font-bold">Priya Sharma</p>
                    <p className="text-[10px] mt-0.5">Alert: High absences (3 days sick this month). Action: Send welfare check check-in.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Management Seating Layout */}
        {activeTab === 'classes' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">My Assigned Classes &amp; Seating Layout</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configure seating desks allocations and student desks grid coordinates.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Front Desks: Desk 1', 'Front Desks: Desk 2', 'Middle Desks: Desk 3', 'Back Desks: Desk 4'].map((desk, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-center text-xs">
                  <p className="font-bold text-[hsl(var(--text-primary))]">{desk}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">Allocated: Student #{idx + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Management notes */}
        {activeTab === 'students' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Student Management Records</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Read behavioral counseling referrals, parent details, and teacher comments logs.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Student</th>
                    <th className="py-2.5 px-2">Medical Alerts</th>
                    <th className="py-2.5 px-2">Behavior Rating</th>
                    <th className="py-2.5 px-2">Parent Contact</th>
                    <th className="py-2.5 px-2 text-right">Action Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[hsl(var(--border))/0.4]">
                    <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">Amara Johnson</td>
                    <td className="py-3 px-2 text-rose-400">Asthma — inhaler in bag</td>
                    <td className="py-3 px-2 text-emerald-400">Excellent (5 Stars)</td>
                    <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">Mrs. Clara Johnson</td>
                    <td className="py-3 px-2 text-right text-[hsl(var(--text-tertiary))]">Keen math progress</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))/0.4]">
                    <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">David Okafor</td>
                    <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">None</td>
                    <td className="py-3 px-2 text-amber-400">Needs Focus (3 Stars)</td>
                    <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">Mr. David Okafor Sr.</td>
                    <td className="py-3 px-2 text-right text-[hsl(var(--text-tertiary))]">Requires geometry practice</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Modules */}
        {activeTab === 'attendance' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Daily Period Attendance Register</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Take period attendance checks. Auto-notifies parents on check-in/absences.</p>
              </div>
              <button onClick={() => handleAction('Submit Period 2 Attendance')} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90">
                <Plus className="w-3.5 h-3.5" /> Submit Attendance Sheet
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Student Name</th>
                    <th className="py-2.5 px-2">Check-in Status</th>
                    <th className="py-2.5 px-2">Arrival Time</th>
                    <th className="py-2.5 px-2">Excused Reason</th>
                    <th className="py-2.5 px-2 text-right">Parent Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((att, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4]">
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{att.name}</td>
                      <td className="py-3 px-2">
                        <select
                          value={att.status}
                          onChange={(e) => {
                            const updated = [...attendanceList];
                            updated[idx].status = e.target.value;
                            setAttendanceList(updated);
                          }}
                          className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded p-1 text-xs text-[hsl(var(--text-secondary))]"
                        >
                          <option>Present</option>
                          <option>Late</option>
                          <option>Absent</option>
                        </select>
                      </td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{att.arrival}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{att.notes || '—'}</td>
                      <td className="py-3 px-2 text-right text-emerald-400 font-semibold">Auto-Sent</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gradebook Continuous Assessment Worksheet */}
        {activeTab === 'gradebook' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Continuous Assessment Gradebook Sheets</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Input weighted values for quizzes, homework, and midterm tests with automatic average calculations.</p>
              </div>
              <button onClick={() => handleAction('Publish Results')} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90">
                <Plus className="w-3.5 h-3.5" /> Publish Results to Portal
              </button>
            </div>

            {/* Weights Configuration */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] text-xs">
              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Quiz Weight (%)</label>
                <input type="number" value={quizWeight} onChange={e => setQuizWeight(Number(e.target.value))} className="w-full mt-1 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded p-1.5 text-[hsl(var(--text-primary))]" />
              </div>
              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Homework Weight (%)</label>
                <input type="number" value={hwWeight} onChange={e => setHwWeight(Number(e.target.value))} className="w-full mt-1 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded p-1.5 text-[hsl(var(--text-primary))]" />
              </div>
              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Exam Weight (%)</label>
                <input type="number" value={examWeight} onChange={e => setExamWeight(Number(e.target.value))} className="w-full mt-1 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded p-1.5 text-[hsl(var(--text-primary))]" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Student Name</th>
                    <th className="py-2.5 px-2">Quiz 1 ({quizWeight}%)</th>
                    <th className="py-2.5 px-2">Homework 1 ({hwWeight}%)</th>
                    <th className="py-2.5 px-2">Midterm Exam ({examWeight}%)</th>
                    <th className="py-2.5 px-2 text-right">Weighted Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeRows.map((row, idx) => {
                    const weighted = calculateWeighted(row.quiz1, row.hw1, row.midterm);
                    return (
                      <tr key={idx} className="border-b border-[hsl(var(--border))/0.4]">
                        <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{row.name}</td>
                        <td className="py-3 px-2">
                          <input type="number" value={row.quiz1} onChange={e => {
                            const updated = [...gradeRows];
                            updated[idx].quiz1 = Number(e.target.value);
                            setGradeRows(updated);
                          }} className="w-16 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded p-1 text-center font-mono text-[hsl(var(--text-primary))]" />
                        </td>
                        <td className="py-3 px-2">
                          <input type="number" value={row.hw1} onChange={e => {
                            const updated = [...gradeRows];
                            updated[idx].hw1 = Number(e.target.value);
                            setGradeRows(updated);
                          }} className="w-16 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded p-1 text-center font-mono text-[hsl(var(--text-primary))]" />
                        </td>
                        <td className="py-3 px-2">
                          <input type="number" value={row.midterm} onChange={e => {
                            const updated = [...gradeRows];
                            updated[idx].midterm = Number(e.target.value);
                            setGradeRows(updated);
                          }} className="w-16 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded p-1 text-center font-mono text-[hsl(var(--text-primary))]" />
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-indigo-400">{weighted}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lesson Planner objectives timeline */}
        {activeTab === 'lessons' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Weekly Lesson Plans &amp; Schemes of Work</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Map curriculum outcomes, schemes of work, and submit lesson plans for principal approval.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {[
                { week: 'Week 1: Quadratic Equations', topic: 'Completing the square, factoring quadratic trinomials', objective: 'Students should be able to solve basic factoring problems.', status: 'Approved' },
                { week: 'Week 2: Geometric Proofs', topic: 'Congruency and similarity properties in triangles', objective: 'Understand similarity axioms.', status: 'Pending Review' }
              ].map((lesson, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-2">
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-2">
                    <p className="font-bold text-[hsl(var(--text-primary))]">{lesson.week}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lesson.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{lesson.status}</span>
                  </div>
                  <p className="text-[hsl(var(--text-secondary))]">Topics: {lesson.topic}</p>
                  <p className="text-[hsl(var(--text-secondary))] font-medium text-emerald-400">Objectives: {lesson.objective}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Teaching Copilot */}
        {activeTab === 'ai-copilot' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[hsl(var(--accent))]" />
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">AI Teaching Copilot Helper</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Auto-generate lesson plan text, quiz questions, and translation comments.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  placeholder="Ask the AI copilot..."
                />
                <button
                  onClick={handleRunAi}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Generating...' : 'Run Copilot'}
                </button>
              </div>

              {aiOutput && (
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-[hsl(var(--text-secondary))] leading-relaxed whitespace-pre-line font-mono">
                  {aiOutput}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
