'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  GraduationCap, CalendarCheck, BookOpen, Clock, Users, ShieldAlert,
  Menu, Plus, Search, RotateCcw, AlertTriangle, CheckCircle2,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  Calendar, Layers, MessageSquare, Landmark, HelpCircle, Save, Sparkles, UserCheck,
  Award, ClipboardList, Send, Lightbulb, UserX, Heart, BookOpenCheck, Brain, PlusCircle,
  DollarSign, ShieldCheck, Briefcase, Eye, Shield, UsersRound, Scale, Phone, Trash2, BookMarked, CheckSquare, Trophy
} from 'lucide-react';

type StudentTab =
  | 'dashboard'
  | 'profile'
  | 'academics'
  | 'timetable'
  | 'assignments'
  | 'lms'
  | 'activities'
  | 'welfare'
  | 'finance'
  | 'ai-copilot'
  | 'productivity'
  | 'settings';

export default function StudentPortalPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // States for interactive demo actions
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // AI Copilot study prompt states
  const [studyPrompt, setStudyPrompt] = useState('Explain photosynthesis in simple words');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Assignment submissions simulation state
  const [assignmentText, setAssignmentText] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // To-Do productivity list state
  const [todos, setTodos] = useState([
    { id: '1', text: 'Revise Chemistry Chapter 4 formulas', done: false },
    { id: '2', text: 'Submit Algebra Assignment', done: true },
    { id: '3', text: 'Check Library reserved books', done: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Course completion track
  const [courses, setCourses] = useState([
    { id: '1', name: 'Mathematics: Algebra 101', progress: 75, tutor: 'Mr. Kwame Darko' },
    { id: '2', name: 'Science: Organic Chemistry', progress: 40, tutor: 'Mrs. Beatrice Mensah' },
    { id: '3', name: 'English Literature: Shakespeare', progress: 90, tutor: 'Dr. Stella Gbandi' }
  ]);

  const handleAction = (msg: string) => {
    setSaving(true);
    setSavedMessage(null);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(`Notification: ${msg} updated!`);
      setTimeout(() => setSavedMessage(null), 3000);
    }, 800);
  };

  const handleAskAI = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (studyPrompt.toLowerCase().includes('photosynthesis')) {
        setAiResponse(
          "Photosynthesis is how plants make food. They use sunlight, water, and carbon dioxide to create glucose (sugar) for energy, and release oxygen back into the air. Think of leaves as tiny solar-powered kitchens!"
        );
      } else {
        setAiResponse(
          `AI Assistant Output: Here is the generated study explanation and revision outline for your query: "${studyPrompt}". Focus on key terminology, write draft flashcards, and review matching mock papers.`
        );
      }
    }, 900);
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), text: newTodo, done: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentText.trim()) return;
    setSubmissionSuccess('Your assignment file copy has been successfully uploaded and time-stamped!');
    setAssignmentText('');
    setTimeout(() => setSubmissionSuccess(null), 5000);
  };

  // Nav menu definition
  const tabItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'My Profile', icon: GraduationCap },
    { id: 'academics', label: 'Academic & Grades', icon: Award },
    { id: 'timetable', label: 'Timetable & Exams', icon: Clock },
    { id: 'assignments', label: 'Assignments Desk', icon: BookOpenCheck },
    { id: 'lms', label: 'LMS Courses', icon: BookOpen },
    { id: 'activities', label: 'School Life & Lib', icon: Trophy },
    { id: 'welfare', label: 'Health & Conduct', icon: Heart },
    { id: 'finance', label: 'Fees Ledger', icon: DollarSign },
    { id: 'ai-copilot', label: 'AI Study Copilot', icon: Brain },
    { id: 'productivity', label: 'Productivity Logs', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[hsl(var(--accent))]" />
            Student Workspace
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Welcome back, Emeka! Review your classes, submit homework, learn from LMS modules, and access AI resources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shadow-glow">
            SS2 Blue (Red House)
          </span>
          <span className="text-xs px-3.5 py-1.5 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)] font-bold">
            GPA: 3.82 / 4.0
          </span>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in animate-pulse">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Desktop Horizontal Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as StudentTab);
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
              setActiveTab(item.id as StudentTab);
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
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">All Modules</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tabItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as StudentTab);
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

      {/* Workspace Pages content wrapper */}
      <div className="pb-24 md:pb-0">
        {/* Tab 1: Dashboard Home */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick KPI stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Attendance rate</span>
                <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">96.4%</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">2 Absences this term</p>
              </div>

              <div className="glass-card p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Homework due today</span>
                <p className="text-xl font-extrabold text-indigo-400">1 Pending</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Chemistry Chapter quiz</p>
              </div>

              <div className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Overall Average</span>
                <p className="text-xl font-extrabold text-emerald-400">84.5%</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Top 15% of class stream</p>
              </div>

              <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Next Lesson starts in</span>
                <p className="text-xl font-extrabold text-rose-400">14 Mins</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Physics Lab B</p>
              </div>
            </div>

            {/* Split grid for Announcements & study targets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Timetable & Homework */}
              <div className="lg:col-span-2 space-y-6">
                {/* Timetable widget */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[hsl(var(--accent))]" /> Today&apos;s Lecture Timetable
                  </p>
                  <div className="space-y-3">
                    {[
                      { time: '08:30 AM — 09:30 AM', subject: 'Grade 10 Algebra', teacher: 'Mr. Kwame Darko', room: 'Room 104', status: 'Completed' },
                      { time: '09:45 AM — 10:45 AM', subject: 'Organic Chemistry', teacher: 'Mrs. Beatrice Mensah', room: 'Chemistry Lab B', status: 'Ongoing' },
                      { time: '11:30 AM — 12:30 PM', subject: 'English Literature: Hamlet', teacher: 'Dr. Stella Gbandi', room: 'Main Lecture Hall 1', status: 'Pending' }
                    ].map((period, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                        <div>
                          <p className="font-bold text-[hsl(var(--text-primary))]">{period.subject}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{period.teacher} &bull; {period.room}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-[hsl(var(--text-secondary))]">{period.time}</p>
                          <span className={`text-[9px] font-bold ${period.status === 'Completed' ? 'text-[hsl(var(--text-tertiary))]' : period.status === 'Ongoing' ? 'text-[hsl(var(--accent))]' : 'text-amber-400'}`}>
                            {period.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Announcement bulletin */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[hsl(var(--accent))]" /> School Bulletin Notices
                  </p>
                  <div className="space-y-3 leading-relaxed text-[11px]">
                    <div className="p-3.5 rounded-lg border border-[hsl(var(--border))] bg-amber-500/5">
                      <p className="font-bold text-[hsl(var(--text-primary))]">Physics Inter-school Competitions</p>
                      <p className="text-[hsl(var(--text-secondary))] mt-1">Registration for the national physics olympiad holds this Thursday in room 103. Open to all senior students.</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Submitted by Admin &bull; 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Assistant mini & Weekly Goals */}
              <div className="space-y-6">
                {/* Copilot Mini */}
                <div className="glass-card p-5 border border-indigo-500/20 bg-indigo-500/5 space-y-3 rounded-xl">
                  <p className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Brain className="w-4.5 h-4.5" /> AI Study Assistant
                  </p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Enter a homework query to receive explanations.</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={studyPrompt}
                      onChange={e => setStudyPrompt(e.target.value)}
                      className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg p-2 text-[hsl(var(--text-primary))] text-[11px]"
                    />
                    <button onClick={handleAskAI} className="w-full py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-bold hover:opacity-90">
                      Ask Assistant
                    </button>
                    {aiResponse && (
                      <div className="p-3 rounded-lg border border-indigo-500/10 bg-indigo-950/20 text-[10px] leading-relaxed text-[hsl(var(--text-secondary))]">
                        {aiResponse}
                      </div>
                    )}
                  </div>
                </div>

                {/* To-do widgets list */}
                <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-3 rounded-xl">
                  <p className="font-bold text-[hsl(var(--text-primary))]">My Study To-Do List</p>
                  <div className="space-y-2">
                    {todos.map(todo => (
                      <div key={todo.id} className="flex justify-between items-center p-2 rounded bg-[hsl(var(--bg-tertiary)/0.4)]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))]" />
                          <span className={`text-[10px] ${todo.done ? 'line-through text-[hsl(var(--text-tertiary))]' : 'text-[hsl(var(--text-primary))]'}`}>{todo.text}</span>
                        </label>
                        <button onClick={() => deleteTodo(todo.id)} className="text-[hsl(var(--text-tertiary))] hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add revision task..."
                        value={newTodo}
                        onChange={e => setNewTodo(e.target.value)}
                        className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded px-2 py-1 text-[11px] text-[hsl(var(--text-primary))]"
                      />
                      <button onClick={handleAddTodo} className="px-2 py-1 bg-[hsl(var(--accent))] text-white rounded text-[11px] font-bold">Add</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Student Official Profile Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Passport photo mock */}
              <div className="flex flex-col items-center justify-center p-6 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                <div className="w-24 h-24 rounded-full bg-[hsl(var(--accent)/0.1)] border-2 border-[hsl(var(--accent))] flex items-center justify-center mb-3">
                  <GraduationCap className="w-12 h-12 text-[hsl(var(--accent))]" />
                </div>
                <p className="font-extrabold text-[hsl(var(--text-primary))]">Emeka Obi</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mt-1">ID: STU-2026-9081</p>
              </div>

              {/* Profile Details */}
              <div className="sm:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Class Section</label>
                    <p className="text-[11px] font-semibold text-[hsl(var(--text-primary))]">Senior Secondary Stream 2 (SS2 Blue)</p>
                  </div>
                  <div>
                    <label className="block text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">House</label>
                    <p className="text-[11px] font-semibold text-[hsl(var(--text-primary))]">Red House Athletics team</p>
                  </div>
                  <div>
                    <label className="block text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Date of Birth</label>
                    <p className="text-[11px] font-semibold text-[hsl(var(--text-primary))]">12th April 2010</p>
                  </div>
                  <div>
                    <label className="block text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Emergency Guardian Contact</label>
                    <p className="text-[11px] font-semibold text-[hsl(var(--text-primary))]">Mr. Chidi Obi (+234 802 555 1199)</p>
                  </div>
                  <div>
                    <label className="block text-[9px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Welfare &amp; Medical Warnings (Read-Only)</label>
                    <p className="text-[11px] font-semibold text-rose-400">Asthma Inhaler required inside backpack &bull; Penicillin Allergy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Academics & Grades */}
        {activeTab === 'academics' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Continuous Assessment &amp; Subject Gradebook</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">View your grades, class averages, and progress trends.</p>
              </div>
              <button onClick={() => handleAction('Report Card Download')} className="px-3.5 py-1.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold rounded-lg hover:bg-[hsl(var(--border))]">
                Download Result slip PDF
              </button>
            </div>

            <div className="space-y-4">
              {[
                { subject: 'Mathematics (Algebra & Calculus)', score: 92, test: 28, midterm: 26, exam: 38, average: 74 },
                { subject: 'Organic Chemistry', score: 78, test: 22, midterm: 20, exam: 36, average: 69 },
                { subject: 'English Grammar & Drama', score: 85, test: 26, midterm: 24, exam: 35, average: 71 },
                { subject: 'Modern Physics', score: 88, test: 27, midterm: 25, exam: 36, average: 72 }
              ].map((sub, index) => (
                <div key={index} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-[hsl(var(--text-primary))]">{sub.subject}</p>
                    <p className="text-xs font-bold text-[hsl(var(--accent))]">Score: {sub.score}% (A)</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-[hsl(var(--text-secondary))] font-mono">
                    <p>CA Quiz: {sub.test}/30</p>
                    <p>Midterm: {sub.midterm}/30</p>
                    <p>Final Exam: {sub.exam}/40</p>
                    <p className="text-emerald-400">Class Average: {sub.average}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Timetable & Exams */}
        {activeTab === 'timetable' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Weekly Schedule &amp; Examination Timetable</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily classes */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Classes Schedule</p>
                <div className="space-y-2">
                  <p className="p-2 border-b border-[hsl(var(--border))]">Monday (09:00 AM) — Algebra | Room 104</p>
                  <p className="p-2 border-b border-[hsl(var(--border))]">Wednesday (11:00 AM) — Chemistry Lab | Room B</p>
                  <p className="p-2 border-b border-[hsl(var(--border))]">Friday (02:00 PM) — Physics Lab | Room A</p>
                </div>
              </div>

              {/* Exam timetable */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Exam Seat Assignments</p>
                <div className="space-y-2">
                  <p className="p-2 border-b border-rose-500/20 bg-rose-500/5 text-rose-400 font-semibold rounded">
                    Midterm Exam seat: #24 in Main Hall
                  </p>
                  <p className="p-2 text-[10px] text-[hsl(var(--text-tertiary))]">
                    Verify you arrive at least 15 minutes before exam checks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Assignments Desk */}
        {activeTab === 'assignments' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Active Homework &amp; Assignment Submissions</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Write answers and click lodge details to submit your continuous assessment assignments.</p>

            {submissionSuccess && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                {submissionSuccess}
              </div>
            )}

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-2">
                  Select Assignment task
                </label>
                <select className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 w-full text-[hsl(var(--text-primary))]">
                  <option>Algebra: Polynomial exercises (Due today)</option>
                  <option>Organic chemistry reactions essay (Due tomorrow)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-2">
                  Paste Assignment text answers or description
                </label>
                <textarea
                  value={assignmentText}
                  onChange={e => setAssignmentText(e.target.value)}
                  placeholder="Paste your code/math/essay answers here..."
                  className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-[hsl(var(--text-primary))] h-32"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2 bg-[hsl(var(--accent))] text-white rounded-lg font-bold hover:opacity-90">
                  Lodge Assignment Submission
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 6: LMS Courses */}
        {activeTab === 'lms' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">My Courses &amp; Lessons Progress</h3>
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3">
                  <div className="flex justify-between items-center font-bold">
                    <p className="text-[hsl(var(--text-primary))]">{course.name}</p>
                    <p className="text-[hsl(var(--accent))]">{course.progress}% Complete</p>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Tutor: {course.tutor}</p>
                  {/* Progress bar */}
                  <div className="w-full bg-[hsl(var(--border))] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[hsl(var(--accent))] h-full" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Activities & Library */}
        {activeTab === 'activities' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Clubs, Sports &amp; Library records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Library */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Borrowed books registry</p>
                <div className="space-y-2">
                  <p className="p-2 border-b border-[hsl(var(--border))] flex justify-between">
                    <span>Introduction to Algorithms</span>
                    <span className="text-[hsl(var(--text-tertiary))]">Due in 5 days</span>
                  </p>
                  <p className="p-2 border-b border-rose-500/20 bg-rose-500/5 text-rose-400 font-semibold rounded">
                    Organic chemistry Volume 1 (Overdue) &bull; Fine: ₦500
                  </p>
                </div>
              </div>

              {/* Sports */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Active Club Enrollment</p>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <p className="p-2 border-b border-[hsl(var(--border))]">President &mdash; School Chess Club</p>
                  <p className="p-2 border-b border-[hsl(var(--border))]">Forward &mdash; Senior Secondary Basketball team</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Health & Conduct */}
        {activeTab === 'welfare' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Health visits &amp; Conduct Ledger</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Health */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Clinic check-ins log</p>
                <div className="space-y-2">
                  <p className="p-2 border-b border-[hsl(var(--border))] text-[11px]">
                    12th May 2026 &mdash; Asthmatic fit treatment (Inhaler administered)
                  </p>
                </div>
              </div>

              {/* Conduct */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Merit &amp; Demerit Points</p>
                <div className="space-y-2">
                  <p className="p-2 border-b border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-semibold rounded">
                    +15 Merit points for Science Fair runner-up
                  </p>
                  <p className="p-2 border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                    0 Demerit warnings issued this term
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Fees Ledger */}
        {activeTab === 'finance' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Fees invoice &amp; Payment Ledger (Read-Only)</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">All fee calculations and payments are handled by the parents dashboard. Below is your current standing.</p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">First Term Tuition Fee</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Invoice: INV-2026-0902</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">₦250,000 Paid</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))]">Receipt: REC-80812</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 10: AI Study Copilot */}
        {activeTab === 'ai-copilot' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">AI Study Assistant &amp; Revision Planner</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Prompt the AI model to explain difficult terms, build revision plans, or generate revision tests.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-2">Select prompt type</label>
                <div className="flex gap-2 mb-3">
                  {['Explain photosynthesis', 'Generate Algebra quiz', 'Create revision schedule'].map(p => (
                    <button
                      key={p}
                      onClick={() => setStudyPrompt(p)}
                      className="px-3 py-1 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <textarea
                  value={studyPrompt}
                  onChange={e => setStudyPrompt(e.target.value)}
                  className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-[hsl(var(--text-primary))] h-20 text-[11px]"
                />
              </div>

              <div className="flex justify-end">
                <button onClick={handleAskAI} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:opacity-90 flex items-center gap-1.5">
                  <Brain className="w-4 h-4" /> Ask Study Copilot
                </button>
              </div>

              {aiResponse && (
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 leading-relaxed text-[11px] text-[hsl(var(--text-secondary))]">
                  <p className="font-bold text-indigo-400 mb-2">Copilot Explanations</p>
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 11: Productivity Logs */}
        {activeTab === 'productivity' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Personal Study Tracker &amp; Goal Tracker</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Goals */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Term academic goals</p>
                <div className="space-y-2">
                  <p className="p-2 border-b border-[hsl(var(--border))] flex justify-between">
                    <span>Maintain Overall GPA &gt; 3.8</span>
                    <span className="text-emerald-400 font-bold">On track</span>
                  </p>
                  <p className="p-2 border-b border-[hsl(var(--border))] flex justify-between">
                    <span>Finish all LMS exercises</span>
                    <span className="text-amber-400 font-bold">In progress</span>
                  </p>
                </div>
              </div>

              {/* Study time log */}
              <div className="space-y-4 border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--bg-secondary))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">Weekly study logs</p>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <p className="p-2 border-b border-[hsl(var(--border))]">Physics &mdash; 4 hours revised</p>
                  <p className="p-2 border-b border-[hsl(var(--border))]">Chemistry &mdash; 2 hours revised</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 12: Settings */}
        {activeTab === 'settings' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">My Account Preferences</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Customize your profile view, email alerts and light/dark theme preference.</p>
              </div>
              <button onClick={() => handleAction('Account Settings')} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90">
                <Save className="w-3.5 h-3.5" /> Save Preferences
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Change Account Password</label>
                <input type="password" placeholder="••••••••••••" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))]" />
              </div>

              <div>
                <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Theme selection</label>
                <select className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))]">
                  <option>Dark Mode</option>
                  <option>Light Mode</option>
                </select>
              </div>

              <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--accent))]" />
                  <span>Receive Email announcements notices</span>
                </label>
              </div>

              <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--accent))]" />
                  <span>Receive SMS grade notification updates</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
