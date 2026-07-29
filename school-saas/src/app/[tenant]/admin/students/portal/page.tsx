'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  GraduationCap, CalendarCheck, BookOpen, Clock, Users, ShieldAlert,
  Menu, Plus, Search, RotateCcw, AlertTriangle, CheckCircle2,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  Calendar, Layers, MessageSquare, Landmark, HelpCircle, Save, Sparkles, UserCheck,
  Award, ClipboardList, Send, Lightbulb, UserX, Heart, BookOpenCheck, Brain, PlusCircle,
  DollarSign, ShieldCheck, Briefcase, Eye, Shield, UsersRound, Scale, Phone, Trash2, BookMarked, CheckSquare, Trophy,
  Smile, Sun, Star, Book, Bell, ArrowRight, LayoutGrid, Sliders, FileCheck, Upload
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type StudentTab =
  | 'dashboard'
  | 'attendance'
  | 'profile'
  | 'academics'
  | 'timetable'
  | 'calendar'
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
  const searchParams = useSearchParams();
  const tenant = (params?.tenant as string) || '';

  const tabParam = (searchParams.get('tab') as StudentTab) || 'dashboard';

  // Mode: 'simple' for younger students vs 'advanced' for secondary school students
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('advanced');
  const [activeTab, setActiveTab] = useState<StudentTab>(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // States for interactive actions
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Real DB state (fallback to demo defaults)
  const [studentData, setStudentData] = useState<any>({
    fullName: 'Emeka Obi',
    studentId: 'STU-2026-9081',
    className: 'SS2 Blue (Grade 10)',
    house: 'Red House Athletics',
    gpa: '3.82',
    attendanceRate: '96.4%',
    pendingHomework: 1,
    overallAverage: '84.5%'
  });

  // AI Copilot study prompt states
  const [studyPrompt, setStudyPrompt] = useState('Explain photosynthesis in simple words');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Assignment submissions simulation state
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // To-Do productivity list state
  const [todos, setTodos] = useState([
    { id: '1', text: 'Revise Chemistry Chapter 4 formulas', done: false },
    { id: '2', text: 'Submit Algebra Assignment', done: true },
    { id: '3', text: 'Check Library reserved books', done: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Academic & Examination Module Sub-Section State
  const [academicSection, setAcademicSection] = useState<'subjects' | 'grades' | 'assignments' | 'resources'>('subjects');
  const [examSubTab, setExamSubTab] = useState<'timetable' | 'upcoming' | 'results' | 'history'>('timetable');
  const [timetableMode, setTimetableMode] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  
  // Homework & Assignments Desk Interactive State
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted' | 'late' | 'marked'>('all');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('1');
  const [assignmentText, setAssignmentText] = useState('My step-by-step polynomial derivations solutions...');
  const [newCommentInput, setNewCommentInput] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // Mini LMS Portal Interactive State
  const [lmsSubTab, setLmsSubTab] = useState<'materials' | 'videos' | 'quizzes' | 'discussions'>('materials');
  const [selectedLmsCourse, setSelectedLmsCourse] = useState('MATH-101');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');

  // Academic Calendar State
  const [calendarCategory, setCalendarCategory] = useState<'all' | 'holidays' | 'exams' | 'deadlines' | 'events' | 'pta' | 'sports'>('all');
  const [calendarViewMode, setCalendarViewMode] = useState<'agenda' | 'month'>('agenda');
  const [forumThreads, setForumThreads] = useState([
    {
      id: 't1',
      title: 'How do you differentiate implicit functions in Question 4?',
      course: 'MATH-101',
      author: 'Emeka Obi (Student)',
      date: '2 hours ago',
      replies: [
        { author: 'Mr. Kwame Darko (Teacher)', text: 'Use dy/dx chain rule on both sides with respect to x. Remember to factor out dy/dx.', date: '1 hour ago' },
        { author: 'Amina Yusuf (Student)', text: 'Thanks Mr. Darko! That solved it for me too.', date: '30 mins ago' }
      ]
    },
    {
      id: 't2',
      title: 'Tips for balancing complex Redox reactions in basic medium?',
      course: 'CHEM-202',
      author: 'David Chen (Student)',
      date: '1 day ago',
      replies: [
        { author: 'Mrs. Beatrice Mensah (Teacher)', text: 'Balance O atoms using H2O, then balance H using H+, and finally neutralize H+ by adding OH- to both sides.', date: '18 hours ago' }
      ]
    }
  ]);
  
  const [assignmentsData, setAssignmentsData] = useState([
    {
      id: '1',
      title: 'Polynomial Derivatives & Quadratic Functions',
      subject: 'Mathematics (MATH-101)',
      teacher: 'Mr. Kwame Darko',
      dueDate: 'Tomorrow, July 10, 2026 • 11:59 PM',
      priority: 'High',
      status: 'Pending',
      grade: null,
      description: 'Complete problems 1 to 15 on pages 142-145 of the Pure Mathematics textbook. Show all derivation steps for quadratic functions.',
      textSubmission: 'Here are the derivation steps for problem 1 through 15.',
      files: ['Polynomial_Derivations_v2.pdf (2.4 MB)', 'Quadratic_Graph_Proof.png (850 KB)'],
      comments: [
        { sender: 'Mr. Kwame Darko (Teacher)', text: 'Remember to show the discriminant calculation for question 8.', date: 'July 08, 04:15 PM' }
      ]
    },
    {
      id: '2',
      title: 'Organic Reaction Mechanisms & Isomerism Essay',
      subject: 'Organic Chemistry (CHEM-202)',
      teacher: 'Mrs. Beatrice Mensah',
      dueDate: 'Friday, July 13, 2026 • 05:00 PM',
      priority: 'Medium',
      status: 'Submitted',
      grade: null,
      description: 'Write a 1,000-word analysis on nucleophilic substitution (SN1 vs SN2) mechanisms with structural reaction energy diagrams.',
      textSubmission: 'Submitted 1,200-word essay on SN1 and SN2 reaction kinetics and stereochemistry.',
      files: ['Chemistry_SN1_SN2_Mechanisms.docx (1.1 MB)'],
      comments: [
        { sender: 'Emeka Obi (Student)', text: 'Mrs. Mensah, I attached the reaction energy profile diagrams in Appendix B.', date: 'July 09, 02:30 PM' }
      ]
    },
    {
      id: '3',
      title: 'Hamlet Soliloquy Critical Essay',
      subject: 'English Literature (ENG-301)',
      teacher: 'Dr. Stella Gbandi',
      dueDate: 'July 05, 2026 • 11:59 PM',
      priority: 'Urgent',
      status: 'Late',
      grade: null,
      description: 'Analyze Act 3 Scene 1 soliloquy ("To be or not to be") focusing on Shakespearean themes of mortality and human inaction.',
      textSubmission: 'Late essay submission turned in past deadline.',
      files: ['Hamlet_Soliloquy_Essay.pdf (890 KB)'],
      comments: [
        { sender: 'Dr. Stella Gbandi (Teacher)', text: 'Late penalty of 5% applied per school regulations.', date: 'July 06, 09:00 AM' }
      ]
    },
    {
      id: '4',
      title: 'Wave Optics & Electromagnetism Problem Set',
      subject: 'Modern Physics (PHYS-201)',
      teacher: 'Prof. Emmanuel Thorpe',
      dueDate: 'July 02, 2026 • 05:00 PM',
      priority: 'Normal',
      status: 'Marked',
      grade: '95 / 100 (Grade A+)',
      description: 'Calculate wave interference fringes, double-slit experiment diffractions, and atomic energy level transitions.',
      textSubmission: 'Completed physics problem set solutions with ray optics diagrams.',
      files: ['Physics_Wave_Optics_Solutions.pdf (3.2 MB)'],
      comments: [
        { sender: 'Prof. Emmanuel Thorpe (Teacher)', text: 'Outstanding work on problem 4! Perfect mathematical rigor and clean ray diagrams.', date: 'July 03, 10:15 AM' }
      ]
    }
  ]);

  // Handle adding student comment
  const handleAddComment = (assignmentId: string) => {
    if (!newCommentInput.trim()) return;
    const newComment = {
      sender: 'Emeka Obi (Student)',
      text: newCommentInput.trim(),
      date: 'Just now'
    };
    setAssignmentsData(prev =>
      prev.map(a => a.id === assignmentId ? { ...a, comments: [...a.comments, newComment] } : a)
    );
    setNewCommentInput('');
  };

  // Dedicated Print Function for Timetable
  const handlePrintTimetable = () => {
    const timetableElement = document.getElementById('interactive-timetable-container');
    if (!timetableElement) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=1000,height=800');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Weekly Timetable - ${studentData.fullName}</title>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm;
            }
            body {
              background-color: white !important;
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body class="p-6 bg-white text-slate-900">
          <div class="mb-4 pb-2 border-b-2 border-slate-800 flex justify-between items-center">
            <div>
              <h1 class="text-xl font-black uppercase">Albert Academy — Official Student Timetable</h1>
              <p class="text-xs text-slate-600">Student: ${studentData.fullName} | ID: STU-2026-9081 | Class: ${studentData.className} | Term: 2026/2027 First Term</p>
            </div>
          </div>
          ${timetableElement.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Dedicated Print Function for A4 Report Card
  const handlePrintReportCard = () => {
    const printElement = document.getElementById('printable-report-card');
    if (!printElement) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report Card - ${studentData.fullName}</title>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            body {
              background-color: white !important;
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body class="p-4 bg-white text-slate-900">
          <div class="w-[210mm] max-w-full mx-auto space-y-4">
            ${printElement.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Course completion track
  const [courses] = useState([
    { id: '1', name: 'Mathematics: Algebra 101', code: 'MATH-101', progress: 82, tutor: 'Mr. Kwame Darko', email: 'kwame.darko@school.edu', room: 'Room 104', credits: 4, schedule: 'Mon 08:30 AM, Wed 10:00 AM, Fri 01:30 PM', description: 'Linear equations, quadratic functions, differentiation basics, and matrix operations.' },
    { id: '2', name: 'Organic Chemistry', code: 'CHEM-202', progress: 65, tutor: 'Mrs. Beatrice Mensah', email: 'beatrice.mensah@school.edu', room: 'Lab B', credits: 3.5, schedule: 'Tue 09:45 AM, Thu 11:30 AM', description: 'Hydrocarbons, functional group mechanisms, chemical bonding, and stoichiometry.' },
    { id: '3', name: 'English Literature', code: 'ENG-301', progress: 90, tutor: 'Dr. Stella Gbandi', email: 'stella.gbandi@school.edu', room: 'Lecture Hall 1', credits: 3, schedule: 'Mon 11:30 AM, Thu 08:30 AM', description: 'Shakespearean drama analysis (Hamlet), prose composition, and poetry critical analysis.' },
    { id: '4', name: 'Modern Physics', code: 'PHYS-201', progress: 75, tutor: 'Prof. Emmanuel Thorpe', email: 'emmanuel.thorpe@school.edu', room: 'Physics Lab A', credits: 4, schedule: 'Wed 01:30 PM, Fri 09:45 AM', description: 'Mechanics, wave optics, electromagnetism, and atomic energy levels.' }
  ]);

  // Fetch real profile from Supabase if logged in
  useEffect(() => {
    async function loadStudentProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            setStudentData((prev: any) => ({
              ...prev,
              fullName: profile.full_name || prev.fullName,
              studentId: profile.staff_id || `STU-${user.id.substring(0, 6).toUpperCase()}`,
            }));
          }
        }
      } catch (e) {
        // Fallback to default
      }
    }
    loadStudentProfile();
  }, []);

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
          `AI Assistant Output: Here is the study explanation for: "${studyPrompt}". Key concepts: 1) Focus on core formulas, 2) Write practice flashcards, and 3) Review past paper questions.`
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
    setSubmissionSuccess('Your assignment submission has been successfully recorded!');
    setAssignmentText('');
    setTimeout(() => setSubmissionSuccess(null), 4000);
  };

  // Navigation tabs
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
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in px-4 sm:px-6 lg:px-8 pb-12">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-extrabold uppercase tracking-wider">
            Student Portal Workspace
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            {studentData.className}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
            <button
              onClick={() => setViewMode('simple')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'simple'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Simple View</span>
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'advanced'
                  ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Standard Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Mode 1: SIMPLE VIEW (For younger students / simplified interface) */}
      {viewMode === 'simple' && (
        <div className="space-y-8 animate-fade-in">
          {/* Friendly Greeting Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
                Hello {studentData.fullName}! Have a great school day!
              </h2>
              <p className="text-xs text-amber-200/80">Here is your simple school card overview for today.</p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
              🌟 {studentData.house}
            </span>
          </div>

          {/* Simple Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Classes Today */}
            <div className="glass-card p-6 rounded-3xl border border-blue-500/20 bg-blue-500/5 space-y-4 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">3 Lessons Today</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Today&apos;s Classes</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Mathematics (08:30 AM), Chemistry (09:45 AM), English Literature (11:30 AM)</p>
              </div>
              <button onClick={() => { setViewMode('advanced'); setActiveTab('timetable'); }} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <span>View Full Timetable</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Homework & Assignments */}
            <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 space-y-4 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                  <BookOpenCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">1 Due Today</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Homework Desk</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Algebra: Polynomial exercises due before 05:00 PM</p>
              </div>
              <button onClick={() => { setViewMode('advanced'); setActiveTab('assignments'); }} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <span>Open Assignment Desk</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: AI Helper */}
            <div className="glass-card p-6 rounded-3xl border border-purple-500/20 bg-purple-500/5 space-y-4 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">24/7 AI Helper</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">AI Study Helper</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Ask questions or generate simple explanations for any subject topic.</p>
              </div>
              <button onClick={() => { setViewMode('advanced'); setActiveTab('ai-copilot'); }} className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <span>Ask Study Assistant</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: House Points & Rewards */}
            <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-4 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">+15 Merits</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Merits &amp; House Points</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Red House Rank #2 &bull; 15 Merit points awarded this term for Science Fair</p>
              </div>
              <button onClick={() => { setViewMode('advanced'); setActiveTab('welfare'); }} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <span>View Conduct &amp; Merits</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 5: Library & Books */}
            <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 space-y-4 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                  <BookMarked className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">2 Books Borrowed</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Library Records</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Introduction to Algorithms (Due in 5 days), Organic Chemistry Vol 1</p>
              </div>
              <button onClick={() => { setViewMode('advanced'); setActiveTab('activities'); }} className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <span>Open Library Log</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 6: School Bulletin */}
            <div className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                  <Bell className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">Announcements</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">School Notices</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Physics Inter-school Competition registration holds Thursday in Room 103.</p>
              </div>
              <button onClick={() => { setViewMode('advanced'); setActiveTab('dashboard'); }} className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <span>Read Full Bulletins</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: STANDARD WORKSPACE (For Secondary / High School Students) */}
      {viewMode === 'advanced' && (
        <div className="space-y-8 animate-fade-in">
          {/* Workspace Tab Pages */}
          <div>
            {/* Tab 1: Dashboard Overview (Home) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                {/* 1. WELCOME SECTION */}
                <div className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--bg-secondary))] via-[hsl(var(--bg-secondary)/0.9)] to-[hsl(var(--accent)/0.1)] p-6 sm:p-8 shadow-xl">
                  <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    {/* Student Info & Avatar */}
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] p-1 shadow-lg shadow-[hsl(var(--accent)/0.25)]">
                          <div className="w-full h-full rounded-[22px] bg-[hsl(var(--bg-primary))] flex items-center justify-center text-[hsl(var(--accent))] font-black text-2xl border border-white/10">
                            {studentData.fullName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[hsl(var(--bg-primary))]" title="Active Student Session" />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[11px] font-extrabold tracking-wider uppercase border border-[hsl(var(--accent)/0.2)]">
                            Student ID: {studentData.studentId}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                            {studentData.className}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                            🌟 {studentData.house}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--text-primary))] tracking-tight truncate">
                          {studentData.fullName}
                        </h2>
                        <p className="text-xs text-[hsl(var(--text-secondary))] font-medium flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                          <span>2026/2027 Academic Session &bull; First Term (Active)</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2 xl:pt-0 border-t xl:border-t-0 border-[hsl(var(--border))]">
                      <button
                        onClick={() => setActiveTab('assignments')}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] hover:opacity-95 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Assignment</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('timetable')}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all"
                      >
                        <Clock className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                        <span>View Timetable</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('ai-copilot')}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/25 transition-all"
                      >
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span>Ask AI Copilot</span>
                      </button>
                      <button
                        onClick={() => handleAction('Report Card Download')}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Report Card</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. SUMMARY CARDS GRID (9 KPI METRICS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Card 1: Attendance Percentage */}
                  <div
                    onClick={() => setActiveTab('attendance')}
                    className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Attendance Percentage</span>
                      <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-400">{studentData.attendanceRate}</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">72 Days Present &bull; 2 Absences this term</p>
                    </div>
                  </div>

                  {/* Card 2: Current Class & Section */}
                  <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Class &amp; Section</span>
                      <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">{studentData.className}</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">Senior Secondary Stream B &bull; Room 104</p>
                    </div>
                  </div>

                  {/* Card 3: Overall GPA / Average */}
                  <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Overall GPA / Average</span>
                      <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-purple-400">{studentData.gpa} / 4.0</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">{studentData.overallAverage} Average &bull; Top 15% in Stream</p>
                    </div>
                  </div>

                  {/* Card 4: Upcoming Exams */}
                  <div className="glass-card p-5 border border-rose-500/20 bg-rose-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Upcoming Exams</span>
                      <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
                        <FileCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-rose-400">3 Exams</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">Midterm Exams start July 07, 2026</p>
                    </div>
                  </div>

                  {/* Card 5: Assignments Due */}
                  <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Assignments Due</span>
                      <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                        <BookOpenCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-amber-400">{studentData.pendingHomework} Pending</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">Algebra Chapter 4 due today at 05:00 PM</p>
                    </div>
                  </div>

                  {/* Card 6: Fee Balance */}
                  <div className="glass-card p-5 border border-teal-500/20 bg-teal-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Fee Balance</span>
                      <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-teal-400">₦0.00</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">Fully Paid &bull; Receipt REC-80812</p>
                    </div>
                  </div>

                  {/* Card 7: Library Books Borrowed */}
                  <div className="glass-card p-5 border border-sky-500/20 bg-sky-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Library Books Borrowed</span>
                      <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400">
                        <BookMarked className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-sky-400">2 Books</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">1 Due in 5 days &bull; 1 Overdue book</p>
                    </div>
                  </div>

                  {/* Card 8: Behavior Score */}
                  <div className="glass-card p-5 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Behavior &amp; Merits</span>
                      <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
                        <Trophy className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-indigo-400">+15 Merits</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">0 Demerits &bull; Rank #2 in House</p>
                    </div>
                  </div>

                  {/* Card 9: Notifications Count */}
                  <div className="glass-card p-5 border border-pink-500/20 bg-pink-500/5 rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Notifications</span>
                      <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400">
                        <Bell className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-pink-400">4 Unread</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-1 font-medium">2 Bulletins &bull; 1 Grade &bull; 1 Homework</p>
                    </div>
                  </div>
                </div>

                {/* Split grid for Announcements & Timetable */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Timetable & Homework */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Timetable widget */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-4 rounded-3xl shadow-lg">
                      <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                        <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-[hsl(var(--accent))]" /> Today&apos;s Lecture Timetable
                        </p>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
                          3 Periods
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { time: '08:30 AM — 09:30 AM', subject: 'Grade 10 Algebra', teacher: 'Mr. Kwame Darko', room: 'Room 104', status: 'Completed' },
                          { time: '09:45 AM — 10:45 AM', subject: 'Organic Chemistry', teacher: 'Mrs. Beatrice Mensah', room: 'Chemistry Lab B', status: 'Ongoing' },
                          { time: '11:30 AM — 12:30 PM', subject: 'English Literature: Hamlet', teacher: 'Dr. Stella Gbandi', room: 'Main Lecture Hall 1', status: 'Pending' }
                        ].map((period, index) => (
                          <div key={index} className="flex justify-between items-center p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                            <div>
                              <p className="font-bold text-[hsl(var(--text-primary))] text-xs">{period.subject}</p>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{period.teacher} &bull; {period.room}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-mono text-[hsl(var(--text-secondary))]">{period.time}</p>
                              <span className={`text-[10px] font-extrabold ${period.status === 'Completed' ? 'text-[hsl(var(--text-tertiary))]' : period.status === 'Ongoing' ? 'text-[hsl(var(--accent))]' : 'text-amber-400'}`}>
                                {period.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Announcement bulletin */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-4 rounded-3xl shadow-lg">
                      <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> School Bulletin Notices
                      </p>
                      <div className="space-y-3 leading-relaxed text-xs">
                        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                          <p className="font-bold text-[hsl(var(--text-primary))]">Physics Inter-school Competitions</p>
                          <p className="text-[hsl(var(--text-secondary))] text-[11px]">Registration for the national physics olympiad holds this Thursday in room 103. Open to all senior students.</p>
                          <p className="text-[9px] text-[hsl(var(--text-tertiary))] pt-1">Submitted by Admin &bull; 2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Assistant mini & Weekly Goals */}
                  <div className="space-y-6">
                    {/* Copilot Mini */}
                    <div className="glass-card p-6 border border-indigo-500/20 bg-indigo-500/5 space-y-4 rounded-3xl shadow-lg">
                      <p className="font-bold text-indigo-400 flex items-center gap-2 text-sm">
                        <Brain className="w-5 h-5 text-indigo-400" /> AI Study Assistant
                      </p>
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Enter a homework query to receive instant study explanations.</p>
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          value={studyPrompt}
                          onChange={e => setStudyPrompt(e.target.value)}
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-[hsl(var(--text-primary))] text-xs"
                        />
                        <button onClick={handleAskAI} className="w-full py-2 text-xs bg-indigo-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Ask Assistant
                        </button>
                        {aiResponse && (
                          <div className="p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-950/30 text-[11px] leading-relaxed text-[hsl(var(--text-secondary))]">
                            {aiResponse}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* To-do widgets list */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-4 rounded-3xl shadow-lg">
                      <p className="font-bold text-[hsl(var(--text-primary))] text-sm">My Study To-Do List</p>
                      <div className="space-y-2.5">
                        {todos.map(todo => (
                          <div key={todo.id} className="flex justify-between items-center p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.4)]">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))]" />
                              <span className={`text-xs ${todo.done ? 'line-through text-[hsl(var(--text-tertiary))]' : 'text-[hsl(var(--text-primary))]'}`}>{todo.text}</span>
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
                            className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-3 py-1.5 text-xs text-[hsl(var(--text-primary))]"
                          />
                          <button onClick={handleAddTodo} className="px-3 py-1.5 bg-[hsl(var(--accent))] text-white rounded-xl text-xs font-bold">Add</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Attendance Tracker Module */}
            {activeTab === 'attendance' && (
              <div className="space-y-8 animate-fade-in">
                {/* 1. ATTENDANCE HEADER & POLICY STANDING BANNER */}
                <div className="glass-card p-6 sm:p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold tracking-wider uppercase border border-emerald-500/30">
                          Student Attendance Ledger
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-bold border border-blue-500/20">
                          Session 2026/2027 • Term 1
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--text-primary))] tracking-tight">
                        Daily &amp; Monthly Attendance Analytics
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 max-w-2xl">
                        Monitor your daily check-in timestamps, monthly presence rates, late arrival logs, and examination eligibility standing.
                      </p>
                    </div>

                    {/* Policy Standing Card */}
                    <div className="flex items-center gap-4 bg-[hsl(var(--bg-secondary))] p-4 rounded-2xl border border-emerald-500/30 shadow-md">
                      <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] tracking-wider">Exam Eligibility Status</span>
                        <p className="text-sm font-black text-emerald-400">ELIGIBLE (96.4%)</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Above 85% Ministry Threshold</p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Policy Warning / Info Box */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Good Standing:</strong> Your attendance rate of <strong>96.4%</strong> comfortably satisfies school regulations (minimum 85% required for exam registration). Keep up the great punctuality!
                    </span>
                  </div>
                </div>

                {/* 2. TODAY'S DAILY ATTENDANCE STAMP & QUICK STATS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Today's Gate & Homeroom Check-in */}
                  <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg bg-[hsl(var(--bg-secondary))]">
                    <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                      <p className="font-bold text-[hsl(var(--text-primary))] text-sm flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-[hsl(var(--accent))]" /> Today&apos;s Gate &amp; Class Check-In
                      </p>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PRESENT TODAY
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Campus Gate Entry:</span>
                          <span className="font-mono font-bold text-emerald-400">08:15:32 AM</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Method:</span>
                          <span className="font-bold text-[hsl(var(--text-primary))]">Smart RFID Student Badge</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Homeroom Period:</span>
                          <span className="font-bold text-[hsl(var(--text-primary))]">Room 104 (Mr. Kwame Darko)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-[hsl(var(--border))]">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Punctuality Score:</span>
                          <span className="font-bold text-emerald-400">Punctual (On Time)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Statistics Grid (4 Key Metrics) */}
                  <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Stat 1: Total School Days */}
                    <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5 rounded-3xl flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] tracking-wider">Total School Days</span>
                      <p className="text-3xl font-black text-[hsl(var(--text-primary))] my-2">75 Days</p>
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))]">2026/2027 Academic Year</span>
                    </div>

                    {/* Stat 2: Present Days */}
                    <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] tracking-wider">Days Present</span>
                      <p className="text-3xl font-black text-emerald-400 my-2">72 Days</p>
                      <span className="text-[10px] text-emerald-400 font-bold">96.0% Presence Rate</span>
                    </div>

                    {/* Stat 3: Absent & Late Days */}
                    <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 rounded-3xl flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] tracking-wider">Late Arrivals</span>
                      <p className="text-3xl font-black text-amber-400 my-2">1 Day</p>
                      <span className="text-[10px] text-amber-400">Entry at 08:35 AM (July 02)</span>
                    </div>

                    {/* Stat 4: Excused Absences */}
                    <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] tracking-wider">Excused Absences</span>
                      <p className="text-3xl font-black text-purple-400 my-2">1 Day</p>
                      <span className="text-[10px] text-purple-400">Approved Medical Leave</span>
                    </div>
                  </div>
                </div>

                {/* 3. ATTENDANCE TREND GRAPH (SVG) & MONTHLY BREAKDOWN */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Monthly Attendance Trend Chart */}
                  <div className="lg:col-span-2 glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Monthly Attendance Trend Graph</h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Track your monthly attendance percentage against school thresholds.</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        Average: 96.4%
                      </span>
                    </div>

                    {/* SVG Line Chart */}
                    <div className="h-48 w-full pt-4">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130">
                        <defs>
                          <linearGradient id="gradAttendance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Minimum threshold 85% line */}
                        <line x1="40" y1="75" x2="460" y2="75" stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.6" />
                        <text x="465" y="78" fill="#ef4444" fontSize="9" fontWeight="bold">85% Min</text>

                        {/* Attendance curve */}
                        <path d="M 50,30 Q 180,25 310,40 T 450,20 L 450,110 L 50,110 Z" fill="url(#gradAttendance)" />
                        <path d="M 50,30 Q 180,25 310,40 T 450,20" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />

                        {/* Points */}
                        <circle cx="50" cy="30" r="5" fill="#10b981" />
                        <circle cx="180" cy="25" r="5" fill="#10b981" />
                        <circle cx="310" cy="40" r="5" fill="#10b981" />
                        <circle cx="450" cy="20" r="5" fill="#10b981" />

                        {/* Labels */}
                        <text x="50" y="122" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">April (100%)</text>
                        <text x="180" y="122" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">May (95.2%)</text>
                        <text x="310" y="122" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">June (95.6%)</text>
                        <text x="450" y="122" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">July (96.2%)</text>
                      </svg>
                    </div>
                  </div>

                  {/* Right 1 Col: Monthly Log Summary Table */}
                  <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                    <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Monthly Log Summary</h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { month: 'July 2026', total: 20, present: 19, late: 1, absent: 0, rate: '96.2%', status: 'Excellent' },
                        { month: 'June 2026', total: 22, present: 21, late: 0, absent: 1, rate: '95.6%', status: 'Good' },
                        { month: 'May 2026', total: 21, present: 20, late: 0, absent: 1, rate: '95.2%', status: 'Good' },
                        { month: 'April 2026', total: 18, present: 18, late: 0, absent: 0, rate: '100.0%', status: 'Perfect' }
                      ].map((item, index) => (
                        <div key={index} className="p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-1.5">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-[hsl(var(--text-primary))]">{item.month}</span>
                            <span className="text-emerald-400 font-mono">{item.rate}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-[hsl(var(--text-tertiary))] font-mono">
                            <span>{item.present} Present</span>
                            <span>{item.late} Late</span>
                            <span>{item.absent} Absent</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. RECENT ATTENDANCE HISTORY LOG TABLE */}
                <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Daily Attendance Log &amp; Check-In History</h3>
                    <span className="text-xs font-bold text-[hsl(var(--text-tertiary))]">Showing last 7 school days</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] uppercase text-[10px] font-extrabold">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Gate Check-In</th>
                          <th className="py-3 px-4">Homeroom Check-In</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Method / Scanner</th>
                          <th className="py-3 px-4">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                        {[
                          { date: 'Mon, July 27, 2026', gate: '08:15 AM', room: '08:25 AM', status: 'Present', method: 'RFID Badge', remark: 'On Time', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                          { date: 'Fri, July 24, 2026', gate: '08:12 AM', room: '08:22 AM', status: 'Present', method: 'RFID Badge', remark: 'On Time', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                          { date: 'Thu, July 23, 2026', gate: '08:18 AM', room: '08:28 AM', status: 'Present', method: 'Biometric Fingerprint', remark: 'On Time', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                          { date: 'Wed, July 22, 2026', gate: '08:10 AM', room: '08:20 AM', status: 'Present', method: 'RFID Badge', remark: 'On Time', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                          { date: 'Tue, July 21, 2026', gate: '08:14 AM', room: '08:24 AM', status: 'Present', method: 'RFID Badge', remark: 'On Time', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                          { date: 'Mon, July 20, 2026', gate: '—', room: '—', status: 'Excused', method: 'Medical Sick Note', remark: 'Clinic Approved', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                          { date: 'Fri, July 17, 2026', gate: '08:35 AM', room: '08:42 AM', status: 'Late', method: 'Manual Entry', remark: 'Tardy (5 mins late)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
                        ].map((row, index) => (
                          <tr key={index} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[hsl(var(--text-primary))]">{row.date}</td>
                            <td className="py-3.5 px-4 font-mono">{row.gate}</td>
                            <td className="py-3.5 px-4 font-mono">{row.room}</td>
                            <td className="py-3.5 px-4 font-extrabold">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] border ${row.color}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[hsl(var(--text-secondary))]">{row.method}</td>
                            <td className="py-3.5 px-4 font-medium text-[hsl(var(--text-tertiary))]">{row.remark}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Profile */}
            {activeTab === 'profile' && (
              <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] space-y-6 rounded-3xl animate-fade-in text-xs shadow-lg">
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Student Profile &amp; Bio Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Passport photo mock */}
                  <div className="flex flex-col items-center justify-center p-6 border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                    <div className="w-24 h-24 rounded-full bg-[hsl(var(--accent)/0.12)] border-2 border-[hsl(var(--accent))] flex items-center justify-center mb-3">
                      <GraduationCap className="w-12 h-12 text-[hsl(var(--accent))]" />
                    </div>
                    <p className="font-extrabold text-[hsl(var(--text-primary))] text-base">{studentData.fullName}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-extrabold mt-1">ID: {studentData.studentId}</p>
                  </div>

                  {/* Profile Details */}
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Class Section</label>
                        <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">{studentData.className}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">House</label>
                        <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">{studentData.house}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Date of Birth</label>
                        <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">12th April 2010</p>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Emergency Guardian Contact</label>
                        <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">Mr. Chidi Obi (+234 802 555 1199)</p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Welfare &amp; Medical Warnings (Read-Only)</label>
                        <p className="text-xs font-semibold text-rose-400">Asthma Inhaler required inside backpack &bull; Penicillin Allergy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Comprehensive Academic Module */}
            {activeTab === 'academics' && (
              <div className="space-y-6 animate-fade-in">
                {/* Academic Header Banner & Sub-Navigation */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl bg-gradient-to-r from-[hsl(var(--bg-secondary))] via-[hsl(var(--bg-secondary)/0.9)] to-[hsl(var(--accent)/0.08)]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-3 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-[11px] font-extrabold tracking-wider uppercase">
                          Academic Management Center
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                          Class Stream Rank: #3 of 42
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--text-primary))] tracking-tight">
                        Academic Portal &amp; Gradebook
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 max-w-2xl">
                        Access enrolled subjects, continuous assessment breakdown, weekly schedules, online homework desk, and downloadable transcripts.
                      </p>
                    </div>

                    {/* Quick Transcript & Report Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setShowReportCardModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all"
                      >
                        <FileText className="w-4 h-4 text-[hsl(var(--accent))]" />
                        <span>View Report Card</span>
                      </button>
                      <button
                        onClick={() => setShowTranscriptModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] hover:opacity-95 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Academic Transcript</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'subjects', label: '📚 Enrolled Subjects & Timetable' },
                      { id: 'grades', label: '📊 Grades, Rank & Transcripts' },
                      { id: 'assignments', label: '📝 Assignment Center' },
                      { id: 'resources', label: '🧠 Learning Resources & Library' }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setAcademicSection(sub.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          academicSection === sub.id
                            ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Section 1: Enrolled Subjects & Weekly Timetable */}
                {academicSection === 'subjects' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {courses.map(course => (
                        <div key={course.id} className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[10px] font-extrabold">
                                  {course.code}
                                </span>
                                <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold">{course.credits} Credits</span>
                              </div>
                              <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))] mt-1">{course.name}</h3>
                            </div>
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              {course.progress}% Syllabus
                            </span>
                          </div>

                          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{course.description}</p>

                          {/* Syllabus progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[hsl(var(--text-tertiary))]">
                              <span>Curriculum Progress</span>
                              <span>{course.progress}% Completed</span>
                            </div>
                            <div className="w-full bg-[hsl(var(--bg-tertiary))] h-2 rounded-full overflow-hidden">
                              <div className="bg-[hsl(var(--accent))] h-full rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                            </div>
                          </div>

                          {/* Teacher & Timetable */}
                          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border)/0.5)] space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-[hsl(var(--text-tertiary))] font-semibold">Tutor / Teacher:</span>
                              <span className="font-bold text-[hsl(var(--text-primary))]">{course.tutor} ({course.room})</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[hsl(var(--text-tertiary))] font-semibold">Weekly Schedule:</span>
                              <span className="font-mono text-[hsl(var(--accent))] font-bold">{course.schedule}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Section 2: Grades, Results, Position & Transcripts */}
                {academicSection === 'grades' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Academic Performance Summary Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Cumulative GPA</span>
                        <p className="text-2xl font-black text-purple-400">3.82 / 4.0</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">First Class Honors Standing</p>
                      </div>
                      <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Class Rank / Stream</span>
                        <p className="text-2xl font-black text-emerald-400">#3 / 42</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Top 7% Percentile</p>
                      </div>
                      <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Term Average</span>
                        <p className="text-2xl font-black text-blue-400">86.5%</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Total Points: 346/400</p>
                      </div>
                      <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Academic Status</span>
                        <p className="text-2xl font-black text-amber-400">PROMOTED</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Cleared for Senior Secondary 3</p>
                      </div>
                    </div>

                    {/* Progress Trend Chart (SVG) */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Academic Progress Trend Chart</h3>
                          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Average score progression over the last 3 academic terms.</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          +5.5% Growth Curve
                        </span>
                      </div>

                      {/* SVG Line Chart */}
                      <div className="h-44 w-full pt-4">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                          <defs>
                            <linearGradient id="gradAcademic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M 50,80 Q 200,60 350,30 T 450,20 L 450,110 L 50,110 Z" fill="url(#gradAcademic)" />
                          <path d="M 50,80 Q 200,60 350,30 T 450,20" fill="none" stroke="hsl(var(--accent))" strokeWidth="3.5" strokeLinecap="round" />
                          <circle cx="50" cy="80" r="5" fill="hsl(var(--accent))" />
                          <circle cx="250" cy="50" r="5" fill="hsl(var(--accent))" />
                          <circle cx="450" cy="20" r="5" fill="hsl(var(--accent))" />
                          <text x="50" y="105" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">Term 1 (81%)</text>
                          <text x="250" y="105" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">Term 2 (84%)</text>
                          <text x="450" y="105" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">Term 3 (86.5%)</text>
                        </svg>
                      </div>
                    </div>

                    {/* Subject Gradebook Breakdown Table */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Continuous Assessment &amp; Examination Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] uppercase text-[10px] font-extrabold">
                              <th className="py-3 px-4">Subject</th>
                              <th className="py-3 px-4">CA Test 1 (15%)</th>
                              <th className="py-3 px-4">CA Test 2 (15%)</th>
                              <th className="py-3 px-4">Homework (10%)</th>
                              <th className="py-3 px-4">Exam (60%)</th>
                              <th className="py-3 px-4">Total Score</th>
                              <th className="py-3 px-4">Grade</th>
                              <th className="py-3 px-4">Class Avg</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                            {[
                              { subject: 'Mathematics (Algebra & Calculus)', ca1: '14 / 15', ca2: '14 / 15', hw: '9 / 10', exam: '55 / 60', total: '92%', grade: 'A+', avg: '74%', color: 'text-emerald-400' },
                              { subject: 'Organic Chemistry', ca1: '11 / 15', ca2: '11 / 15', hw: '8 / 10', exam: '48 / 60', total: '78%', grade: 'B+', avg: '69%', color: 'text-blue-400' },
                              { subject: 'English Literature', ca1: '13 / 15', ca2: '13 / 15', hw: '9 / 10', exam: '50 / 60', total: '85%', grade: 'A', avg: '71%', color: 'text-purple-400' },
                              { subject: 'Modern Physics', ca1: '14 / 15', ca2: '13 / 15', hw: '9 / 10', exam: '52 / 60', total: '88%', grade: 'A', avg: '72%', color: 'text-indigo-400' }
                            ].map((row, index) => (
                              <tr key={index} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                                <td className="py-3.5 px-4 font-bold text-[hsl(var(--text-primary))]">{row.subject}</td>
                                <td className="py-3.5 px-4 font-mono">{row.ca1}</td>
                                <td className="py-3.5 px-4 font-mono">{row.ca2}</td>
                                <td className="py-3.5 px-4 font-mono">{row.hw}</td>
                                <td className="py-3.5 px-4 font-mono">{row.exam}</td>
                                <td className={`py-3.5 px-4 font-black text-sm ${row.color}`}>{row.total}</td>
                                <td className="py-3.5 px-4 font-extrabold"><span className="px-2.5 py-1 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[10px]">{row.grade}</span></td>
                                <td className="py-3.5 px-4 font-mono text-[hsl(var(--text-tertiary))]">{row.avg}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Section 3: Assignment Center */}
                {academicSection === 'assignments' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left 2 Cols: Active & Past Assignments */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Active Homework &amp; Project Tasks</h3>

                          <div className="space-y-4">
                            {[
                              { id: '1', title: 'Algebra: Polynomial Proofs & Quadratic Functions', subject: 'Mathematics', points: 100, due: 'Today at 05:00 PM', urgency: 'Due Today', status: 'Pending', desc: 'Solve exercises 1 to 15 on Page 142 of Chapter 4. Ensure all derivation steps are shown clearly.' },
                              { id: '2', title: 'Organic Chemistry Reactions Mechanisms Essay', subject: 'Chemistry', points: 50, due: 'Tomorrow at 11:59 PM', urgency: 'Upcoming', status: 'Submitted', desc: 'Write a 500-word analysis detailing electrophilic addition reactions in alkenes with diagrams.' },
                              { id: '3', title: 'Hamlet Act III Critical Character Analysis', subject: 'English', points: 100, due: 'July 12, 2026', urgency: 'Graded', status: 'Graded', score: '95 / 100', feedback: 'Outstanding thematic breakdown of Hamlet soliloquies!' }
                            ].map(item => (
                              <div
                                key={item.id}
                                onClick={() => setSelectedAssignmentId(item.id)}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                                  selectedAssignmentId === item.id
                                    ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.06)] shadow-md'
                                    : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary)/0.4)]'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[10px] font-extrabold">
                                        {item.subject}
                                      </span>
                                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold">{item.points} Total Pts</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] mt-1.5">{item.title}</h4>
                                  </div>
                                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                                    item.urgency === 'Due Today'
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                      : item.urgency === 'Graded'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {item.urgency}
                                  </span>
                                </div>
                                <p className="text-xs text-[hsl(var(--text-secondary))] mt-2">{item.desc}</p>
                                {item.feedback && (
                                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> <span>Teacher Feedback ({item.score}): &quot;{item.feedback}&quot;</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right 1 Col: Submission Desk */}
                      <div className="space-y-6">
                        <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Submit Homework Online</h3>
                          <p className="text-xs text-[hsl(var(--text-tertiary))]">Attach solution files or type your answer text below to submit directly to your teacher.</p>

                          {submissionSuccess && (
                            <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                              <CheckCircle2 className="w-4 h-4" /> {submissionSuccess}
                            </div>
                          )}

                          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                            <div>
                              <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">
                                Selected Task
                              </label>
                              <select
                                value={selectedAssignmentId}
                                onChange={e => setSelectedAssignmentId(e.target.value)}
                                className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-xs text-[hsl(var(--text-primary))]"
                              >
                                <option value="1">Algebra: Polynomial Proofs (Due today)</option>
                                <option value="2">Organic Chemistry Essay (Due tomorrow)</option>
                              </select>
                            </div>

                            {/* File Attachment Upload */}
                            <div>
                              <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">
                                Attach File / Document (PDF, DOCX, PNG)
                              </label>
                              <div
                                onClick={() => setAttachedFileName('Polynomial_Derivations_Emeka_Obi.pdf')}
                                className="p-4 border-2 border-dashed border-[hsl(var(--border))] rounded-2xl text-center bg-[hsl(var(--bg-tertiary)/0.3)] hover:border-[hsl(var(--accent))] cursor-pointer transition-all space-y-1"
                              >
                                <FileText className="w-6 h-6 text-[hsl(var(--accent))] mx-auto" />
                                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">
                                  {attachedFileName || 'Click to select solution file'}
                                </p>
                                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Supports PDF, DOCX, JPEG up to 25MB</p>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">
                                Text Response / Mathematical Proof
                              </label>
                              <textarea
                                value={assignmentText}
                                onChange={e => setAssignmentText(e.target.value)}
                                placeholder="Type or paste your homework steps here..."
                                className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-3.5 text-xs text-[hsl(var(--text-primary))] h-32 focus:outline-none focus:border-[hsl(var(--accent))]"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-[hsl(var(--accent))] text-white rounded-2xl font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(var(--accent)/0.2)]"
                            >
                              <Send className="w-4 h-4" /> Submit Homework Answer
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Section 4: Learning Resources & Digital Library */}
                {academicSection === 'resources' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Lecture Notes & PDFs */}
                      <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Lecture Notes &amp; PDFs</h3>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Downloadable teacher guides</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          {[
                            { title: 'Algebra Chapter 4 Formulas & Proofs', size: '2.4 MB PDF' },
                            { title: 'Organic Reaction Mechanism Chart', size: '1.8 MB PDF' },
                            { title: 'Shakespeare Hamlet Critical Themes', size: '3.1 MB DOCX' },
                            { title: 'Physics Electromagnetism Notes', size: '4.2 MB PDF' }
                          ].map((item, index) => (
                            <div key={index} className="p-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] flex justify-between items-center hover:bg-[hsl(var(--bg-tertiary))] transition-all">
                              <div>
                                <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{item.title}</p>
                                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{item.size}</p>
                              </div>
                              <button onClick={() => handleAction(`Download ${item.title}`)} className="p-2 rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recorded Classes & Video Lessons */}
                      <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                            <Zap className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Recorded Class Videos</h3>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Watch archived live classes</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          {[
                            { title: 'Electrophilic Addition Reactions Walkthrough', duration: '28 Mins • HD Video' },
                            { title: 'Polynomial Division & Remainder Theorem', duration: '45 Mins • Live Class' },
                            { title: 'Hamlet Act III Scene Analysis Discussion', duration: '35 Mins • HD Video' }
                          ].map((video, index) => (
                            <div key={index} className="p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] space-y-1.5 hover:bg-[hsl(var(--bg-tertiary))] transition-all">
                              <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{video.title}</p>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-[hsl(var(--accent))] font-mono font-bold">{video.duration}</span>
                                <button onClick={() => handleAction(`Play Video ${video.title}`)} className="font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1">
                                  <span>Watch Video</span> &rarr;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* External Study Links & Textbooks */}
                      <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Textbooks &amp; External Links</h3>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Curated external resources</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          {[
                            { title: 'Khan Academy: High School Algebra Unit', type: 'External Interactive Portal' },
                            { title: 'BBC Bitesize: Organic Chemistry Revision', type: 'External Practice Portal' },
                            { title: 'WolframAlpha: Step-by-Step Solver', type: 'Math Engine Tool' },
                            { title: 'Oxford Senior Mathematics Vol 2 Textbook', type: 'E-Library Reference' }
                          ].map((ext, index) => (
                            <div key={index} className="p-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] flex justify-between items-center hover:bg-[hsl(var(--bg-tertiary))] transition-all">
                              <div>
                                <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{ext.title}</p>
                                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{ext.type}</p>
                              </div>
                              <button onClick={() => handleAction(`Open ${ext.title}`)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL 1: OFFICIAL ACADEMIC TRANSCRIPT */}
                {showTranscriptModal && (
                  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
                      <div className="flex justify-between items-start border-b border-[hsl(var(--border))] pb-4">
                        <div>
                          <span className="px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[10px] font-extrabold uppercase tracking-wider">
                            OFFICIAL ACADEMIC TRANSCRIPT
                          </span>
                          <h3 className="text-xl font-black text-[hsl(var(--text-primary))] mt-1">Albert Academy Senior High</h3>
                          <p className="text-xs text-[hsl(var(--text-tertiary))]">Student ID: {studentData.studentId} &bull; Issue Date: July 2026</p>
                        </div>
                        <button onClick={() => setShowTranscriptModal(false)} className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold hover:bg-[hsl(var(--border))]">
                          Close [X]
                        </button>
                      </div>

                      {/* Transcript Body */}
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]">
                          <p>Student Name: <strong className="text-[hsl(var(--text-primary))]">{studentData.fullName}</strong></p>
                          <p>Current Class: <strong className="text-[hsl(var(--text-primary))]">{studentData.className}</strong></p>
                          <p>Cumulative GPA: <strong className="text-[hsl(var(--accent))]">3.82 / 4.0</strong></p>
                          <p>Total Credits Earned: <strong className="text-[hsl(var(--text-primary))]">44.5 Credits</strong></p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-bold text-[hsl(var(--text-primary))] text-sm">Course Completion History</h4>
                          <div className="border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))] text-[10px] uppercase text-[hsl(var(--text-tertiary))]">
                                <tr>
                                  <th className="py-2.5 px-3">Code</th>
                                  <th className="py-2.5 px-3">Course Title</th>
                                  <th className="py-2.5 px-3">Credits</th>
                                  <th className="py-2.5 px-3">Grade</th>
                                  <th className="py-2.5 px-3">Points</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                                <tr>
                                  <td className="py-2.5 px-3 font-mono">MATH-101</td>
                                  <td className="py-2.5 px-3 font-bold">Mathematics: Algebra &amp; Calculus</td>
                                  <td className="py-2.5 px-3">4.0</td>
                                  <td className="py-2.5 px-3 font-extrabold text-emerald-400">A+</td>
                                  <td className="py-2.5 px-3 font-mono">4.0</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-3 font-mono">CHEM-202</td>
                                  <td className="py-2.5 px-3 font-bold">Organic Chemistry</td>
                                  <td className="py-2.5 px-3">3.5</td>
                                  <td className="py-2.5 px-3 font-extrabold text-blue-400">B+</td>
                                  <td className="py-2.5 px-3 font-mono">3.5</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-3 font-mono">ENG-301</td>
                                  <td className="py-2.5 px-3 font-bold">English Literature</td>
                                  <td className="py-2.5 px-3">3.0</td>
                                  <td className="py-2.5 px-3 font-extrabold text-purple-400">A</td>
                                  <td className="py-2.5 px-3 font-mono">4.0</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-3 font-mono">PHYS-201</td>
                                  <td className="py-2.5 px-3 font-bold">Modern Physics</td>
                                  <td className="py-2.5 px-3">4.0</td>
                                  <td className="py-2.5 px-3 font-extrabold text-indigo-400">A</td>
                                  <td className="py-2.5 px-3 font-mono">4.0</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-[hsl(var(--border))]">
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">Official Seal • Albert Academy Registrar</span>
                        <button onClick={() => handleAction('Transcript PDF Download')} className="px-5 py-2.5 bg-[hsl(var(--accent))] text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md">
                          <Download className="w-4 h-4" /> Download Signed PDF Transcript
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL 2: OFFICIAL REPORT CARD (A4 SIZE 210mm x 297mm) */}
                {showReportCardModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-3 sm:p-6 md:p-8 flex justify-center items-start animate-fade-in print:p-0 print:bg-white print:static print:overflow-visible">
                    <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl w-full max-w-[210mm] my-2 sm:my-6 p-4 sm:p-6 md:p-8 space-y-4 shadow-2xl font-sans text-xs print:w-full print:my-0 print:border-none print:shadow-none print:p-0">
                      
                      {/* Top Action Bar (Hidden when printing) */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3 print:hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-extrabold text-[10px] uppercase border border-indigo-200">
                            Standard A4 Sheet Format (210mm × 297mm)
                          </span>
                          <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                            Official School Report Card
                          </span>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={handlePrintReportCard}
                            className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" /> Print / Export A4 PDF
                          </button>
                          <button
                            onClick={() => setShowReportCardModal(false)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300"
                          >
                            Close [X]
                          </button>
                        </div>
                      </div>

                      {/* REPORT CARD BODY - MATCHING TEMPLATE IMAGE EXACTLY (A4 PRINTABLE CONTAINER) */}
                      <div id="printable-report-card" className="p-6 border-2 border-slate-800 rounded-xl bg-white space-y-4 print:border-2 print:p-4">
                        
                        {/* 1. HEADER SECTION (3 BOXES & CENTER LOGO/TITLE) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center pb-3 border-b-2 border-slate-800">
                          {/* Box 1: Basic School Info */}
                          <div className="p-2.5 border border-red-500 rounded bg-slate-50 text-[10px] space-y-0.5">
                            <p className="font-bold text-red-500 uppercase text-[9px]">Basic School Info</p>
                            <p className="font-semibold text-slate-900">Flowery Road 14, 01001 Nairobi</p>
                            <p>Tel.: +254 707 654 123</p>
                            <p className="truncate">Email: admin@schoolinwonderland.org</p>
                            <p className="truncate text-blue-600">Website: https://schoolinwonderland.edupage.org</p>
                          </div>

                          {/* Box 2: Center School Name & Logo */}
                          <div className="md:col-span-2 text-center space-y-2">
                            <div className="inline-block px-4 py-1.5 border-2 border-red-500 rounded bg-white">
                              <span className="text-[9px] text-red-500 font-bold block uppercase">School Name</span>
                              <h2 className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 uppercase">
                                SCHOOL IN WONDERLAND
                              </h2>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-12 h-12 border-2 border-red-500 rounded flex items-center justify-center bg-blue-50 text-blue-600 font-black text-xl shadow-inner">
                                E
                              </div>
                              <span className="text-[9px] font-bold text-red-500 uppercase">School Logo</span>
                            </div>
                          </div>

                          {/* Box 3: Student's Photo */}
                          <div className="flex flex-col items-center justify-center p-1.5 border-2 border-red-500 rounded bg-slate-50">
                            <div className="w-20 h-20 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow">
                              {studentData.fullName.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="text-[9px] font-bold text-red-500 mt-1 uppercase">Student&apos;s Photo</span>
                          </div>
                        </div>

                        {/* 2. REPORT TITLE & STUDENT DATA FIELDS */}
                        <div className="space-y-3 pt-1">
                          <h3 className="text-center font-black text-sm sm:text-base tracking-wider text-slate-900 border-b border-slate-300 pb-1 uppercase">
                            OPENING EXAM REPORT - TERM 1, 2026
                          </h3>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs font-semibold uppercase">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">NAME:</span>
                              <span className="px-2 py-0.5 border border-red-500 rounded font-bold text-slate-900 bg-red-50/30">
                                ANNA ARUNDEL ({studentData.fullName})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">ADM. NO.:</span>
                              <span className="px-2 py-0.5 border border-red-500 rounded font-mono font-bold text-slate-900 bg-red-50/30">
                                153426
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">FORM:</span>
                              <span className="px-2 py-0.5 border border-red-500 rounded font-bold text-slate-900 bg-red-50/30">
                                1 A ({studentData.className})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">HOUSE:</span>
                              <span className="px-2 py-0.5 border border-red-500 rounded font-bold text-slate-900 bg-red-50/30">
                                SLYTHERIN ({studentData.house})
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">CLUB:</span>
                              <span className="px-2 py-0.5 border border-red-500 rounded font-bold text-slate-900 bg-red-50/30">
                                SCIENCE &amp; ROBOTICS CLUB
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. MAIN MULTI-TERM SUBJECT PERFORMANCE TABLE (MATCHING ATTACHED IMAGE) */}
                        <div className="overflow-x-auto border-4 border-black font-sans">
                          <table className="w-full text-center text-xs border-collapse font-bold">
                            <thead>
                              {/* Tier 1 Header */}
                              <tr className="bg-slate-100 border-b-2 border-black text-xs uppercase font-black text-slate-900">
                                <th rowSpan={2} className="py-2.5 px-3 text-left border-r-4 border-black min-w-[130px] text-xs sm:text-sm font-extrabold align-middle">
                                  Subject
                                </th>
                                <th colSpan={4} className="py-2 px-2 border-r-4 border-black text-xs sm:text-sm text-center">
                                  First Terms
                                </th>
                                <th colSpan={4} className="py-2 px-2 border-r-4 border-black text-xs sm:text-sm text-center">
                                  Second Terms
                                </th>
                                <th colSpan={4} className="py-2 px-2 border-r-4 border-black text-xs sm:text-sm text-center">
                                  Third Terms
                                </th>
                                <th colSpan={2} className="py-2 px-2 text-xs sm:text-sm bg-slate-200 text-center">
                                  YEARLY
                                </th>
                              </tr>

                              {/* Tier 2 Sub-Header */}
                              <tr className="bg-slate-50 border-b-4 border-black text-[10px] uppercase font-black text-slate-900 text-center">
                                {/* First Terms */}
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">TEST</th>
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">EXAM</th>
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">MN</th>
                                <th className="py-1 px-1 border-r-4 border-black min-w-[38px]">RNK</th>

                                {/* Second Terms */}
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">TEST</th>
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">EXAM</th>
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">MN</th>
                                <th className="py-1 px-1 border-r-4 border-black min-w-[38px]">RNK</th>

                                {/* Third Terms */}
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">TEST</th>
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">EXAM</th>
                                <th className="py-1 px-1 border-r border-slate-400 min-w-[38px]">MN</th>
                                <th className="py-1 px-1 border-r-4 border-black min-w-[38px]">RNK</th>

                                {/* YEARLY */}
                                <th className="py-1 px-1 border-r border-slate-400 bg-slate-200 min-w-[38px]">MN</th>
                                <th className="py-1 px-1 bg-slate-200 min-w-[38px]">RNK</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-400 font-mono text-center text-xs">
                              {[
                                {
                                  name: 'ENGLISH',
                                  t1: { test: '26', exam: '65', mn: '65.0', rnk: '5' },
                                  t2: { test: '27', exam: '68', mn: '68.0', rnk: '4' },
                                  t3: { test: '28', exam: '72', mn: '72.0', rnk: '3' },
                                  yr: { mn: '68.3', rnk: '4' }
                                },
                                {
                                  name: 'KISWAHILI',
                                  t1: { test: '27', exam: '75', mn: '75.0', rnk: '6' },
                                  t2: { test: '28', exam: '76', mn: '76.0', rnk: '5' },
                                  t3: { test: '28', exam: '78', mn: '78.0', rnk: '4' },
                                  yr: { mn: '76.3', rnk: '5' }
                                },
                                {
                                  name: 'MATHEMATICS',
                                  t1: { test: '28', exam: '75', mn: '75.0', rnk: '7' },
                                  t2: { test: '29', exam: '82', mn: '82.0', rnk: '3' },
                                  t3: { test: '30', exam: '92', mn: '92.0', rnk: '1' },
                                  yr: { mn: '83.0', rnk: '2' }
                                },
                                {
                                  name: 'BIOLOGY',
                                  t1: { test: '18', exam: '54', mn: '54.0', rnk: '15' },
                                  t2: { test: '20', exam: '62', mn: '62.0', rnk: '12' },
                                  t3: { test: '22', exam: '70', mn: '70.0', rnk: '8' },
                                  yr: { mn: '62.0', rnk: '10' }
                                },
                                {
                                  name: 'CHEMISTRY',
                                  t1: { test: '22', exam: '78', mn: '78.0', rnk: '7' },
                                  t2: { test: '24', exam: '80', mn: '80.0', rnk: '5' },
                                  t3: { test: '25', exam: '84', mn: '84.0', rnk: '4' },
                                  yr: { mn: '80.7', rnk: '5' }
                                },
                                {
                                  name: 'PHYSICS',
                                  t1: { test: '27', exam: '90', mn: '90.0', rnk: '1' },
                                  t2: { test: '28', exam: '92', mn: '92.0', rnk: '1' },
                                  t3: { test: '29', exam: '95', mn: '95.0', rnk: '1' },
                                  yr: { mn: '92.3', rnk: '1' }
                                },
                                {
                                  name: 'HISTORY',
                                  t1: { test: '24', exam: '70', mn: '70.0', rnk: '7' },
                                  t2: { test: '25', exam: '74', mn: '74.0', rnk: '6' },
                                  t3: { test: '26', exam: '78', mn: '78.0', rnk: '5' },
                                  yr: { mn: '74.0', rnk: '6' }
                                },
                                {
                                  name: 'GERMAN',
                                  t1: { test: '26', exam: '82', mn: '82.0', rnk: '4' },
                                  t2: { test: '27', exam: '85', mn: '85.0', rnk: '3' },
                                  t3: { test: '28', exam: '88', mn: '88.0', rnk: '2' },
                                  yr: { mn: '85.0', rnk: '3' }
                                }
                              ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 text-slate-900 font-semibold">
                                  <td className="py-2 px-3 text-left font-extrabold border-r-4 border-black text-xs font-sans">
                                    {row.name}
                                  </td>

                                  {/* First Terms */}
                                  <td className="py-2 px-1 border-r border-slate-300">{row.t1.test}</td>
                                  <td className="py-2 px-1 border-r border-slate-300">{row.t1.exam}</td>
                                  <td className="py-2 px-1 font-bold border-r border-slate-300">{row.t1.mn}</td>
                                  <td className="py-2 px-1 font-bold border-r-4 border-black">{row.t1.rnk}</td>

                                  {/* Second Terms */}
                                  <td className="py-2 px-1 border-r border-slate-300">{row.t2.test}</td>
                                  <td className="py-2 px-1 border-r border-slate-300">{row.t2.exam}</td>
                                  <td className="py-2 px-1 font-bold border-r border-slate-300">{row.t2.mn}</td>
                                  <td className="py-2 px-1 font-bold border-r-4 border-black">{row.t2.rnk}</td>

                                  {/* Third Terms */}
                                  <td className="py-2 px-1 border-r border-slate-300">{row.t3.test}</td>
                                  <td className="py-2 px-1 border-r border-slate-300">{row.t3.exam}</td>
                                  <td className="py-2 px-1 font-bold border-r border-slate-300">{row.t3.mn}</td>
                                  <td className="py-2 px-1 font-bold border-r-4 border-black">{row.t3.rnk}</td>

                                  {/* YEARLY */}
                                  <td className="py-2 px-1 font-extrabold text-indigo-700 border-r border-slate-300 bg-slate-100">{row.yr.mn}</td>
                                  <td className="py-2 px-1 font-extrabold text-indigo-700 bg-slate-100">{row.yr.rnk}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* 4. ENTRY TOTALS & LEGEND KEY ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-slate-800 text-xs">
                          <div className="p-2 border-r border-slate-800 space-y-1 font-mono text-[11px]">
                            <p><strong>K.C.P.E ENTRY:</strong> TOTAL: 411</p>
                            <p>MEAN: 82 &nbsp; VAP: [-]</p>
                          </div>
                          <div className="p-2 border-r border-slate-800 text-center font-bold text-xs space-y-1">
                            <p className="uppercase text-[10px] text-slate-600">TOTAL OUT OF</p>
                            <p className="text-sm font-black text-slate-900">589 / 800</p>
                            <p className="text-xs text-slate-700">Points: 82 of 96</p>
                          </div>
                          <div className="p-2 text-[10px] font-mono space-y-0.5">
                            <p>X - MISSING SCORE</p>
                            <p>Y - IRREGULARITY</p>
                            <p>Z - NOT GRADED</p>
                          </div>
                        </div>

                        {/* 5. SUMMARY METRICS ROW */}
                        <div className="overflow-x-auto border-2 border-slate-800 text-center">
                          <table className="w-full text-xs font-bold">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-800 text-[10px] uppercase">
                                <th className="py-1.5 px-2 border-r border-slate-400">TOTAL SCORE</th>
                                <th className="py-1.5 px-2 border-r border-slate-400">AVERAGE POINTS</th>
                                <th className="py-1.5 px-2 border-r border-slate-400">IMPR. (+/-)</th>
                                <th className="py-1.5 px-2 border-r border-slate-400">TOTAL POINTS</th>
                                <th className="py-1.5 px-2 border-r border-slate-400">MEAN MARK</th>
                                <th className="py-1.5 px-2 border-r border-slate-400">MEAN GRADE</th>
                                <th className="py-1.5 px-2 border-r border-slate-400">STREAM POS</th>
                                <th className="py-1.5 px-2 border-r border-slate-400">OVERALL POS</th>
                                <th className="py-1.5 px-2">DAYS ABSENT</th>
                              </tr>
                            </thead>
                            <tbody className="font-mono text-slate-900">
                              <tr>
                                <td className="py-2 px-2 border-r border-slate-300">589</td>
                                <td className="py-2 px-2 border-r border-slate-300">10.25</td>
                                <td className="py-2 px-2 border-r border-slate-300">/</td>
                                <td className="py-2 px-2 border-r border-slate-300">82 of 96</td>
                                <td className="py-2 px-2 border-r border-slate-300">73.6</td>
                                <td className="py-2 px-2 font-black text-indigo-700 border-r border-slate-300">B+</td>
                                <td className="py-2 px-2 border-r border-slate-300">2 / 5</td>
                                <td className="py-2 px-2 border-r border-slate-300">7 / 20</td>
                                <td className="py-2 px-2">0</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* 6. BOTTOM SPLIT: GRAPH & TEACHER'S REMARKS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {/* Left Column: Visual Performance Graph */}
                          <div className="p-3 border-2 border-slate-800 rounded space-y-2">
                            <p className="font-bold text-[10px] uppercase text-slate-700">Performance Trend Curve</p>
                            <div className="h-40 w-full">
                              <svg className="w-full h-full" viewBox="0 0 300 120">
                                <line x1="30" y1="20" x2="30" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                                <line x1="30" y1="100" x2="280" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                                <path d="M 40,65 L 110,60 L 190,58 L 260,30" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                                <circle cx="40" cy="65" r="4" fill="#2563eb" />
                                <circle cx="110" cy="60" r="4" fill="#2563eb" />
                                <circle cx="190" cy="58" r="4" fill="#2563eb" />
                                <circle cx="260" cy="30" r="4" fill="#2563eb" />
                                <text x="40" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Term 1</text>
                                <text x="110" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Term 2</text>
                                <text x="190" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Term 3</text>
                                <text x="260" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Final</text>
                              </svg>
                            </div>
                          </div>

                          {/* Right Column: Teacher & Senior Master Remarks */}
                          <div className="p-3 border-2 border-slate-800 rounded space-y-3 text-xs">
                            <div>
                              <p className="font-extrabold uppercase text-[10px] text-slate-800 mb-1">CLASS TEACHER&apos;S REMARKS</p>
                              <p className="font-semibold text-slate-900 border-b border-slate-400 pb-1">Anna is an excelent student.</p>
                              <div className="flex justify-between pt-1.5 text-[10px]">
                                <span>SIGN: ____________________</span>
                                <span>DATE: ____________</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-300">
                              <p className="font-extrabold uppercase text-[10px] text-slate-800 mb-1">SENIOR MASTER REMARKS</p>
                              <p className="font-semibold text-slate-900 border-b border-slate-400 pb-1">Anna is good.</p>
                              <div className="flex justify-between pt-1.5 text-[10px]">
                                <span>SIGN: ____________________</span>
                                <span>DATE: ____________</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 7. DIRECTOR/PRINCIPAL REMARKS */}
                        <div className="p-3 border-2 border-slate-800 rounded space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold uppercase text-[10px] text-slate-800">REMARKS BY DIRECTOR/PRINCIPAL:</span>
                            <span className="font-bold text-slate-900">Anna is excelent.</span>
                          </div>
                          <div className="flex justify-between pt-1 text-[10px]">
                            <span>SIGN: ____________________</span>
                            <span>DATE: ____________</span>
                          </div>
                        </div>

                        {/* 8. PARENT ACKNOWLEDGEMENT & NEXT TERM DATES */}
                        <div className="p-3 border-2 border-slate-800 rounded space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b border-slate-300 pb-1.5">
                            <span className="font-extrabold uppercase text-[10px] text-slate-800">REPORT SEEN BY (PARENT/GUARDIAN):</span>
                            <span className="text-[10px]">SIGN: ____________________ &bull; DATE: ____________</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-800 pt-0.5">
                            <span>NEXT TERM RUNS FROM: 01-December-2024</span>
                            <span>TO: 28-February-2025</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Comprehensive Examination & Timetable Module */}
            {activeTab === 'timetable' && (
              <div className="space-y-6 animate-fade-in">
                {/* Examination Header & Sub-Navigation Banner */}
                <div className="glass-card p-6 sm:p-8 border border-rose-500/20 bg-rose-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-extrabold tracking-wider uppercase border border-rose-500/30">
                          Examination Management Hub
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20">
                          Midterm Examination Seat Desk: #24
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--text-primary))] tracking-tight">
                        Examinations, Results &amp; Historical Archives
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 max-w-2xl">
                        Access upcoming exam dockets, room seat allocations, official instructions, grade distributions, and archived multi-year term transcripts.
                      </p>
                    </div>

                    {/* Quick Docket Download */}
                    <button
                      onClick={() => handleAction('Download Examination Slip Docket')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all self-start lg:self-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Exam Docket Slip</span>
                    </button>
                  </div>

                  {/* Examination & Timetable Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'timetable', label: '📅 Interactive Timetable & Schedule' },
                      { id: 'upcoming', label: '📝 Upcoming Exams & Seat Dockets' },
                      { id: 'results', label: '📊 Exam Results & Grade Analysis' },
                      { id: 'history', label: '📜 Exam History & Multi-Year Archives' }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setExamSubTab(sub.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          examSubTab === sub.id
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Section 0: Interactive Timetable */}
                {examSubTab === 'timetable' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Control Bar: View Toggle (Daily vs Weekly) & Export Actions */}
                    <div className="glass-card p-5 border border-[hsl(var(--border))] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mr-1">View Mode:</span>
                        <button
                          onClick={() => setTimetableMode('weekly')}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            timetableMode === 'weekly'
                              ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                              : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                          }`}
                        >
                          Weekly View
                        </button>
                        <button
                          onClick={() => setTimetableMode('daily')}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            timetableMode === 'daily'
                              ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                              : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                          }`}
                        >
                          Daily View
                        </button>
                      </div>

                      {/* Print & Download PDF Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrintTimetable}
                          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Print Timetable
                        </button>
                        <button
                          onClick={() => handleAction('Download Timetable PDF')}
                          className="px-4 py-2 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold text-xs hover:bg-[hsl(var(--border))] flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </button>
                      </div>
                    </div>

                    {/* DAILY VIEW MODE */}
                    {timetableMode === 'daily' && (
                      <div className="space-y-5 animate-fade-in">
                        {/* Day Selector Pills */}
                        <div className="flex flex-wrap gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <button
                              key={day}
                              onClick={() => setSelectedDay(day as any)}
                              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                                selectedDay === day
                                  ? 'bg-amber-500 text-white shadow-md'
                                  : 'bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>

                        {/* Schedule List for Selected Day */}
                        <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                          <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" /> Schedule for {selectedDay}
                          </h3>

                          <div className="space-y-3">
                            {[
                              { period: 'Period 1 (08:00 AM - 08:45 AM)', subject: 'Mathematics (MATH-101)', teacher: 'Mr. Kwame Darko', room: 'Room 104', color: 'border-emerald-500/30 bg-emerald-500/5' },
                              { period: 'Period 2 (08:45 AM - 09:30 AM)', subject: 'Mathematics (MATH-101)', teacher: 'Mr. Kwame Darko', room: 'Room 104', color: 'border-emerald-500/30 bg-emerald-500/5' },
                              { period: 'Morning Break (09:30 AM - 09:45 AM)', subject: '☕ Refreshment & Rest Break', teacher: 'School Grounds', room: 'Cafeteria', isBreak: true },
                              { period: 'Period 3 (09:45 AM - 10:30 AM)', subject: 'Organic Chemistry (CHEM-202)', teacher: 'Mrs. Beatrice Mensah', room: 'Lab B', color: 'border-blue-500/30 bg-blue-500/5' },
                              { period: 'Period 4 (10:30 AM - 11:15 AM)', subject: 'English Literature (ENG-301)', teacher: 'Dr. Stella Gbandi', room: 'Lecture Hall 1', color: 'border-purple-500/30 bg-purple-500/5' },
                              { period: 'Period 5 (11:15 AM - 12:00 PM)', subject: 'History & Civics (HIST-201)', teacher: 'Mr. David Thorpe', room: 'Room 202', color: 'border-amber-500/30 bg-amber-500/5' },
                              { period: 'Lunch Break (12:00 PM - 12:45 PM)', subject: '🍱 Midday Dining & Recreation', teacher: 'Dining Hall', room: 'Main Quad', isBreak: true },
                              { period: 'Period 6 (12:45 PM - 01:30 PM)', subject: 'Modern Physics (PHYS-201)', teacher: 'Prof. Emmanuel Thorpe', room: 'Physics Lab A', color: 'border-rose-500/30 bg-rose-500/5' },
                              { period: 'Period 7 (01:30 PM - 02:15 PM)', subject: 'Biology (BIO-105)', teacher: 'Dr. Sarah Jenkins', room: 'Bio Studio 3', color: 'border-teal-500/30 bg-teal-500/5' },
                              { period: 'Period 8 (02:15 PM - 03:00 PM)', subject: 'Physical Education & Sports', teacher: 'Coach Randy Vane', room: 'Sports Field', color: 'border-orange-500/30 bg-orange-500/5' }
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl border ${
                                  item.isBreak
                                    ? 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                                    : `${item.color} text-[hsl(var(--text-primary))]`
                                } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                              >
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-[hsl(var(--text-tertiary))] uppercase block">
                                    {item.period}
                                  </span>
                                  <h4 className="text-sm font-extrabold mt-0.5">{item.subject}</h4>
                                </div>
                                {!item.isBreak && (
                                  <div className="text-right text-xs font-semibold text-[hsl(var(--text-secondary))]">
                                    <p>👨‍🏫 {item.teacher}</p>
                                    <p className="text-[11px] font-mono text-[hsl(var(--text-tertiary))]">🏛️ {item.room}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WEEKLY VIEW MODE (FULL 5-DAY GRID TABLE) */}
                    {timetableMode === 'weekly' && (
                      <div id="interactive-timetable-container" className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg overflow-x-auto">
                        <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--border))]">
                          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Weekly Schedule Grid (Monday — Friday)</h3>
                          <span className="text-xs text-[hsl(var(--text-tertiary))] font-mono">Academic Term: 2026/2027</span>
                        </div>

                        <table className="w-full text-center text-xs border-collapse font-sans min-w-[700px]">
                          <thead>
                            <tr className="bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))] uppercase font-bold text-[11px] text-[hsl(var(--text-primary))]">
                              <th className="py-3 px-3 text-left w-32 border-r border-[hsl(var(--border))]">Period / Time</th>
                              <th className="py-3 px-2 border-r border-[hsl(var(--border))]">Monday</th>
                              <th className="py-3 px-2 border-r border-[hsl(var(--border))]">Tuesday</th>
                              <th className="py-3 px-2 border-r border-[hsl(var(--border))]">Wednesday</th>
                              <th className="py-3 px-2 border-r border-[hsl(var(--border))]">Thursday</th>
                              <th className="py-3 px-2">Friday</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[hsl(var(--border)/0.5)] font-mono text-[11px]">
                            {[
                              {
                                period: 'P1 (08:00 - 08:45)',
                                mon: { sub: 'MATH-101', teacher: 'Mr. Darko', room: 'R 104' },
                                tue: { sub: 'CHEM-202', teacher: 'Mrs. Mensah', room: 'Lab B' },
                                wed: { sub: 'ENG-301', teacher: 'Dr. Gbandi', room: 'Hall 1' },
                                thu: { sub: 'PHYS-201', teacher: 'Prof. Thorpe', room: 'Physics A' },
                                fri: { sub: 'MATH-101', teacher: 'Mr. Darko', room: 'R 104' }
                              },
                              {
                                period: 'P2 (08:45 - 09:30)',
                                mon: { sub: 'MATH-101', teacher: 'Mr. Darko', room: 'R 104' },
                                tue: { sub: 'CHEM-202', teacher: 'Mrs. Mensah', room: 'Lab B' },
                                wed: { sub: 'BIO-105', teacher: 'Dr. Jenkins', room: 'Studio 3' },
                                thu: { sub: 'PHYS-201', teacher: 'Prof. Thorpe', room: 'Physics A' },
                                fri: { sub: 'ENG-301', teacher: 'Dr. Gbandi', room: 'Hall 1' }
                              },
                              {
                                period: '☕ BREAK (09:30 - 09:45)',
                                isBreak: true
                              },
                              {
                                period: 'P3 (09:45 - 10:30)',
                                mon: { sub: 'CHEM-202', teacher: 'Mrs. Mensah', room: 'Lab B' },
                                tue: { sub: 'MATH-101', teacher: 'Mr. Darko', room: 'R 104' },
                                wed: { sub: 'PHYS-201', teacher: 'Prof. Thorpe', room: 'Physics A' },
                                thu: { sub: 'GER-102', teacher: 'Frau Schmidt', room: 'Lang Lab 2' },
                                fri: { sub: 'BIO-105', teacher: 'Dr. Jenkins', room: 'Studio 3' }
                              },
                              {
                                period: 'P4 (10:30 - 11:15)',
                                mon: { sub: 'ENG-301', teacher: 'Dr. Gbandi', room: 'Hall 1' },
                                tue: { sub: 'PHYS-201', teacher: 'Prof. Thorpe', room: 'Physics A' },
                                wed: { sub: 'MATH-101', teacher: 'Mr. Darko', room: 'R 104' },
                                thu: { sub: 'CHEM-202', teacher: 'Mrs. Mensah', room: 'Lab B' },
                                fri: { sub: 'BIO Lab', teacher: 'Dr. Jenkins', room: 'Studio 3' }
                              },
                              {
                                period: 'P5 (11:15 - 12:00)',
                                mon: { sub: 'HIST-201', teacher: 'Mr. Thorpe', room: 'R 202' },
                                tue: { sub: 'ENG-301', teacher: 'Dr. Gbandi', room: 'Hall 1' },
                                wed: { sub: 'MATH-101', teacher: 'Mr. Darko', room: 'R 104' },
                                thu: { sub: 'BIO-105', teacher: 'Dr. Jenkins', room: 'Studio 3' },
                                fri: { sub: 'CS-204', teacher: 'Eng. Vance', room: 'IT Lab 4' }
                              },
                              {
                                period: '🍱 LUNCH (12:00 - 12:45)',
                                isBreak: true
                              },
                              {
                                period: 'P6 (12:45 - 01:30)',
                                mon: { sub: 'PHYS-201', teacher: 'Prof. Thorpe', room: 'Physics A' },
                                tue: { sub: 'GER-102', teacher: 'Frau Schmidt', room: 'Lang Lab 2' },
                                wed: { sub: 'CHEM-202', teacher: 'Mrs. Mensah', room: 'Lab B' },
                                thu: { sub: 'MATH-101', teacher: 'Mr. Darko', room: 'R 104' },
                                fri: { sub: 'GER-102', teacher: 'Frau Schmidt', room: 'Lang Lab 2' }
                              },
                              {
                                period: 'P7 (01:30 - 02:15)',
                                mon: { sub: 'BIO-105', teacher: 'Dr. Jenkins', room: 'Studio 3' },
                                tue: { sub: 'CS-204', teacher: 'Eng. Vance', room: 'IT Lab 4' },
                                wed: { sub: 'HIST-201', teacher: 'Mr. Thorpe', room: 'R 202' },
                                thu: { sub: 'ENG-301', teacher: 'Dr. Gbandi', room: 'Hall 1' },
                                fri: { sub: 'Homeroom', teacher: 'Mr. Darko', room: 'R 104' }
                              },
                              {
                                period: 'P8 (02:15 - 03:00)',
                                mon: { sub: 'P.E. Sports', teacher: 'Coach Vane', room: 'Complex' },
                                tue: { sub: 'Library', teacher: 'Mrs. Cole', room: 'Library' },
                                wed: { sub: 'STEM Club', teacher: 'Eng. Vance', room: 'Makerspace' },
                                thu: { sub: 'Art Studio', teacher: 'Ms. Lin', room: 'Art Studio 2' },
                                fri: { sub: 'Assembly', teacher: 'Principal', room: 'Auditorium' }
                              }
                            ].map((row, idx) => {
                              if (row.isBreak) {
                                return (
                                  <tr key={idx} className="bg-amber-500/10 text-amber-300 font-bold text-center">
                                    <td className="py-2 px-3 text-left border-r border-[hsl(var(--border))] font-semibold">{row.period}</td>
                                    <td colSpan={5} className="py-2 px-2 uppercase tracking-wider text-[10px]">
                                      {row.period}
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={idx} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-primary))]">
                                  <td className="py-2.5 px-3 text-left font-bold border-r border-[hsl(var(--border))] text-[10px] text-[hsl(var(--text-tertiary))]">
                                    {row.period}
                                  </td>
                                  {[row.mon, row.tue, row.wed, row.thu, row.fri].map((cell: any, cIdx) => (
                                    <td key={cIdx} className="py-2 px-2 border-r border-[hsl(var(--border)/0.5)] last:border-none">
                                      <p className="font-extrabold text-[11px] text-[hsl(var(--text-primary))]">{cell.sub}</p>
                                      <p className="text-[9px] text-[hsl(var(--text-secondary))]">{cell.teacher}</p>
                                      <p className="text-[9px] text-amber-400 font-bold">{cell.room}</p>
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                {examSubTab === 'upcoming' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Upcoming Exam Dockets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          code: 'MATH-101',
                          subject: 'Mathematics (Algebra & Calculus)',
                          date: 'Friday, July 10, 2026',
                          time: '09:00 AM — 11:30 AM (2.5 Hours)',
                          hall: 'Main Lecture Hall 1',
                          seat: 'Seat #24',
                          invigilator: 'Mr. Kwame Darko',
                          urgency: 'Starts in 3 Days',
                          color: 'border-rose-500/30 bg-rose-500/5'
                        },
                        {
                          code: 'CHEM-202',
                          subject: 'Organic Chemistry Reactions',
                          date: 'Monday, July 13, 2026',
                          time: '11:00 AM — 01:00 PM (2.0 Hours)',
                          hall: 'Chemistry Lab B',
                          seat: 'Seat #18',
                          invigilator: 'Mrs. Beatrice Mensah',
                          urgency: 'Upcoming',
                          color: 'border-blue-500/30 bg-blue-500/5'
                        },
                        {
                          code: 'ENG-301',
                          subject: 'English Literature & Composition',
                          date: 'Wednesday, July 15, 2026',
                          time: '08:30 AM — 10:30 AM (2.0 Hours)',
                          hall: 'Main Auditorium',
                          seat: 'Seat #42',
                          invigilator: 'Dr. Stella Gbandi',
                          urgency: 'Upcoming',
                          color: 'border-purple-500/30 bg-purple-500/5'
                        }
                      ].map((exam, index) => (
                        <div key={index} className={`glass-card p-6 border ${exam.color} rounded-3xl space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-md`}>
                          <div className="flex justify-between items-start">
                            <span className="px-2.5 py-1 rounded-md bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[10px] font-extrabold">
                              {exam.code}
                            </span>
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                              {exam.urgency}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))]">{exam.subject}</h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{exam.date}</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border)/0.5)] space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-[hsl(var(--text-tertiary))]">Time &amp; Duration:</span>
                              <span className="font-bold text-[hsl(var(--text-primary))]">{exam.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[hsl(var(--text-tertiary))]">Hall / Venue:</span>
                              <span className="font-bold text-[hsl(var(--text-primary))]">{exam.hall}</span>
                            </div>
                            <div className="flex justify-between text-rose-400 font-bold">
                              <span>Seat Docket No:</span>
                              <span>{exam.seat}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Official Examination Regulations & Instructions Box */}
                    <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-4 shadow-lg">
                      <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" /> Official Examination Rules &amp; Regulations
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[hsl(var(--text-secondary))]">
                        <div className="p-4 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                          <p className="font-bold text-[hsl(var(--text-primary))]">1. Mandatory Student Identification</p>
                          <p className="text-[11px]">Candidates must display their official RFID Student Identification Card on the upper right corner of their assigned exam desk throughout the examination period.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                          <p className="font-bold text-[hsl(var(--text-primary))]">2. Hall Entry &amp; Gate Punctuality</p>
                          <p className="text-[11px]">Candidates must arrive 20 minutes prior to exam start time. Late entry is strictly prohibited 30 minutes after commencement.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                          <p className="font-bold text-[hsl(var(--text-primary))]">3. Approved Equipment</p>
                          <p className="text-[11px]">Non-programmable scientific calculators (Casio FX-991ES series) permitted for Mathematics and Physics papers only. Blue or black ballpoint pens required.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                          <p className="font-bold text-[hsl(var(--text-primary))]">4. Prohibited Electronic Devices</p>
                          <p className="text-[11px]">Smartwatches, mobile phones, headphones, bags, and unauthorized papers are strictly banned inside examination venues.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Section 2: Exam Results, Position & Grade Analysis */}
                {examSubTab === 'results' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Overall Score KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="glass-card p-5 border border-rose-500/20 bg-rose-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Overall Aggregate Score</span>
                        <p className="text-2xl font-black text-rose-400">346 / 400</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">86.5% Overall Average</p>
                      </div>

                      <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Class Stream Position</span>
                        <p className="text-2xl font-black text-emerald-400">#3 / 42</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Ranked Top 7% in Grade 10</p>
                      </div>

                      <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Grade Point Average</span>
                        <p className="text-2xl font-black text-purple-400">3.82 GPA</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">First Class Distinction</p>
                      </div>

                      <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5 rounded-3xl">
                        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-1">Grade Analysis</span>
                        <p className="text-2xl font-black text-blue-400">3 A &bull; 1 B+</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Zero Subject Fails</p>
                      </div>
                    </div>

                    {/* Performance Trends SVG Line Chart */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Multi-Term Examination Performance Trend</h3>
                          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Historical examination score curve across senior secondary terms.</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          +5.5% Score Growth
                        </span>
                      </div>

                      {/* SVG Line Chart */}
                      <div className="h-44 w-full pt-4">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                          <defs>
                            <linearGradient id="gradExamTrend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M 50,85 Q 200,65 350,35 T 450,20 L 450,110 L 50,110 Z" fill="url(#gradExamTrend)" />
                          <path d="M 50,85 Q 200,65 350,35 T 450,20" fill="none" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
                          <circle cx="50" cy="85" r="5" fill="#f43f5e" />
                          <circle cx="250" cy="55" r="5" fill="#f43f5e" />
                          <circle cx="450" cy="20" r="5" fill="#f43f5e" />
                          <text x="50" y="105" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">2025 SS1 Term 3 (81%)</text>
                          <text x="250" y="105" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">2026 SS2 Term 1 (84%)</text>
                          <text x="450" y="105" fill="currentColor" fontSize="10" textAnchor="middle" className="text-[hsl(var(--text-tertiary))]">2026 SS2 Term 2 (86.5%)</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Section 3: Exam History (Previous Terms & Previous Years) */}
                {examSubTab === 'history' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Archived Multi-Year Examination Results</h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">View past academic term scorecards and national examination certificates.</p>

                      <div className="space-y-4 pt-2">
                        {[
                          { year: '2025/2026 Academic Year', level: 'Senior Secondary 1 (SS1)', term: 'Term 3 Final Exam', aggregate: '336 / 400 (84.0%)', rank: '#4 / 44 Students', gpa: '3.75 GPA' },
                          { year: '2025/2026 Academic Year', level: 'Senior Secondary 1 (SS1)', term: 'Term 2 Midterm Exam', aggregate: '324 / 400 (81.0%)', rank: '#5 / 44 Students', gpa: '3.62 GPA' },
                          { year: '2024/2025 Academic Year', level: 'Junior Secondary 3 (JS3)', term: 'JSCE National Exam Certificate', aggregate: '9 Distinctions (A)', rank: 'Top Honors', gpa: '4.00 GPA' }
                        ].map((item, index) => (
                          <div key={index} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[10px] font-extrabold">
                                  {item.year}
                                </span>
                                <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold">{item.level}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] mt-1">{item.term}</h4>
                              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                                Aggregate: <strong>{item.aggregate}</strong> &bull; Class Rank: <strong>{item.rank}</strong> &bull; GPA: <strong>{item.gpa}</strong>
                              </p>
                            </div>

                            <button
                              onClick={() => handleAction(`Download Archive ${item.term}`)}
                              className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold text-xs hover:bg-[hsl(var(--border))] transition-all flex items-center gap-2 self-start sm:self-center"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Result Slip
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4.5: Academic Calendar Hub */}
            {activeTab === 'calendar' && (
              <div className="space-y-6 animate-fade-in">
                {/* Calendar Banner & Category Filters */}
                <div className="glass-card p-6 sm:p-8 border border-blue-500/20 bg-blue-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-extrabold tracking-wider uppercase border border-blue-500/30">
                        Official Academic Calendar &amp; Schedule
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        School Term Schedule &amp; Key Events
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Track upcoming holidays, examinations, assignment deadlines, school events, PTA meetings, and sports competitions.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={() => setCalendarViewMode('agenda')}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                          calendarViewMode === 'agenda' ? 'bg-[hsl(var(--accent))] text-white shadow-md' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'
                        }`}
                      >
                        Agenda View
                      </button>
                      <button
                        onClick={() => setCalendarViewMode('month')}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                          calendarViewMode === 'month' ? 'bg-[hsl(var(--accent))] text-white shadow-md' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'
                        }`}
                      >
                        Monthly Grid
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'all', label: 'All Events' },
                      { id: 'holidays', label: '🌴 Holidays & Breaks' },
                      { id: 'exams', label: '📝 Examinations' },
                      { id: 'deadlines', label: '⏳ Assignment Deadlines' },
                      { id: 'events', label: '🎉 School Events' },
                      { id: 'pta', label: '👨‍👩‍👧 PTA Meetings' },
                      { id: 'sports', label: '🏆 Sports Events' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCalendarCategory(cat.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          calendarCategory === cat.id
                            ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MONTHLY GRID VIEW */}
                {calendarViewMode === 'month' && (
                  <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg animate-fade-in">
                    <div className="flex justify-between items-center font-bold text-sm text-[hsl(var(--text-primary))]">
                      <h3>July 2026 Academic Calendar</h3>
                      <span className="text-xs font-mono text-[hsl(var(--accent))]">Term 2 Schedule</span>
                    </div>

                    {/* 7-Day Header */}
                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))] py-2 border-b border-[hsl(var(--border))]">
                      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>

                    {/* 31-Day Month Matrix */}
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 31 }, (_, i) => {
                        const dayNum = i + 1;
                        let hasHoliday = dayNum === 4 || dayNum === 16 || dayNum === 17 || dayNum === 31;
                        let hasExam = dayNum === 10 || dayNum === 13 || dayNum === 15;
                        let hasDeadline = dayNum === 10 || dayNum === 13;
                        let hasEvent = dayNum === 22 || dayNum === 28;
                        let hasPta = dayNum === 18 || dayNum === 29;
                        let hasSports = dayNum === 24 || dayNum === 27;

                        return (
                          <div key={dayNum} className="min-h-[70px] p-2 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--bg-secondary))] flex flex-col justify-between hover:border-[hsl(var(--accent))] transition-all">
                            <span className="font-bold text-xs text-[hsl(var(--text-primary))]">{dayNum}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {hasHoliday && <span className="w-2 h-2 rounded-full bg-teal-400" title="Holiday" />}
                              {hasExam && <span className="w-2 h-2 rounded-full bg-rose-500" title="Exam" />}
                              {hasDeadline && <span className="w-2 h-2 rounded-full bg-amber-400" title="Assignment Deadline" />}
                              {hasEvent && <span className="w-2 h-2 rounded-full bg-purple-400" title="School Event" />}
                              {hasPta && <span className="w-2 h-2 rounded-full bg-blue-400" title="PTA Meeting" />}
                              {hasSports && <span className="w-2 h-2 rounded-full bg-orange-400" title="Sports Event" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AGENDA LIST VIEW */}
                {calendarViewMode === 'agenda' && (
                  <div className="space-y-4 animate-fade-in">
                    {[
                      { id: '1', date: 'Friday, July 04, 2026', title: 'Independence Public Holiday', venue: 'National Holiday (School Closed)', cat: 'holidays', badge: '🌴 Holiday', color: 'border-teal-500/30 bg-teal-500/5 text-teal-400' },
                      { id: '2', date: 'Friday, July 10, 2026 • 09:00 AM', title: 'Mathematics (MATH-101) Midterm Exam', venue: 'Main Lecture Hall 1', cat: 'exams', badge: '📝 Exam', color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' },
                      { id: '3', date: 'Friday, July 10, 2026 • 11:59 PM', title: 'Polynomial Derivatives Homework Deadline', venue: 'Online Portal', cat: 'deadlines', badge: '⏳ Deadline', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
                      { id: '4', date: 'Monday, July 13, 2026 • 11:00 AM', title: 'Organic Chemistry (CHEM-202) Lab Practical Exam', venue: 'Chemistry Lab B', cat: 'exams', badge: '📝 Exam', color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' },
                      { id: '5', date: 'Monday, July 13, 2026 • 05:00 PM', title: 'Chemistry Reaction Essay Submission Deadline', venue: 'Online Portal', cat: 'deadlines', badge: '⏳ Deadline', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
                      { id: '6', date: 'Wednesday, July 15, 2026 • 08:30 AM', title: 'English Literature (ENG-301) Paper 1 Exam', venue: 'Main Auditorium', cat: 'exams', badge: '📝 Exam', color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' },
                      { id: '7', date: 'Thursday, July 16 — Friday, July 17, 2026', title: 'Term 2 Mid-Term Holiday Break', venue: 'School Closed', cat: 'holidays', badge: '🌴 Holiday', color: 'border-teal-500/30 bg-teal-500/5 text-teal-400' },
                      { id: '8', date: 'Saturday, July 18, 2026 • 10:00 AM', title: 'Q3 General Parent-Teacher Association (PTA) Meeting', venue: 'Main Assembly Hall', cat: 'pta', badge: '👨‍👩‍👧 PTA Meeting', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
                      { id: '9', date: 'Wednesday, July 22, 2026 • 10:00 AM', title: 'Annual Science & STEM Innovation Fair', venue: 'Makerspace & Science Wing', cat: 'events', badge: '🎉 School Event', color: 'border-purple-500/30 bg-purple-500/5 text-purple-400' },
                      { id: '10', date: 'Friday, July 24, 2026 • 09:00 AM', title: 'Annual Inter-House Sports Championship Finals', venue: 'Olympic Sports Complex', cat: 'sports', badge: '🏆 Sports Event', color: 'border-orange-500/30 bg-orange-500/5 text-orange-400' },
                      { id: '11', date: 'Monday, July 27, 2026 • 03:30 PM', title: 'Regional Interschool Football Derby Championship', venue: 'Main Sports Field', cat: 'sports', badge: '🏆 Sports Event', color: 'border-orange-500/30 bg-orange-500/5 text-orange-400' },
                      { id: '12', date: 'Tuesday, July 28, 2026 • 02:00 PM', title: 'Cultural Heritage & Drama Arts Festival', venue: 'School Amphitheatre', cat: 'events', badge: '🎉 School Event', color: 'border-purple-500/30 bg-purple-500/5 text-purple-400' },
                      { id: '13', date: 'Wednesday, July 29, 2026 • 01:00 PM', title: 'Academic Progress Consultation (Parent-Teacher)', venue: 'Staff Common Room', cat: 'pta', badge: '👨‍👩‍👧 PTA Meeting', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
                      { id: '14', date: 'Friday, July 31, 2026', title: 'End of Term 2 Vacation Commences', venue: 'School Closed', cat: 'holidays', badge: '🌴 Holiday', color: 'border-teal-500/30 bg-teal-500/5 text-teal-400' }
                    ]
                      .filter(ev => calendarCategory === 'all' || ev.cat === calendarCategory)
                      .map(ev => (
                        <div key={ev.id} className={`glass-card p-5 border ${ev.color} rounded-3xl space-y-3 shadow-md hover:-translate-y-0.5 transition-all`}>
                          <div className="flex justify-between items-start">
                            <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border border-current">
                              {ev.badge}
                            </span>
                            <span className="text-[11px] font-mono text-[hsl(var(--text-secondary))]">{ev.date}</span>
                          </div>

                          <div>
                            <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))]">{ev.title}</h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">📍 Venue: {ev.venue}</p>
                          </div>

                          <div className="flex justify-end pt-2 border-t border-[hsl(var(--border)/0.5)]">
                            <button
                              onClick={() => handleAction(`Add "${ev.title}" to Google Calendar`)}
                              className="px-3.5 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-[11px] font-bold hover:bg-[hsl(var(--border))] transition-all flex items-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5" /> Add to Calendar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Homework & Assignment Center */}
            {activeTab === 'assignments' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Status Filter Bar */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-extrabold tracking-wider uppercase border border-blue-500/20">
                        Student Assignment Center
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Homework, Projects &amp; Submission Desk
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">
                        Track deadlines, upload files, edit submissions, and correspond directly with subject teachers.
                      </p>
                    </div>

                    <span className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs self-start sm:self-center">
                      1 Pending • 1 Submitted • 1 Late • 1 Marked
                    </span>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'all', label: 'All Assignments' },
                      { id: 'pending', label: '⏳ Pending' },
                      { id: 'submitted', label: '📤 Submitted' },
                      { id: 'late', label: '⚠️ Late' },
                      { id: 'marked', label: '✅ Marked / Graded' }
                    ].map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setAssignmentFilter(filter.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          assignmentFilter === filter.id
                            ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignment Workspace Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Assignment Cards List (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
                      Assigned Tasks ({assignmentsData.filter(a => assignmentFilter === 'all' || a.status.toLowerCase() === assignmentFilter).length})
                    </h3>

                    {assignmentsData
                      .filter(a => assignmentFilter === 'all' || a.status.toLowerCase() === assignmentFilter)
                      .map(assignment => {
                        const isSelected = selectedAssignmentId === assignment.id;
                        return (
                          <div
                            key={assignment.id}
                            onClick={() => setSelectedAssignmentId(assignment.id)}
                            className={`glass-card p-5 border rounded-3xl cursor-pointer transition-all duration-300 space-y-3 ${
                              isSelected
                                ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] shadow-lg ring-1 ring-[hsl(var(--accent))]'
                                : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary)/0.4)]'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]">
                                {assignment.subject.split(' ')[0]}
                              </span>
                              
                              {/* Status Badge */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                assignment.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                assignment.status === 'Submitted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                assignment.status === 'Late' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}>
                                {assignment.status === 'Marked' ? assignment.grade : assignment.status}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] leading-snug">{assignment.title}</h4>
                              <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-1">👨‍🏫 {assignment.teacher}</p>
                            </div>

                            <div className="flex justify-between items-center text-[10px] pt-2 border-t border-[hsl(var(--border)/0.6)] font-mono">
                              <span className="text-[hsl(var(--text-secondary))]">⏰ {assignment.dueDate}</span>
                              <span className={`font-bold ${
                                assignment.priority === 'High' || assignment.priority === 'Urgent' ? 'text-rose-400' : 'text-amber-400'
                              }`}>
                                {assignment.priority} Priority
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Right Column: Selected Assignment Submission Desk & Comments (7 Cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    {(() => {
                      const current = assignmentsData.find(a => a.id === selectedAssignmentId) || assignmentsData[0];
                      return (
                        <div className="space-y-6">
                          {/* Assignment Detail & Task Requirements */}
                          <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                            <div className="flex justify-between items-start border-b border-[hsl(var(--border))] pb-3">
                              <div>
                                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block">{current.subject}</span>
                                <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))] mt-0.5">{current.title}</h3>
                              </div>
                              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                                Due: {current.dueDate}
                              </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border)/0.5)] space-y-2 text-xs">
                              <p className="font-bold text-[hsl(var(--text-primary))]">Task Instructions:</p>
                              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">{current.description}</p>
                            </div>

                            {current.status === 'Marked' && current.grade && (
                              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1">
                                <p className="font-extrabold uppercase">Grade Awarded: {current.grade}</p>
                                <p className="text-[11px] text-emerald-300">Your assignment has been graded and verified by {current.teacher}.</p>
                              </div>
                            )}
                          </div>

                          {/* Submission Editor & File Uploader */}
                          <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-5 shadow-lg">
                            <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-[hsl(var(--accent))]" /> Student Online Submission Desk
                            </h4>

                            {submissionSuccess && (
                              <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> {submissionSuccess}
                              </div>
                            )}

                            {/* 1. Upload Files Section */}
                            <div className="space-y-2">
                              <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">
                                Upload Attached Files (.pdf, .docx, .ipynb, .png)
                              </label>

                              {/* File List */}
                              <div className="space-y-2">
                                {current.files.map((file, idx) => (
                                  <div key={idx} className="p-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center text-xs">
                                    <span className="font-mono text-[hsl(var(--text-primary))] font-semibold">📄 {file}</span>
                                    <button
                                      onClick={() => {
                                        setAssignmentsData(prev => prev.map(a => a.id === current.id ? { ...a, files: a.files.filter((_, i) => i !== idx) } : a));
                                      }}
                                      className="text-rose-400 hover:text-rose-300 font-bold text-[11px]"
                                    >
                                      Remove [X]
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Upload Simulator Dropzone Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const mockFile = `Assignment_Submission_v${current.files.length + 1}.pdf (1.8 MB)`;
                                  setAssignmentsData(prev => prev.map(a => a.id === current.id ? { ...a, files: [...a.files, mockFile] } : a));
                                }}
                                className="w-full py-3 border-2 border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-secondary))] font-bold text-xs hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all flex justify-center items-center gap-2"
                              >
                                <Upload className="w-4 h-4" /> Click to Attach Additional File
                              </button>
                            </div>

                            {/* 2. Edit Submission Text Area */}
                            <div className="space-y-2">
                              <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">
                                Written Solution / Text Response / Essay
                              </label>
                              <textarea
                                value={assignmentText}
                                onChange={e => setAssignmentText(e.target.value)}
                                placeholder="Type or edit your homework answer text here..."
                                className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-4 text-xs text-[hsl(var(--text-primary))] h-32 focus:outline-none focus:border-[hsl(var(--accent))]"
                              />
                            </div>

                            {/* Submit / Edit Submission Buttons */}
                            <div className="flex justify-between items-center pt-2 border-t border-[hsl(var(--border))]">
                              <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
                                Current Status: <strong>{current.status}</strong>
                              </span>
                              <button
                                onClick={() => {
                                  setAssignmentsData(prev => prev.map(a => a.id === current.id ? { ...a, status: 'Submitted', textSubmission: assignmentText } : a));
                                  setSubmissionSuccess(`Successfully submitted "${current.title}" to ${current.teacher}!`);
                                  setTimeout(() => setSubmissionSuccess(null), 4000);
                                }}
                                className="px-6 py-2.5 bg-[hsl(var(--accent))] text-white rounded-2xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
                              >
                                <Send className="w-3.5 h-3.5" /> Save &amp; Submit Assignment
                              </button>
                            </div>
                          </div>

                          {/* 3. Leave Comments & Correspondence Thread */}
                          <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                            <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                              💬 Private Comments with Teacher ({current.comments.length})
                            </h4>

                            {/* Comments List */}
                            <div className="space-y-3">
                              {current.comments.map((comment, idx) => (
                                <div key={idx} className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1 text-xs">
                                  <div className="flex justify-between items-center font-bold">
                                    <span className="text-[hsl(var(--accent))]">{comment.sender}</span>
                                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{comment.date}</span>
                                  </div>
                                  <p className="text-[hsl(var(--text-primary))]">{comment.text}</p>
                                </div>
                              ))}
                            </div>

                            {/* Post Comment Input */}
                            <div className="flex gap-2 pt-2">
                              <input
                                type="text"
                                value={newCommentInput}
                                onChange={e => setNewCommentInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddComment(current.id)}
                                placeholder="Write a note or ask a question to your teacher..."
                                className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                              />
                              <button
                                onClick={() => handleAddComment(current.id)}
                                className="px-5 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold text-xs rounded-xl hover:bg-[hsl(var(--border))] transition-all"
                              >
                                Post Note
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Mini LMS Learning Portal */}
            {activeTab === 'lms' && (
              <div className="space-y-6 animate-fade-in">
                {/* LMS Header Banner & Course Switcher */}
                <div className="glass-card p-6 sm:p-8 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-extrabold tracking-wider uppercase border border-purple-500/30">
                        Mini LMS Learning Portal
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Courses, Video Lectures &amp; Self-Assessments
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Access course materials, watch recorded class sessions, take practice quizzes, and engage in academic discussion boards.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-2xl border border-purple-500/20">
                        4 Enrolled Courses
                      </span>
                    </div>
                  </div>

                  {/* LMS Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'materials', label: '📚 Course Materials & Downloads' },
                      { id: 'videos', label: '🎥 Video Lectures & Recorded Classes' },
                      { id: 'quizzes', label: '🧠 Quizzes & Practice Tests' },
                      { id: 'discussions', label: '💬 Discussion Boards & Forum' }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setLmsSubTab(sub.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          lmsSubTab === sub.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUB-SECTION 1: COURSE MATERIALS & DOWNLOADS */}
                {lmsSubTab === 'materials' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Course Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'MATH-101', name: 'Mathematics (MATH-101)' },
                        { id: 'CHEM-202', name: 'Organic Chemistry (CHEM-202)' },
                        { id: 'ENG-301', name: 'English Literature (ENG-301)' },
                        { id: 'PHYS-201', name: 'Modern Physics (PHYS-201)' }
                      ].map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedLmsCourse(c.id)}
                          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                            selectedLmsCourse === c.id
                              ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                              : 'bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>

                    {/* Downloadable Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: `${selectedLmsCourse} Full Textbook PDF`, type: 'Core Textbook', size: '14.5 MB', format: 'PDF Document', downloads: 142 },
                        { title: `${selectedLmsCourse} Formula & Concept Cheat Sheet`, type: 'Study Guide', size: '2.1 MB', format: 'PDF Reference', downloads: 289 },
                        { title: `${selectedLmsCourse} Lecture 1-8 Slide Decks`, type: 'Presentation Slides', size: '8.4 MB', format: 'PPTX Deck', downloads: 198 }
                      ].map((item, idx) => (
                        <div key={idx} className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 hover:-translate-y-1 transition-all shadow-md">
                          <div className="flex justify-between items-start">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                              {item.type}
                            </span>
                            <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{item.size}</span>
                          </div>

                          <div>
                            <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] leading-snug">{item.title}</h3>
                            <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-1">{item.format} &bull; {item.downloads} Downloads</p>
                          </div>

                          <button
                            onClick={() => handleAction(`Download ${item.title}`)}
                            className="w-full py-2.5 rounded-2xl bg-[hsl(var(--accent))] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> Download File
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 2: VIDEO LECTURES & RECORDED CLASSES */}
                {lmsSubTab === 'videos' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Video Player Box (7 Cols) */}
                      <div className="lg:col-span-7 glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Simulated Play Icon */}
                          <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center text-2xl font-bold shadow-2xl group-hover:scale-110 transition-all z-10">
                            ▶
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 text-white z-10 flex justify-between items-end">
                            <div>
                              <span className="px-2 py-0.5 rounded bg-rose-600 text-[9px] font-extrabold uppercase tracking-wider">
                                RECORDED LESSON • HD 1080p
                              </span>
                              <h4 className="text-sm font-extrabold mt-1">Lecture 4: Polynomial Derivatives &amp; Chain Rule</h4>
                              <p className="text-[11px] text-slate-300">Instructor: Mr. Kwame Darko &bull; Duration: 45:20</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-[hsl(var(--border))]">
                          <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Recorded on July 08, 2026</span>
                          <button
                            onClick={() => handleAction('Download Video Transcript PDF')}
                            className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Lesson Notes PDF
                          </button>
                        </div>
                      </div>

                      {/* Lesson Playlist (5 Cols) */}
                      <div className="lg:col-span-5 glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                        <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" /> Lesson Playlist (MATH-101)
                        </h3>

                        <div className="space-y-3">
                          {[
                            { title: 'Lecture 1: Introduction to Functions & Limits', duration: '38:15', status: 'Completed', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
                            { title: 'Lecture 2: Differentiation First Principles', duration: '42:10', status: 'Completed', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
                            { title: 'Lecture 3: Product & Quotient Rule Applications', duration: '51:00', status: 'Completed', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
                            { title: 'Lecture 4: Polynomial Derivatives & Chain Rule', duration: '45:20', status: 'Now Playing', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500' },
                            { title: 'Lecture 5: Implicit Differentiation & Tangents', duration: '40:30', status: 'Upcoming', color: 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-tertiary))]' }
                          ].map((lec, idx) => (
                            <div key={idx} className={`p-3.5 rounded-2xl border ${lec.color} flex justify-between items-center text-xs`}>
                              <div>
                                <h4 className="font-extrabold">{lec.title}</h4>
                                <p className="text-[10px] opacity-80 mt-0.5">Duration: {lec.duration}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border border-current">
                                {lec.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 3: QUIZZES & PRACTICE TESTS */}
                {lmsSubTab === 'quizzes' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-lg">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[hsl(var(--border))] pb-4">
                        <div>
                          <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/20">
                            PRACTICE QUIZ 1 — MATHEMATICS (MATH-101)
                          </span>
                          <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mt-1">Differentiation &amp; Derivatives Self-Test</h3>
                        </div>

                        {quizSubmitted && (
                          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                            Score: 3 / 3 (100% Perfect Score!)
                          </div>
                        )}
                      </div>

                      {/* Quiz Questions */}
                      <div className="space-y-6 text-xs">
                        {[
                          {
                            id: 'q1',
                            question: '1. What is the derivative of f(x) = 4x³ - 5x² + 7x - 2 with respect to x?',
                            options: [
                              { id: 'A', text: 'A) 12x² - 10x + 7' },
                              { id: 'B', text: 'B) 12x³ - 10x² + 7' },
                              { id: 'C', text: 'C) 4x² - 5x + 7' },
                              { id: 'D', text: 'D) 12x² - 5x + 7' }
                            ],
                            correct: 'A',
                            explanation: 'Using power rule: d/dx(4x³) = 12x², d/dx(-5x²) = -10x, d/dx(7x) = 7.'
                          },
                          {
                            id: 'q2',
                            question: '2. If y = sin(3x), what is dy/dx?',
                            options: [
                              { id: 'A', text: 'A) cos(3x)' },
                              { id: 'B', text: 'B) 3 cos(3x)' },
                              { id: 'C', text: 'C) -3 cos(3x)' },
                              { id: 'D', text: 'D) 3 sin(3x)' }
                            ],
                            correct: 'B',
                            explanation: 'Using chain rule: d/dx[sin(u)] = cos(u) * du/dx = 3 cos(3x).'
                          },
                          {
                            id: 'q3',
                            question: '3. What is the slope of the tangent line to y = x² at x = 4?',
                            options: [
                              { id: 'A', text: 'A) 4' },
                              { id: 'B', text: 'B) 8' },
                              { id: 'C', text: 'C) 16' },
                              { id: 'D', text: 'D) 2' }
                            ],
                            correct: 'B',
                            explanation: 'dy/dx = 2x. Evaluating at x = 4 gives 2(4) = 8.'
                          }
                        ].map((q, idx) => (
                          <div key={idx} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3">
                            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">{q.question}</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {q.options.map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                                  className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                                    quizAnswers[q.id] === opt.id
                                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--text-primary))]'
                                      : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                                  }`}
                                >
                                  {opt.text}
                                </button>
                              ))}
                            </div>

                            {quizSubmitted && (
                              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold mt-2">
                                ✅ <strong>Correct Answer: {q.correct}</strong> &bull; {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Submit Quiz Action */}
                      <div className="flex justify-end pt-2 border-t border-[hsl(var(--border))]">
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Submit Quiz Answers
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 4: DISCUSSION BOARDS & FORUM */}
                {lmsSubTab === 'discussions' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Post New Topic Card */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-400" /> Start a New Discussion Topic
                      </h3>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newTopicTitle}
                          onChange={e => setNewTopicTitle(e.target.value)}
                          placeholder="Topic Title (e.g. Question regarding Chapter 3 derivative proofs...)"
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                        <textarea
                          value={newTopicContent}
                          onChange={e => setNewTopicContent(e.target.value)}
                          placeholder="Describe your question or discussion point in detail..."
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-4 text-xs text-[hsl(var(--text-primary))] h-24 focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (!newTopicTitle.trim()) return;
                              const newThread = {
                                id: `t${forumThreads.length + 1}`,
                                title: newTopicTitle,
                                course: selectedLmsCourse,
                                author: 'Emeka Obi (Student)',
                                date: 'Just now',
                                replies: []
                              };
                              setForumThreads([newThread, ...forumThreads]);
                              setNewTopicTitle('');
                              setNewTopicContent('');
                            }}
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                          >
                            <Send className="w-3.5 h-3.5" /> Post Discussion Topic
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Active Forum Threads List */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
                        Active Course Discussions ({forumThreads.length})
                      </h3>

                      {forumThreads.map(thread => (
                        <div key={thread.id} className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-md">
                          <div className="flex justify-between items-start border-b border-[hsl(var(--border))] pb-3">
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-extrabold uppercase border border-purple-500/20">
                                {thread.course}
                              </span>
                              <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] mt-1">{thread.title}</h4>
                            </div>
                            <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{thread.date}</span>
                          </div>

                          {/* Replies Thread */}
                          <div className="space-y-2.5 pl-3 border-l-2 border-purple-500/30">
                            {thread.replies.map((rep, rIdx) => (
                              <div key={rIdx} className="p-3 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1 text-xs">
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-[hsl(var(--accent))]">{rep.author}</span>
                                  <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{rep.date}</span>
                                </div>
                                <p className="text-[hsl(var(--text-primary))]">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 7: Activities & Library */}
            {activeTab === 'activities' && (
              <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] space-y-6 rounded-3xl animate-fade-in text-xs shadow-lg">
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Clubs, Sports &amp; Library Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Library */}
                  <div className="space-y-4 border border-[hsl(var(--border))] p-5 rounded-2xl bg-[hsl(var(--bg-secondary))]">
                    <p className="font-bold text-[hsl(var(--text-primary))] text-sm flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-[hsl(var(--accent))]" /> Borrowed Library Books
                    </p>
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] flex justify-between">
                        <span>Introduction to Algorithms</span>
                        <span className="text-[hsl(var(--text-tertiary))] font-semibold">Due in 5 days</span>
                      </div>
                      <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-semibold">
                        Organic Chemistry Volume 1 (Overdue) &bull; Fine: ₦500
                      </div>
                    </div>
                  </div>

                  {/* Sports */}
                  <div className="space-y-4 border border-[hsl(var(--border))] p-5 rounded-2xl bg-[hsl(var(--bg-secondary))]">
                    <p className="font-bold text-[hsl(var(--text-primary))] text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-400" /> Active Clubs &amp; Sports
                    </p>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                        President &mdash; School Chess Club
                      </div>
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                        Forward &mdash; Senior Secondary Basketball Team
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 8: Health & Conduct */}
            {activeTab === 'welfare' && (
              <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] space-y-6 rounded-3xl animate-fade-in text-xs shadow-lg">
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Health Visits &amp; Conduct Ledger</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 border border-[hsl(var(--border))] p-5 rounded-2xl bg-[hsl(var(--bg-secondary))]">
                    <p className="font-bold text-[hsl(var(--text-primary))] text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" /> Clinic Check-ins
                    </p>
                    <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                      12th May 2026 &mdash; Asthmatic fit treatment (Inhaler administered)
                    </div>
                  </div>

                  <div className="space-y-4 border border-[hsl(var(--border))] p-5 rounded-2xl bg-[hsl(var(--bg-secondary))]">
                    <p className="font-bold text-[hsl(var(--text-primary))] text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" /> Merit &amp; Demerit Points
                    </p>
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-semibold">
                        +15 Merit points for Science Fair runner-up
                      </div>
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-tertiary))]">
                        0 Demerit warnings issued this term
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 9: Fees Ledger */}
            {activeTab === 'finance' && (
              <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] space-y-6 rounded-3xl animate-fade-in text-xs shadow-lg">
                <div>
                  <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Fees Invoice &amp; Payment Ledger (Read-Only)</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">All fee payments and invoices are managed via parent accounts. Below is your current tuition standing.</p>
                </div>
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))] text-sm">First Term Tuition Fee</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono mt-0.5">Invoice: INV-2026-0902</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-400 text-sm">₦250,000 Paid</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono mt-0.5">Receipt: REC-80812</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 10: AI Study Copilot */}
            {activeTab === 'ai-copilot' && (
              <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] space-y-6 rounded-3xl animate-fade-in text-xs shadow-lg">
                <div className="border-b border-[hsl(var(--border))] pb-4">
                  <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" /> AI Study Assistant &amp; Revision Planner
                  </h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Generate topic explanations, study outlines, and revision flashcards.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-2">Select Prompts</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['Explain photosynthesis', 'Generate Algebra quiz', 'Create revision schedule'].map(p => (
                        <button
                          key={p}
                          onClick={() => setStudyPrompt(p)}
                          className="px-3.5 py-1.5 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={studyPrompt}
                      onChange={e => setStudyPrompt(e.target.value)}
                      className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-4 text-xs text-[hsl(var(--text-primary))] h-28 focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button onClick={handleAskAI} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Ask Study Copilot
                    </button>
                  </div>

                  {aiResponse && (
                    <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 leading-relaxed text-xs text-[hsl(var(--text-secondary))] space-y-2">
                      <p className="font-bold text-indigo-400">Copilot Explanation:</p>
                      <p>{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 11: Productivity Logs */}
            {activeTab === 'productivity' && (
              <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] space-y-6 rounded-3xl animate-fade-in text-xs shadow-lg">
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Personal Study &amp; Academic Goal Tracker</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 border border-[hsl(var(--border))] p-5 rounded-2xl bg-[hsl(var(--bg-secondary))]">
                    <p className="font-bold text-[hsl(var(--text-primary))] text-sm">Term Academic Goals</p>
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] flex justify-between">
                        <span>Maintain Overall CGPA &gt; 3.8</span>
                        <span className="text-emerald-400 font-bold">On track</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] flex justify-between">
                        <span>Finish all LMS exercises</span>
                        <span className="text-amber-400 font-bold">In progress</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border border-[hsl(var(--border))] p-5 rounded-2xl bg-[hsl(var(--bg-secondary))]">
                    <p className="font-bold text-[hsl(var(--text-primary))] text-sm">Weekly Revision Hours</p>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                        Physics &mdash; 4 hours revised
                      </div>
                      <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                        Chemistry &mdash; 2 hours revised
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 12: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in text-xs">
                <div className="glass-card p-6 border border-[hsl(var(--border))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-3xl shadow-lg">
                  <div>
                    <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Student Settings &amp; Profile Preferences</h3>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Customize your student portal experience, notification preferences, and request updates.</p>
                  </div>
                  <button onClick={() => handleAction('Student Preferences Saved')} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-all shadow-md">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-4 rounded-3xl shadow-lg">
                      <p className="font-bold text-[hsl(var(--text-primary))] text-sm flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[hsl(var(--accent))]" /> Personal Customization
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Preferred Display Name</label>
                          <input type="text" defaultValue={studentData.fullName} className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-xs text-[hsl(var(--text-primary))]" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Personal Contact Phone</label>
                          <input type="text" defaultValue="+2348021110022" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 font-mono text-xs text-[hsl(var(--text-primary))]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card p-6 border border-rose-500/20 bg-rose-500/5 space-y-4 rounded-3xl shadow-lg">
                      <p className="font-bold text-rose-400 flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4" /> Locked School Registry Records
                      </p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] leading-relaxed">
                        Official student records (legal names, class arm allocation, and CGPA) are locked and managed by school registrar staff.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
