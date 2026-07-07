'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  GraduationCap, CalendarCheck, BookOpen, Clock, Users, ShieldAlert,
  Menu, Plus, Search, RotateCcw, AlertTriangle, CheckCircle2,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  Calendar, Layers, MessageSquare, Landmark, HelpCircle, Save, Sparkles, UserCheck,
  Award, ClipboardList, Send, Lightbulb, UserX, Heart, BookOpenCheck, Brain, PlusCircle,
  DollarSign, ShieldCheck, Briefcase, Eye, Shield, UsersRound, Scale, Phone
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
  | 'communication'
  | 'calendar'
  | 'timetable'
  | 'lms'
  | 'resources'
  | 'profile'
  | 'settings'
  // Form role tabs
  | 'parent-comm'
  | 'welfare-alerts'
  // HOD role tabs
  | 'department'
  | 'approvals-queue'
  // Senior role tabs
  | 'mentoring'
  | 'lesson-reviews'
  // VP role tabs
  | 'academic-oversight'
  | 'curriculum-bounds'
  // Principal role tabs
  | 'administration'
  | 'staff-list'
  | 'financial-snapshot';

export default function AdaptiveTeacherDashboard() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // States for interactive demo actions
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Multi-role simulated switches state
  const [activeRoles, setActiveRoles] = useState<Record<string, boolean>>({
    classroom_teacher: true,
    subject_teacher: true,
    form_teacher: false,
    hod: false,
    senior_teacher: false,
    vice_principal: false,
    principal: false
  });

  const handleRoleToggle = (role: string) => {
    setActiveRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
    // Reset active tab to dashboard if changing roles
    setActiveTab('dashboard');
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

  // Determine user data scope layer
  let dataScope = 'Assigned Classes & Subjects Only';
  if (activeRoles.hod) dataScope = 'Full Mathematics Department';
  if (activeRoles.vice_principal || activeRoles.principal) dataScope = 'Whole School (All Campuses & Departments)';

  // Build adaptive navigation list
  const coreTabs = [
    { id: 'dashboard', label: 'Dashboard Home', icon: BarChart3 },
    { id: 'classes', label: 'My Classes', icon: Layers },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'gradebook', label: 'Gradebook CA', icon: Award },
    { id: 'assignments', label: 'Assignments', icon: BookOpenCheck },
    { id: 'lessons', label: 'Lesson Plans', icon: ClipboardList },
    { id: 'materials', label: 'Resources Library', icon: Download },
    { id: 'homework', label: 'Homework Logs', icon: FileText },
    { id: 'communication', label: 'Messages Desk', icon: MessageSquare },
    { id: 'calendar', label: 'Events Calendar', icon: Calendar },
    { id: 'timetable', label: 'My Timetable', icon: Clock },
    { id: 'lms', label: 'LMS Courses', icon: BookOpen },
    { id: 'resources', label: 'Resource Booking', icon: Landmark },
    { id: 'profile', label: 'My Profile', icon: GraduationCap },
    { id: 'settings', label: 'My Settings', icon: Settings }
  ];

  const formTabs = [
    { id: 'parent-comm', label: 'Parent Engagement', icon: UserCheck },
    { id: 'welfare-alerts', label: 'Class Welfare Alerts', icon: Heart }
  ];

  const hodTabs = [
    { id: 'department', label: 'Dept Management', icon: Landmark },
    { id: 'approvals-queue', label: 'Grade Moderation Approvals', icon: ShieldCheck }
  ];

  const seniorTabs = [
    { id: 'mentoring', label: 'Teacher Mentoring', icon: UsersRound },
    { id: 'lesson-reviews', label: 'Lesson Reviews', icon: ClipboardList }
  ];

  const vpTabs = [
    { id: 'academic-oversight', label: 'Academic Oversight', icon: ShieldCheck },
    { id: 'curriculum-bounds', label: 'Curriculum & Exams', icon: BookOpen }
  ];

  const principalTabs = [
    { id: 'administration', label: 'Administration Console', icon: Settings },
    { id: 'staff-list', label: 'Staff Management', icon: UsersRound },
    { id: 'financial-snapshot', label: 'Financial Snapshot', icon: DollarSign }
  ];

  // Compile active tabs based on selected role intersections
  const activeTabsList = [...coreTabs];
  if (activeRoles.form_teacher) activeTabsList.push(...formTabs);
  if (activeRoles.hod) activeTabsList.push(...hodTabs);
  if (activeRoles.senior_teacher) activeTabsList.push(...seniorTabs);
  if (activeRoles.vice_principal) activeTabsList.push(...vpTabs);
  if (activeRoles.principal) activeTabsList.push(...principalTabs);

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[hsl(var(--accent))]" />
            Role-Based Adaptive Dashboard
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Enterprise multi-role configuration. The dashboard home stats, action permissions, and data scopes adapt dynamically based on your roles.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold shadow-glow">
            {dataScope}
          </span>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Multi-Role Simulation Toolbar */}
      <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] space-y-3">
        <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Simulate Active Staff Roles (Toggle multiple simultaneously)</p>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'classroom_teacher', label: 'Classroom Teacher' },
            { key: 'subject_teacher', label: 'Subject Teacher' },
            { key: 'form_teacher', label: 'Form Teacher' },
            { key: 'hod', label: 'Head of Dept (HOD)' },
            { key: 'senior_teacher', label: 'Senior Teacher' },
            { key: 'vice_principal', label: 'Vice Principal' },
            { key: 'principal', label: 'Principal' }
          ].map(role => (
            <button
              key={role.key}
              onClick={() => handleRoleToggle(role.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeRoles[role.key]
                  ? 'bg-[hsl(var(--accent)/0.12)] border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                  : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              {activeRoles[role.key] ? '✓ ' : '+ '} {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Horizontal Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap scrollbar-none">
        {activeTabsList.map(item => (
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
        {activeTabsList.slice(0, 4).map(item => (
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
            {!activeTabsList.slice(0, 4).map(i => i.id).includes(activeTab) && (
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
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Navigation Modules</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeTabsList.slice(4).map(item => (
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
        {/* Adaptive Dashboard Home */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Dynamic Widgets Grid based on role intersections */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Core widgets: visible to all teachers */}
              <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/10 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">Today&apos;s Classes</span>
                <div>
                  <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">3 scheduled</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Core Teaching</p>
                </div>
              </div>

              <div className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/10 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">Attendance Summary</span>
                <div>
                  <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">92% Present</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Core Operations</p>
                </div>
              </div>

              <div className="glass-card p-4 border border-indigo-500/20 bg-indigo-500/10 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">Pending Grading</span>
                <div>
                  <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">18 Assignments</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Continuous Assessment</p>
                </div>
              </div>

              {/* Form teacher widgets */}
              {(activeRoles.form_teacher || activeRoles.hod || activeRoles.vice_principal || activeRoles.principal) && (
                <div className="glass-card p-4 border border-pink-500/20 bg-pink-500/10 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">Parent Messages</span>
                  <div>
                    <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">2 Unread Alert</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Form / Class Engagement</p>
                  </div>
                </div>
              )}

              {/* HOD widgets */}
              {(activeRoles.hod || activeRoles.vice_principal || activeRoles.principal) && (
                <>
                  <div className="glass-card p-4 border border-teal-500/20 bg-teal-500/10 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">Dept Performance</span>
                    <div>
                      <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">Class Average: 81%</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Math Department</p>
                    </div>
                  </div>
                  <div className="glass-card p-4 border border-purple-500/20 bg-purple-500/10 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">Grade Approvals</span>
                    <div>
                      <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">5 files queue</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Assessment Moderation</p>
                    </div>
                  </div>
                </>
              )}

              {/* VP & Principal academic analytics */}
              {(activeRoles.vice_principal || activeRoles.principal) && (
                <div className="glass-card p-4 border border-amber-500/20 bg-amber-500/10 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">School Analytics</span>
                  <div>
                    <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">94.2% Attendance</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">VP Academic Oversight</p>
                  </div>
                </div>
              )}

              {/* Principal financial overview */}
              {activeRoles.principal && (
                <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/10 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block mb-2">Financial Summary</span>
                  <div>
                    <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">₦42.1M collected</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Cleared fee bounds</p>
                  </div>
                </div>
              )}
            </div>

            {/* Role-Based Adaptive Action Buttons (Layer 3) */}
            <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4 rounded-xl">
              <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Role-Based Action Scopes</p>
              <div className="flex flex-wrap gap-3">
                {/* Visible to classroom/subject teacher */}
                {(activeRoles.classroom_teacher || activeRoles.subject_teacher) && (
                  <button onClick={() => handleAction('Submit Grades to HOD')} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:opacity-90">
                    Submit Grades for Department review
                  </button>
                )}

                {/* Visible to HOD / VP */}
                {(activeRoles.hod || activeRoles.vice_principal) && (
                  <button onClick={() => handleAction('Approve & Moderate Grades')} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:opacity-90">
                    Approve &amp; Moderate Department Grades
                  </button>
                )}

                {/* Visible to Principal / VP */}
                {(activeRoles.principal || activeRoles.vice_principal) && (
                  <button onClick={() => handleAction('Publish Report Cards')} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-xs font-semibold hover:opacity-90">
                    Publish Official Report Cards
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Scope description */}
            <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-2 text-xs">
              <p className="font-bold text-[hsl(var(--text-primary))]">Data Access Scope Layer (Least Privilege Validation)</p>
              <p className="text-[10px] text-[hsl(var(--text-secondary))] leading-relaxed">
                Your currently simulated access allows you to view records under: <strong className="text-indigo-400">{dataScope}</strong>. 
                Any attempts to query students or classes outside of this scope will be automatically logged to the audit system.
              </p>
            </div>
          </div>
        )}

        {/* Form Teacher: Parent Communication */}
        {activeTab === 'parent-comm' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Form Class Parent Communications</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Direct message thread contacts for your assigned form class students parents.</p>
            <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-center">
              Parent chat threads and broadcast notices interface (Simulated active).
            </div>
          </div>
        )}

        {/* HOD: Department Management */}
        {activeTab === 'department' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Department Management Console</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Manage syllabus allocations, view department teachers obs list, and moderate continuous assessment quizzes.</p>
            <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-center">
              Department teachers observation lists and subject schedules (Simulated active).
            </div>
          </div>
        )}

        {/* VP: Academic Oversight */}
        {activeTab === 'academic-oversight' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Vice Principal Academic Oversight</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Review school-wide curriculum completion metrics, teacher substitution schedules, and exam timetables.</p>
            <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-center">
              Academic analytics and curriculum maps (Simulated active).
            </div>
          </div>
        )}

        {/* Principal: Financial Snapshot */}
        {activeTab === 'financial-snapshot' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Principal Financial Summary</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Review school fee collection rates, outstanding balances, and total collections by term.</p>
            <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-center">
              Fee collect rates and financial overview chart (Simulated active).
            </div>
          </div>
        )}

        {/* Keep core fallback settings tab rendering */}
        {activeTab === 'settings' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in text-xs">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Portal Settings</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Personal settings config (Simulated active).</p>
          </div>
        )}
      </div>
    </div>
  );
}
