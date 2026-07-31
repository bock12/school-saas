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
  Smile, Sun, Star, Book, Bell, ArrowRight, LayoutGrid, Sliders, FileCheck, Upload,
  Video, PhoneCall, CheckCheck, Pin, MoreVertical, Paperclip, Bus, Navigation, FolderDown, TrendingUp, QrCode
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type StudentTab =
  | 'dashboard'
  | 'attendance'
  | 'profile'
  | 'id-card'
  | 'portfolio'
  | 'academics'
  | 'analytics'
  | 'timetable'
  | 'calendar'
  | 'messages'
  | 'notifications'
  | 'assignments'
  | 'lms'
  | 'library'
  | 'activities'
  | 'welfare'
  | 'hostel'
  | 'transport'
  | 'documents'
  | 'finance'
  | 'ai-copilot'
  | 'productivity'
  | 'support'
  | 'settings';

export default function StudentPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenant = (params?.tenant as string) || '';

  const tabParam = (searchParams.get('tab') as StudentTab) || 'dashboard';

  // Prevent SSR Hydration Mismatch by ensuring client-only mounting
  const [mounted, setMounted] = useState(false);
  // Mode: 'simple' for younger students vs 'advanced' for secondary school students
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('advanced');
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');

  useEffect(() => {
    setMounted(true);
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

  // Fee Information & Online Payment Portal State
  const [showPayNowModal, setShowPayNowModal] = useState(false);
  const [payAmountInput, setPayAmountInput] = useState('45000');
  const [selectedPayMethod, setSelectedPayMethod] = useState<'card' | 'momo' | 'bank'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // Admin-Grade Internal Messaging Module Interactive State
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'groups' | 'starred'>('all');
  const [chatSearch, setChatSearch] = useState('');
  const [userStatusMessage, setUserStatusMessage] = useState('Available 👋');
  const [activeChatChannelId, setActiveChatChannelId] = useState('c1');
  const [chatInputText, setChatInputText] = useState('');
  const [replyingToMsg, setReplyingToMsg] = useState<any | null>(null);
  const [showCallModal, setShowCallModal] = useState<{ type: 'voice' | 'video'; name: string } | null>(null);
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [newDmRecipient, setNewDmRecipient] = useState('Mr. Kwame Darko (Math Teacher)');
  const [chatToast, setChatToast] = useState<string | null>(null);

  // Library & Resource Hub Interactive State
  const [librarySubTab, setLibrarySubTab] = useState<'dashboard' | 'search' | 'borrowed' | 'reservations' | 'history' | 'fines'>('dashboard');
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('all');
  const [libraryToast, setLibraryToast] = useState<string | null>(null);

  const [borrowedBooksData, setBorrowedBooksData] = useState<any[]>([
    {
      id: 'b1',
      title: 'Fundamentals of Physics 11th Edition',
      author: 'David Halliday & Robert Resnick',
      category: 'Physics',
      callNo: 'PHYS-204',
      coverBg: 'from-blue-600 to-indigo-700',
      borrowedDate: 'July 15, 2026',
      dueDate: 'August 02, 2026',
      daysLeft: 4,
      status: 'active',
      fine: 0
    },
    {
      id: 'b2',
      title: 'Organic Chemistry: Structure & Mechanism',
      author: 'Robert T. Morrison & Robert N. Boyd',
      category: 'Chemistry',
      callNo: 'CHEM-108',
      coverBg: 'from-emerald-600 to-teal-700',
      borrowedDate: 'July 01, 2026',
      dueDate: 'July 22, 2026',
      daysLeft: -7,
      status: 'overdue',
      fine: 500
    }
  ]);

  const [reservedBooksData, setReservedBooksData] = useState<any[]>([
    {
      id: 'r1',
      title: 'Introduction to Algorithms 3rd Edition',
      author: 'Thomas H. Cormen & Charles E. Leiserson',
      category: 'Computer Science',
      callNo: 'CS-401',
      coverBg: 'from-purple-600 to-pink-700',
      reservedDate: 'July 28, 2026',
      pickupDeadline: 'July 31, 2026',
      status: 'Ready for Pickup at Front Desk',
      deskLocation: 'Shelf A-4 • Main Reserve Counter'
    }
  ]);

  const [readingHistoryData, setReadingHistoryData] = useState<any[]>([
    {
      id: 'h1',
      title: 'Macbeth (Folger Shakespeare Library)',
      author: 'William Shakespeare',
      category: 'Literature',
      returnedDate: 'June 18, 2026',
      rating: 5,
      reviewNote: 'Masterpiece analysis for Term 1 Literature essay.'
    },
    {
      id: 'h2',
      title: 'Advanced Engineering Mathematics 10th Ed',
      author: 'Erwin Kreyszig',
      category: 'Mathematics',
      returnedDate: 'May 30, 2026',
      rating: 4,
      reviewNote: 'Used for linear algebra and vector calculus study.'
    }
  ]);

  const [libraryCatalogData, setLibraryCatalogData] = useState<any[]>([
    {
      id: 'cat1',
      title: 'Pure Mathematics 5th Edition',
      author: 'S.T. Tan & L. Bostock',
      category: 'Mathematics',
      callNo: 'MATH-502',
      isbn: '978-0748755097',
      totalCopies: 5,
      availableCopies: 4,
      status: 'Available',
      coverBg: 'from-amber-600 to-orange-700',
      description: 'Comprehensive senior secondary calculus, vectors, complex numbers, and coordinate geometry.'
    },
    {
      id: 'cat2',
      title: 'Hamlet (Arden Shakespeare Series)',
      author: 'William Shakespeare',
      category: 'Literature',
      callNo: 'LIT-301',
      isbn: '978-1904271338',
      totalCopies: 10,
      availableCopies: 8,
      status: 'Available',
      coverBg: 'from-rose-600 to-red-700',
      description: 'Definitive edition with critical annotations, stage history, and textual notes.'
    },
    {
      id: 'cat3',
      title: 'Things Fall Apart',
      author: 'Chinua Achebe',
      category: 'Fiction',
      callNo: 'FIC-102',
      isbn: '978-0385474542',
      totalCopies: 6,
      availableCopies: 6,
      status: 'Available',
      coverBg: 'from-emerald-700 to-green-800',
      description: 'African literary masterpiece detailing Okonkwo\'s life and Umuofia tribal society.'
    },
    {
      id: 'cat4',
      title: 'Principles of Biochemistry 7th Edition',
      author: 'Albert L. Lehninger & David L. Nelson',
      category: 'Chemistry',
      callNo: 'CHEM-304',
      isbn: '978-1464126116',
      totalCopies: 3,
      availableCopies: 3,
      status: 'Available',
      coverBg: 'from-cyan-600 to-blue-700',
      description: 'Enzyme kinetics, metabolic pathways, molecular genetics, and cellular energetic structures.'
    },
    {
      id: 'cat5',
      title: 'Concise Inorganic Chemistry 5th Ed',
      author: 'J.D. Lee',
      category: 'Chemistry',
      callNo: 'CHEM-205',
      isbn: '978-0632052936',
      totalCopies: 4,
      availableCopies: 2,
      status: 'Available',
      coverBg: 'from-violet-600 to-indigo-800',
      description: 'Periodic table trends, transition metal complexes, and chemical bonding mechanisms.'
    }
  ]);

  // Discipline & Behavior Transparency Module Interactive State
  const [disciplineSubTab, setDisciplineSubTab] = useState<'overview' | 'commendations' | 'warnings' | 'records' | 'merits' | 'demerits' | 'health'>('overview');

  const [commendationsData, setCommendationsData] = useState<any[]>([
    {
      id: 'com1',
      title: 'Science Fair Peer Tutoring Excellence Citation',
      issuedBy: 'Dr. Stella Gbandi & Science Department',
      date: 'July 20, 2026',
      pointsAwarded: '+25 Merits',
      badge: 'Academic Leadership',
      description: 'Awarded for exceptional volunteer tutoring during the Inter-School STEM Science Exhibition prep sessions.'
    },
    {
      id: 'com2',
      title: 'Punctuality & Assembly Decorum Honor Roll',
      issuedBy: 'Vice Principal (Student Welfare)',
      date: 'June 14, 2026',
      pointsAwarded: '+15 Merits',
      badge: 'Model Conduct',
      description: 'Achieved 100% morning assembly punctuality and exemplary uniform presentation throughout Term 1.'
    },
    {
      id: 'com3',
      title: 'Inter-House Sports Team Captaincy Leadership',
      issuedBy: 'Sports Director & House Master',
      date: 'May 08, 2026',
      pointsAwarded: '+20 Merits',
      badge: 'Sportsmanship & Ethics',
      description: 'Demonstrated outstanding team leadership, sportsmanship, and fair play in the Senior Athletics Relay Championship.'
    }
  ]);

  const [warningsData, setWarningsData] = useState<any[]>([
    {
      id: 'warn1',
      title: 'Morning Assembly Late Arrival Advisory',
      issuedBy: 'Discipline Master (Mr. Isaac Mensah)',
      date: 'July 05, 2026',
      deduction: '-5 Demerits',
      status: 'Acknowledged',
      description: 'Arrived 8 minutes past the 07:45 AM assembly bell line. Counseling provided.'
    },
    {
      id: 'warn2',
      title: 'Lab Attire Inspection Notice',
      issuedBy: 'Chemistry Lab Supervisor',
      date: 'June 02, 2026',
      deduction: '-5 Demerits',
      status: 'Resolved',
      description: 'Forgot lab safety goggles during organic chemistry titration practical. Corrective compliance verified.'
    }
  ]);

  const [disciplineRecordsData, setDisciplineRecordsData] = useState<any[]>([
    {
      id: 'rec1',
      incident: 'Unexcused Assembly Delay',
      category: 'Punctuality Infraction',
      date: 'July 05, 2026',
      reportedBy: 'Duty Master (Mr. Isaac Mensah)',
      actionTaken: 'Verbal Advisory & Corrective Goal Setting',
      status: 'Resolved & Closed',
      severity: 'Minor',
      demerits: 5
    },
    {
      id: 'rec2',
      incident: 'Lab Safety Gear Non-Compliance',
      category: 'Safety Violation',
      date: 'June 02, 2026',
      reportedBy: 'Mrs. Beatrice Mensah',
      actionTaken: 'Lab Safety Guidelines Orientation Review',
      status: 'Resolved & Closed',
      severity: 'Minor',
      demerits: 5
    }
  ]);

  const [meritsData, setMeritsData] = useState<any[]>([
    { id: 'm1', date: 'July 20, 2026', title: 'STEM Peer Tutoring', points: '+25', category: 'Academic Excellence' },
    { id: 'm2', date: 'June 14, 2026', title: 'Punctuality Honor Roll', points: '+15', category: 'Punctuality' },
    { id: 'm3', date: 'May 08, 2026', title: 'Inter-House Sportsmanship', points: '+20', category: 'Sportsmanship' },
    { id: 'm4', date: 'April 22, 2026', title: 'Library Book Revival Volunteer', points: '+15', category: 'Community Service' },
    { id: 'm5', date: 'March 10, 2026', title: 'Math Olympiad Representative', points: '+10', category: 'Academic Excellence' }
  ]);

  const [demeritsData, setDemeritsData] = useState<any[]>([
    { id: 'd1', date: 'July 05, 2026', title: 'Morning Assembly Late Arrival', points: '-5', category: 'Punctuality' },
    { id: 'd2', date: 'June 02, 2026', title: 'Lab Attire Non-Compliance', points: '-5', category: 'Safety Rules' }
  ]);

  // Clubs & Extracurricular Activities Interactive State
  const [clubsSubTab, setClubsSubTab] = useState<'my_clubs' | 'browse' | 'schedules' | 'events' | 'participation' | 'achievements'>('my_clubs');
  const [clubsToast, setClubsToast] = useState<string | null>(null);

  const [clubsData, setClubsData] = useState<any[]>([
    {
      id: 'club1',
      name: 'Robotics & AI Innovation Club',
      category: 'STEM & Technology',
      schedule: 'Tuesdays & Thursdays 03:30 PM - 05:00 PM',
      room: 'Computer Lab A',
      patron: 'Prof. Emmanuel Thorpe',
      members: 28,
      joined: true,
      role: 'Project Team Lead',
      attendanceRate: '95%',
      sessionsAttended: '19 / 20 Sessions',
      coverBg: 'from-blue-600 to-indigo-700',
      description: 'Hands-on robotics hardware assembly, Arduino microcontrollers, Python AI algorithms, and competitive STEM challenge builds.'
    },
    {
      id: 'club2',
      name: 'School Chess & Strategy Club',
      category: 'Mind Sports',
      schedule: 'Wednesdays 03:30 PM - 04:45 PM',
      room: 'Library Hall B',
      patron: 'Mr. Kwame Darko',
      members: 34,
      joined: true,
      role: 'Club President',
      attendanceRate: '100%',
      sessionsAttended: '14 / 14 Sessions',
      coverBg: 'from-emerald-600 to-teal-700',
      description: 'Strategic tactical analysis, grandmaster opening studies, blitz tournaments, and inter-school chess championship representation.'
    },
    {
      id: 'club3',
      name: 'Senior Secondary Basketball Squad',
      category: 'Athletics & Sports',
      schedule: 'Mondays & Fridays 04:00 PM - 05:30 PM',
      room: 'Main Sports Gymnasium',
      patron: 'Coach David Miller',
      members: 18,
      joined: true,
      role: 'Forward / Team Captain',
      attendanceRate: '90%',
      sessionsAttended: '18 / 20 Sessions',
      coverBg: 'from-amber-600 to-orange-700',
      description: 'Competitive varsity basketball training, tactical playbooks, physical conditioning, and regional tournament matches.'
    },
    {
      id: 'club4',
      name: 'Debate & Public Speaking Society',
      category: 'Literary & Advocacy',
      schedule: 'Thursdays 03:30 PM - 05:00 PM',
      room: 'Auditorium Hall 2',
      patron: 'Dr. Stella Gbandi',
      members: 42,
      joined: false,
      role: 'Member',
      attendanceRate: '-',
      sessionsAttended: '-',
      coverBg: 'from-purple-600 to-pink-700',
      description: 'Parliamentary debate techniques, public speaking confidence, argumentative research, and Model UN simulations.'
    },
    {
      id: 'club5',
      name: 'Green Earth Environmental Club',
      category: 'Community & Eco-Service',
      schedule: 'Saturdays 09:00 AM - 11:00 AM',
      room: 'School Eco-Garden',
      patron: 'Mrs. Beatrice Mensah',
      members: 25,
      joined: false,
      role: 'Member',
      attendanceRate: '-',
      sessionsAttended: '-',
      coverBg: 'from-emerald-700 to-green-800',
      description: 'Campus recycling initiatives, organic gardening, climate action campaigns, and community tree planting drives.'
    },
    {
      id: 'club6',
      name: 'Drama & Performing Arts Guild',
      category: 'Creative Arts',
      schedule: 'Fridays 03:30 PM - 05:30 PM',
      room: 'Drama Studio',
      patron: 'Mrs. Janet Osei',
      members: 30,
      joined: false,
      role: 'Member',
      attendanceRate: '-',
      sessionsAttended: '-',
      coverBg: 'from-rose-600 to-red-700',
      description: 'Stage acting technique, scriptwriting, set production, and annual theatrical drama presentations.'
    }
  ]);

  const [clubEventsData, setClubEventsData] = useState<any[]>([
    {
      id: 'ev1',
      title: 'Annual National Secondary Robotics Hackathon 2026',
      club: 'Robotics & AI Innovation Club',
      date: 'August 12, 2026 • 09:00 AM',
      venue: 'Tech Innovation Hub Auditorium',
      seatNo: 'Seat #14',
      registered: true,
      badge: 'Hackathon Contest'
    },
    {
      id: 'ev2',
      title: 'Inter-School Championship Chess Tournament',
      club: 'School Chess & Strategy Club',
      date: 'August 20, 2026 • 10:00 AM',
      venue: 'Central City Gymnasium',
      seatNo: 'Board #03',
      registered: true,
      badge: 'Championship Match'
    },
    {
      id: 'ev3',
      title: 'State Schools Athletics & Basketball Finals',
      club: 'Senior Secondary Basketball Squad',
      date: 'September 05, 2026 • 02:00 PM',
      venue: 'Metropolitan Stadium',
      seatNo: 'Open',
      registered: false,
      badge: 'Varsity Tournament'
    },
    {
      id: 'ev4',
      title: 'Inter-House Environmental Tree Planting Drive',
      club: 'Green Earth Environmental Club',
      date: 'August 25, 2026 • 08:30 AM',
      venue: 'School Sports Grounds',
      seatNo: 'Open',
      registered: false,
      badge: 'Community Service'
    }
  ]);

  const [achievementsData, setAchievementsData] = useState<any[]>([
    {
      id: 'ach1',
      title: '1st Place Gold Medal — Regional Physics Olympiad 2026',
      club: 'Robotics & STEM',
      category: 'Academic Honor',
      awardedDate: 'June 2026',
      issuedBy: 'National Science Foundation',
      icon: '🥇',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    },
    {
      id: 'ach2',
      title: 'Grand Champions Trophy — Inter-School Chess League',
      club: 'Chess & Strategy Club',
      category: 'Mind Sports Trophy',
      awardedDate: 'May 2026',
      issuedBy: 'State Chess Association',
      icon: '🏆',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    },
    {
      id: 'ach3',
      title: 'Best Outstanding Delegate Award — Model UN Conference',
      club: 'Debate Society',
      category: 'Leadership Citation',
      awardedDate: 'April 2026',
      issuedBy: 'Secondary Schools UN Assembly',
      icon: '🥇',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    },
    {
      id: 'ach4',
      title: 'Silver Medalist — Senior Secondary Relay Championship',
      club: 'Basketball Squad',
      category: 'Athletic Medal',
      awardedDate: 'March 2026',
      issuedBy: 'School Sports Federation',
      icon: '🥈',
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-300'
    }
  ]);

  // Hostel & Boarding Accommodation Module State (Optional Module for Boarding Schools)
  const [isHostelModuleEnabled, setIsHostelModuleEnabled] = useState(true);
  const [hostelToast, setHostelToast] = useState<string | null>(null);

  const [hostelData, setHostelData] = useState({
    hostelName: 'St. Augustine Senior Boarding House (East Wing)',
    roomNumber: 'Room 204 — 2nd Floor',
    bedNumber: 'Bed B-02 (Lower Bunk)',
    wardenName: 'Mr. Benedict Osei (Senior House Master)',
    wardenContact: '+234-803-444-5566 • benedict.osei@school.edu',
    dormitoryType: 'Senior Secondary Quad Dorm (4 Beds)',
    roommates: ['David Chen (Room Lead)', 'Amina Yusuf (Bed A-02)', 'Kelechi Okafor (Bed B-01)'],
    curfewTime: '09:30 PM (Lights Out & Nightly Lockout)',
    inspectionNotices: [
      {
        id: 'insp1',
        title: 'Weekly Dormitory Room Neatness Inspection',
        date: 'July 26, 2026',
        score: '96 / 100 (Grade A • Pass)',
        inspector: 'Senior Warden (Mr. Benedict Osei)',
        remarks: 'Bed properly dressed with hospital corners, study desks neat, wardrobes organized.'
      },
      {
        id: 'insp2',
        title: 'Curfew & Evening Roll Call Attendance Inspection',
        date: 'July 19, 2026',
        score: '100 / 100 (Full Compliance)',
        inspector: 'Duty House Prefect',
        remarks: 'All 4 room occupants present and accounted for during 09:30 PM roll call.'
      },
      {
        id: 'insp3',
        title: 'Fire Safety & High-Wattage Electrical Audit',
        date: 'June 30, 2026',
        score: 'Passed (No Infractions)',
        inspector: 'School Safety Officer',
        remarks: 'No unauthorized electrical cooking appliances or high-wattage heaters detected.'
      }
    ]
  });

  // Transport & School Bus Module Interactive State
  const [isTransportModuleEnabled, setIsTransportModuleEnabled] = useState(true);
  const [transportToast, setTransportToast] = useState<string | null>(null);

  const [transportData, setTransportData] = useState({
    busNumber: 'School Bus #07 (Toyota Coaster)',
    plateNumber: 'AG-842-APP',
    capacity: '32 Passengers (Air Conditioned)',
    driverName: 'Uncle Samuel Lawson',
    driverRole: 'Senior Transport Officer',
    driverPhone: '+234-802-999-8877',
    driverLicense: 'Commercial Heavy Duty Class A (15 Yrs Exp)',
    busAttendant: 'Mrs. Grace Mensah (Route Safety Attendant)',
    routeName: 'Route B — Lekki Phase 1 / VGC Express Corridor',
    myStop: 'Stop #4 - Victoria Garden City Gate 2 Main Entrance',
    morningPickupTime: '07:15 AM (Departure 07:18 AM)',
    afternoonDropoffTime: '03:45 PM (Arrival 03:50 PM)',
    gpsStatus: 'Active Live GPS • Signal 100%',
    liveEta: '6 mins (1.8 km away)',
    currentSpeed: '42 km/h',
    routeStops: [
      { id: 's1', name: 'Central Bus Depot (Departure)', time: '06:45 AM', status: 'Passed', icon: '🚌' },
      { id: 's2', name: 'Admiralty Way Junction (Stop #2)', time: '07:00 AM', status: 'Passed', icon: '📍' },
      { id: 's3', name: 'Ikota Villa Estate Gate (Stop #3)', time: '07:10 AM', status: 'Passed', icon: '📍' },
      { id: 's4', name: 'Victoria Garden City Gate 2 (My Scheduled Stop)', time: '07:15 AM', status: 'Target Stop', icon: '📍' },
      { id: 's5', name: 'Main Campus Bus Bay (Final Destination)', time: '07:35 AM', status: 'Upcoming', icon: '🏫' }
    ]
  });

  // Documents & Downloads Module State
  const [documentsCategory, setDocumentsCategory] = useState<'all' | 'reports' | 'admission' | 'id_card' | 'certificates' | 'receipts' | 'timetable' | 'transcript'>('all');
  const [documentsToast, setDocumentsToast] = useState<string | null>(null);

  const [studentDocumentsData] = useState<any[]>([
    {
      id: 'doc1',
      title: 'Official Term Report Card — Term 1 2026/2027',
      category: 'reports',
      categoryLabel: 'Report Card',
      fileSize: '1.8 MB PDF',
      issuedBy: 'Albert Academy Registrar Office',
      date: 'July 20, 2026',
      badge: 'Report Card',
      icon: '📊',
      action: 'report_card'
    },
    {
      id: 'doc2',
      title: 'Official Term Report Card — Term 2 2025/2026',
      category: 'reports',
      categoryLabel: 'Report Card',
      fileSize: '1.7 MB PDF',
      issuedBy: 'Albert Academy Registrar Office',
      date: 'April 14, 2026',
      badge: 'Report Card',
      icon: '📊',
      action: 'report_card'
    },
    {
      id: 'doc3',
      title: 'Official School Offer of Admission Letter',
      category: 'admission',
      categoryLabel: 'Admission Letter',
      fileSize: '1.4 MB Signed PDF',
      issuedBy: 'Office of the Principal & Admissions',
      date: 'September 15, 2024',
      badge: 'Admission Document',
      icon: '📜',
      action: 'download'
    },
    {
      id: 'doc4',
      title: 'Digital Student Identity Card & QR Access Badge',
      category: 'id_card',
      categoryLabel: 'ID Card',
      fileSize: '850 KB PNG / PDF',
      issuedBy: 'Campus Safety & Student Registry',
      date: 'September 2024 • Valid 2024-2027',
      badge: 'Identity Card',
      icon: '🪪',
      action: 'id_card'
    },
    {
      id: 'doc5',
      title: 'STEM & Physics Olympiad Certificate of Excellence (1st Place)',
      category: 'certificates',
      categoryLabel: 'Certificate',
      fileSize: '2.2 MB High-Res PDF',
      issuedBy: 'National Science Foundation',
      date: 'June 2026',
      badge: 'Academic Medal',
      icon: '🥇',
      action: 'download'
    },
    {
      id: 'doc6',
      title: 'Inter-School Chess Championship Winner Certificate',
      category: 'certificates',
      categoryLabel: 'Certificate',
      fileSize: '2.0 MB High-Res PDF',
      issuedBy: 'State Chess Federation',
      date: 'May 2026',
      badge: 'Mind Sports Award',
      icon: '🏆',
      action: 'download'
    },
    {
      id: 'doc7',
      title: 'Model UN Conference Outstanding Delegate Citation',
      category: 'certificates',
      categoryLabel: 'Certificate',
      fileSize: '1.9 MB PDF',
      issuedBy: 'Secondary Schools UN Assembly',
      date: 'April 2026',
      badge: 'Leadership Award',
      icon: '🌟',
      action: 'download'
    },
    {
      id: 'doc8',
      title: 'Tuition & Boarding Fee Receipt #REC-2026-90412 (₦450,000)',
      category: 'receipts',
      categoryLabel: 'Fee Receipt',
      fileSize: '650 KB PDF',
      issuedBy: 'School Bursar & Finance Dept',
      date: 'July 01, 2026',
      badge: 'Fully Paid ✓',
      icon: '💳',
      action: 'download'
    },
    {
      id: 'doc9',
      title: 'STEM Lab & Robotics Workshop Receipt #REC-2026-88104 (₦55,000)',
      category: 'receipts',
      categoryLabel: 'Fee Receipt',
      fileSize: '520 KB PDF',
      issuedBy: 'School Bursar & Finance Dept',
      date: 'June 18, 2026',
      badge: 'Fully Paid ✓',
      icon: '💳',
      action: 'download'
    },
    {
      id: 'doc10',
      title: 'Weekly Class Timetable & Exam Slip Docket — Term 1 2026',
      category: 'timetable',
      categoryLabel: 'Timetable & Slip',
      fileSize: '1.1 MB PDF',
      issuedBy: 'Director of Studies',
      date: 'July 2026',
      badge: 'Class Schedule',
      icon: '📅',
      action: 'timetable'
    },
    {
      id: 'doc11',
      title: 'Official Multi-Year Academic Transcript (Cumulative GPA 3.82 / 4.0)',
      category: 'transcript',
      categoryLabel: 'Transcript',
      fileSize: '3.1 MB Signed PDF',
      issuedBy: 'School Registrar & Academic Board',
      date: 'July 2026',
      badge: 'Signed Transcript',
      icon: '🎓',
      action: 'transcript'
    }
  ]);

  // Central Notification Center & Multi-Channel Alert Desk Interactive State
  const [notificationsFilter, setNotificationsFilter] = useState<'all' | 'unread' | 'assignment' | 'result' | 'announcement' | 'message' | 'finance' | 'attendance'>('all');
  const [notificationsSearchQuery, setNotificationsSearchQuery] = useState('');
  const [notificationsToast, setNotificationsToast] = useState<string | null>(null);

  // Multi-Channel Dispatch Preferences (Push, Email, SMS)
  const [notificationsDispatchPrefs, setNotificationsDispatchPrefs] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: true,
    guardianSmsPhone: '+234-803-333-4455'
  });

  const [notificationsData, setNotificationsData] = useState<any[]>([
    {
      id: 'notif1',
      title: 'Assignment Due Reminder',
      category: 'assignment',
      categoryLabel: 'Assignment Due',
      message: 'Algebra Chapter 4 Proofs & Polynomial exercises are due today at 05:00 PM (100 Pts). Please submit via Assignments Desk.',
      timestamp: 'Today at 08:30 AM',
      read: false,
      priority: 'High',
      sender: 'Mathematics Dept (Mr. Kwame Darko)',
      icon: '📝',
      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
      actionTab: 'assignments'
    },
    {
      id: 'notif2',
      title: 'New Examination Result Published',
      category: 'result',
      categoryLabel: 'New Result',
      message: 'Midterm Organic Chemistry Exam score published: 88 / 100 (Grade A • Outstanding).',
      timestamp: 'Yesterday at 04:15 PM',
      read: false,
      priority: 'Urgent',
      sender: 'Academic Registrar Office',
      icon: '📊',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      actionTab: 'academics'
    },
    {
      id: 'notif3',
      title: 'School Announcement: Inter-House Cultural Week',
      category: 'announcement',
      categoryLabel: 'New Announcement',
      message: 'Annual Inter-House Sports & Cultural Festival commences August 15, 2026. All house captains to submit team lists.',
      timestamp: 'July 28, 2026',
      read: false,
      priority: 'Normal',
      sender: 'Principal Office & Student Affairs',
      icon: '📢',
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      actionTab: 'calendar'
    },
    {
      id: 'notif4',
      title: 'Direct Teacher Message Received',
      category: 'message',
      categoryLabel: 'Teacher Message',
      message: 'Mr. Kwame Darko: "Hello Emeka, excellent work on the Math Olympiad qualifying test!"',
      timestamp: 'July 27, 2026',
      read: false,
      priority: 'Normal',
      sender: 'Mr. Kwame Darko (Math Teacher)',
      icon: '💬',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      actionTab: 'messages'
    },
    {
      id: 'notif5',
      title: 'School Fee Payment Reminder',
      category: 'finance',
      categoryLabel: 'Fee Reminder',
      message: 'Term 2 Installment Fee Balance due date approaching in 10 days. Online card payment is open.',
      timestamp: 'July 25, 2026',
      read: false,
      priority: 'Urgent',
      sender: 'School Bursar & Finance Dept',
      icon: '💳',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      actionTab: 'finance'
    },
    {
      id: 'notif6',
      title: 'Daily Attendance Check-in Recorded',
      category: 'attendance',
      categoryLabel: 'Attendance Alert',
      message: 'Morning Assembly Gate RFID check-in recorded at 07:42 AM (On Time ✓). Attendance status: Present.',
      timestamp: 'July 24, 2026',
      read: false,
      priority: 'Low',
      sender: 'Attendance Scanner System',
      icon: '🚨',
      color: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
      actionTab: 'attendance'
    },
    {
      id: 'notif7',
      title: 'Library Book Due Date Advisory',
      category: 'announcement',
      categoryLabel: 'New Announcement',
      message: '"Introduction to Algorithms" library book loan due in 5 days. Please return or renew loan online.',
      timestamp: 'July 22, 2026',
      read: true,
      priority: 'Low',
      sender: 'School Central Library Desk',
      icon: '📚',
      color: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
      actionTab: 'library'
    }
  ]);

  // Performance Analytics Visual Dashboard Interactive State
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'overview' | 'subjects' | 'gpa_trend' | 'attendance_trend' | 'assignments' | 'exam_comp'>('overview');
  const [analyticsToast, setAnalyticsToast] = useState<string | null>(null);

  const [subjectPerformanceData] = useState<any[]>([
    { subject: 'Mathematics (MATH-101)', score: 92, grade: 'A+', target: 95, icon: '📐', barColor: 'from-blue-600 to-indigo-600', status: 'Mastery Level' },
    { subject: 'English Literature (ENG-301)', score: 90, grade: 'A', target: 92, icon: '📖', barColor: 'from-purple-600 to-pink-600', status: 'Mastery Level' },
    { subject: 'Organic Chemistry (CHEM-202)', score: 88, grade: 'A', target: 90, icon: '🧪', barColor: 'from-emerald-600 to-teal-600', status: 'Strong' },
    { subject: 'Modern Physics (PHYS-201)', score: 85, grade: 'A-', target: 88, icon: '⚡', barColor: 'from-amber-600 to-orange-600', status: 'Strong' },
    { subject: 'World History (HIST-102)', score: 78, grade: 'B+', target: 85, icon: '📜', barColor: 'from-rose-600 to-red-600', status: 'Focus Area' }
  ]);

  const [gpaTrendData] = useState<any[]>([
    { term: 'Term 1 (2024/2025)', gpa: 3.65, status: 'First Year Baseline' },
    { term: 'Term 2 (2024/2025)', gpa: 3.72, status: 'Steady Improvement' },
    { term: 'Term 3 (2024/2025)', gpa: 3.78, status: 'Honor Roll' },
    { term: 'Term 1 (2025/2026)', gpa: 3.82, status: 'High Distinction' },
    { term: 'Term 2 (2025/2026)', gpa: 3.85, status: 'Current Standing' },
    { term: 'Term 3 Target', gpa: 3.92, status: 'Projected Target' }
  ]);

  const [attendanceTrendData] = useState<any[]>([
    { month: 'January', rate: 94, status: '18 / 19 Days' },
    { month: 'February', rate: 96, status: '19 / 20 Days' },
    { month: 'March', rate: 98, status: '21 / 22 Days' },
    { month: 'April', rate: 95, status: '19 / 20 Days' },
    { month: 'May', rate: 98, status: '20 / 21 Days' },
    { month: 'June', rate: 96, status: '19 / 20 Days' }
  ]);

  const [examComparisonData] = useState<any[]>([
    { subject: 'Mathematics', midterm: 88, final: 94, diff: '+6%', trend: 'up' },
    { subject: 'Organic Chemistry', midterm: 82, final: 88, diff: '+6%', trend: 'up' },
    { subject: 'Modern Physics', midterm: 80, final: 85, diff: '+5%', trend: 'up' },
    { subject: 'English Literature', midterm: 88, final: 90, diff: '+2%', trend: 'up' },
    { subject: 'World History', midterm: 75, final: 78, diff: '+3%', trend: 'up' }
  ]);

  // AI Learning Assistant (Optional Module) Interactive State
  const [isAiAssistantEnabled, setIsAiAssistantEnabled] = useState(true);
  const [aiSubTab, setAiSubTab] = useState<'explain' | 'quiz' | 'summarize' | 'study_plan' | 'qa' | 'weak_topics'>('explain');
  const [aiAssistantToast, setAiAssistantToast] = useState<string | null>(null);

  // Lesson Explanation State
  const [aiLessonTopic, setAiLessonTopic] = useState('Organic Chemistry: Electrophilic Addition Reaction Mechanisms');
  const [aiLessonExplanation, setAiLessonExplanation] = useState<string | null>(null);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  // Practice Quiz State
  const [aiQuizSubject, setAiQuizSubject] = useState('Mathematics (Algebra & Proofs)');
  const [aiQuizQuestions, setAiQuizQuestions] = useState<any[] | null>([
    {
      id: 'q1',
      question: 'In the quadratic equation ax² + bx + c = 0, what does the discriminant (b² - 4ac) determine?',
      options: ['The sum of the roots', 'The number and nature of real roots', 'The y-intercept', 'The vertex coordinate'],
      correctAnswer: 1,
      selectedAnswer: null,
      explanation: 'The discriminant b² - 4ac indicates whether the quadratic has 2 distinct real roots (>0), 1 repeated real root (=0), or complex roots (<0).'
    },
    {
      id: 'q2',
      question: 'Which property guarantees that if a line is tangent to a circle, it is perpendicular to the radius at the point of contact?',
      options: ['Pythagorean Theorem', 'Radius-Tangent Theorem', 'Chord Inscribed Theorem', 'Secant Segment Rule'],
      correctAnswer: 1,
      selectedAnswer: null,
      explanation: 'The Radius-Tangent Theorem states that a tangent to a circle is always perpendicular to the radius drawn to the point of tangency.'
    }
  ]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Note Summarizer State
  const [aiNoteText, setAiNoteText] = useState('Photosynthesis takes place in chloroplasts. Chlorophyll absorbs solar radiation to drive the light-dependent reaction, generating ATP and NADPH. In the Calvin Cycle (light-independent), carbon dioxide is fixed by RuBisCO to synthesize glucose (C6H12O6).');
  const [aiNoteSummaryResult, setAiNoteSummaryResult] = useState<any | null>(null);

  // Recommended Study Plan State
  const [aiStudyPlanTarget, setAiStudyPlanTarget] = useState('Target GPA 3.90 for Term 3 Finals');
  const [aiGeneratedStudyPlan, setAiGeneratedStudyPlan] = useState<any[] | null>([
    { day: 'Monday (04:30 PM - 06:00 PM)', subject: 'Organic Chemistry (CHEM-202)', activity: 'Practice Electrophilic Addition reaction mechanisms & mechanism diagrams.', focus: 'Weak Topic (+5% boost needed)' },
    { day: 'Wednesday (05:00 PM - 06:30 PM)', subject: 'World History (HIST-102)', activity: 'Draft 3 essay thesis statements with chronological citations.', focus: 'Essay Formatting Boost' },
    { day: 'Friday (04:00 PM - 05:30 PM)', subject: 'Mathematics (MATH-101)', activity: 'Solve past exam questions on polynomial derivations.', focus: 'Mastery Consolidation' }
  ]);

  // Curriculum Q&A State
  const [aiQaPrompt, setAiQaPrompt] = useState('Can you explain Newton’s Second Law of Motion with a real-life example?');
  const [aiQaResponse, setAiQaResponse] = useState<string | null>(null);

  // Identified Weak Topics Data
  const [weakTopicsData] = useState<any[]>([
    {
      id: 'w1',
      subject: 'Organic Chemistry (CHEM-202)',
      topicName: 'Electrophilic Addition Reactions & Reaction Intermediates',
      masteryScore: 72,
      status: 'High Priority Focus Area',
      recommendation: 'Complete 3 revision sessions on carbocation stability with AI Copilot.',
      badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    },
    {
      id: 'w2',
      subject: 'World History (HIST-102)',
      topicName: 'Comparative Analysis & Historical Thesis Citation Formatting',
      masteryScore: 78,
      status: 'Moderate Focus Area',
      recommendation: 'Review Chicago Style footnote citations and primary source analysis.',
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    },
    {
      id: 'w3',
      subject: 'Modern Physics (PHYS-201)',
      topicName: 'Photoelectric Effect & Work Function Calculations',
      masteryScore: 82,
      status: 'Consolidation Required',
      recommendation: 'Practice 5 problem sets on Planck’s constant equation E = hf.',
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    }
  ]);

  // Digital Student ID Card & Multi-Use Smart Badge State
  const [idCardSide, setIdCardSide] = useState<'front' | 'back'>('front');
  const [idCardToast, setIdCardToast] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState('SCH-QR-8842-9901-SEC');

  const [idCardUseLogs] = useState<any[]>([
    {
      id: 'ul1',
      system: 'Attendance RFID Scanner',
      systemIcon: '🗓️',
      action: 'Morning Assembly Gate Check-in',
      status: 'Verified ✓',
      time: 'Today, 07:42 AM',
      location: 'Main School Entrance Gate B',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    },
    {
      id: 'ul2',
      system: 'Cafeteria POS Scanner',
      systemIcon: '🍽️',
      action: 'Meal Plan Debit (₦1,200 Lunch Combo)',
      status: 'Approved ✓',
      time: 'Yesterday, 01:15 PM',
      location: 'Central Dining Hall Counter #2',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    },
    {
      id: 'ul3',
      system: 'Library Checkout Scanner',
      systemIcon: '📚',
      action: 'Book Loan Scan: "Introduction to Algorithms"',
      status: 'Active Loan',
      time: 'July 28, 2026 at 03:40 PM',
      location: 'School Library Desk #1',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    },
    {
      id: 'ul4',
      system: 'Exam Hall Verification',
      systemIcon: '✍️',
      action: 'Midterm Exam Hall Entry & Desk #24 Slip',
      status: 'Cleared ✓',
      time: 'July 24, 2026 at 08:45 AM',
      location: 'Main Auditorium Exam Desk #24',
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-300'
    }
  ]);

  // Settings & Student Preferences Center Interactive State
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr' | 'es' | 'ha' | 'yo' | 'ig'>('en');
  const [settingsToast, setSettingsToast] = useState<string | null>(null);

  // Notification Preferences State
  const [notifPushPref, setNotifPushPref] = useState(true);
  const [notifEmailPref, setNotifEmailPref] = useState(true);
  const [notifSmsPref, setNotifSmsPref] = useState(true);
  const [notifAssignmentsPref, setNotifAssignmentsPref] = useState(true);
  const [notifGradesPref, setNotifGradesPref] = useState(true);
  const [notifFeeRemindersPref, setNotifFeeRemindersPref] = useState(true);

  // Password Change State
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  // 2FA Security State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpCodeInput, setTotpCodeInput] = useState('');
  const [backupCodes] = useState<string[]>([
    '8A4K-92X1', '7L3M-44P9', '2W8Q-11N7', '9C5T-66J3', '4V2P-88K0'
  ]);

  // Active Sessions Data
  const [activeLoginSessions, setActiveLoginSessions] = useState<any[]>([
    { id: 's1', device: 'Chrome on Windows 11 (This Device)', location: 'Lagos, Nigeria', ip: '102.89.44.12', time: 'Active Now', current: true },
    { id: 's2', device: 'Safari on iPhone 15 Pro', location: 'Lagos, Nigeria', ip: '102.89.44.89', time: 'Today at 02:15 PM', current: false },
    { id: 's3', device: 'EduPage Android App v4.2', location: 'Abuja, Nigeria', ip: '197.210.8.55', time: 'Yesterday at 09:30 AM', current: false }
  ]);

  // Help & Support Desk Interactive State
  const [supportSubTab, setSupportSubTab] = useState<'faqs' | 'tickets' | 'ict_contact' | 'report_issue'>('faqs');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [supportToast, setSupportToast] = useState<string | null>(null);

  // New Support Ticket Form State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('ICT & Portal Login');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');

  // Active Support Tickets List
  const [supportTickets, setSupportTickets] = useState<any[]>([
    {
      id: 'TICK-8842-01',
      category: 'ICT & Portal Login',
      subject: 'Unable to access Chemistry LMS virtual lab simulator link',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Mr. Gabriel (ICT Lead)',
      createdAt: 'Yesterday at 04:30 PM',
      updatedAt: '2 hours ago',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    },
    {
      id: 'TICK-8842-02',
      category: 'Library & E-Resources',
      subject: 'E-Book renewal request for "Introduction to Algorithms"',
      priority: 'Low',
      status: 'Resolved ✓',
      assignedTo: 'Mrs. Fatima (Head Librarian)',
      createdAt: 'July 26, 2026 at 11:15 AM',
      updatedAt: 'July 27, 2026',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    },
    {
      id: 'TICK-8842-03',
      category: 'Hostel Maintenance',
      subject: 'Hot water heater pressure low in Nelson Mandela Hall Room 204',
      priority: 'Medium',
      status: 'Open',
      assignedTo: 'Facilities Maintenance Team',
      createdAt: 'Today at 08:10 AM',
      updatedAt: 'Just now',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    }
  ]);

  // Frequently Asked Questions (FAQs) Knowledge Base Data
  const [faqList] = useState<any[]>([
    {
      id: 'f1',
      category: 'Portal & Passwords',
      question: 'How do I reset my portal password or update my email address?',
      answer: 'Navigate to the Settings tab in your portal and fill in the Password & Account Security section. For email updates, contact the School Registrar.'
    },
    {
      id: 'f2',
      category: 'Portal & Passwords',
      question: 'What should I do if my Digital Student ID QR Code fails at the cafeteria scanner?',
      answer: 'Ensure your phone screen brightness is set to high. If the issue persists, click "Refresh QR Token" on your Digital ID card page or visit the ICT Helpdesk.'
    },
    {
      id: 'f3',
      category: 'Academics & Transcripts',
      question: 'Where can I download my official term report card and academic transcript?',
      answer: 'Go to the Official Documents tab or the Academic Grades tab to view high-resolution PDF report cards, digital ID slips, and multi-year transcripts.'
    },
    {
      id: 'f4',
      category: 'Fees & Payments',
      question: 'How do installment fee plans work and can I pay online?',
      answer: 'Tuition fees are structured into approved term installments under the Fees Ledger tab. You can pay online via Debit Card, Mobile Money (MoMo), or Bank Transfer.'
    },
    {
      id: 'f5',
      category: 'Hostel & Transport',
      question: 'How do I check my morning bus pickup time and driver contact?',
      answer: 'Open the School Transport tab to view your assigned bus route, pickup stop schedule (e.g. 07:15 AM at Victoria Island Junction), and live driver contact details.'
    }
  ]);

  // Advanced Professional SMS Feature Suite State
  // 1. Adaptive School Level Dashboard State
  const [schoolLevel, setSchoolLevel] = useState<'primary' | 'junior' | 'senior'>('senior');

  // 2. Role-Aware Prefect / Student Leader State
  const [studentLeadershipRole, setStudentLeadershipRole] = useState<'head_prefect' | 'library_prefect' | 'sports_captain' | 'standard'>('head_prefect');
  const [prefectToast, setPrefectToast] = useState<string | null>(null);

  // 3. Offline-First & Sync Engine State
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncQueue, setPendingSyncQueue] = useState<any[]>([
    { id: 'sq1', type: 'Offline Note Draft', detail: 'Organic Chemistry Calvin Cycle Notes', timestamp: '10 mins ago' },
    { id: 'sq2', type: 'Assignment Submission Draft', detail: 'Physics Homework PDF', timestamp: '5 mins ago' }
  ]);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // 4. Real-Time WebSocket Channel State
  const [webSocketStatus, setWebSocketStatus] = useState<'connected' | 'reconnecting'>('connected');
  const [liveSocketEvents] = useState<any[]>([
    { id: 'se1', text: '🔔 New Math Assignment Posted: Homework #5 due Friday', time: 'Just now' },
    { id: 'se2', text: '🗓️ Gate RFID Attendance Check-in Verified (07:42 AM)', time: '2 mins ago' }
  ]);

  // 5. Progressive Web App (PWA) Install Prompt State
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaToast, setPwaToast] = useState<string | null>(null);

  // 6. Accessibility Settings State
  const [accessibilityTextSize, setAccessibilityTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isHighContrast, setIsHighContrast] = useState(false);

  // 7. Student Career Portfolio Showcase Data
  const [portfolioProjects] = useState<any[]>([
    { id: 'p1', title: 'Solar Powered Hydroponics Farming Kit', category: 'STEM Research Project', date: 'May 2026', grade: 'Grade A+ (Distinction)', desc: 'Engineered a micro-controller automated nutrient feeding system for indoor school greenhouse.' },
    { id: 'p2', title: 'Comparative Analysis of African Post-Colonial Literature', category: 'Literature Essay', date: 'March 2026', grade: 'Published in School Journal', desc: 'Critical breakdown of narrative structures in Chinua Achebe and Wole Soyinka works.' }
  ]);
  const [portfolioCertificates] = useState<any[]>([
    { id: 'cert1', title: 'WAEC Senior STEM Excellence Certification', issuer: 'West African Examinations Council', year: '2026', badge: '📜 Verified Credential' },
    { id: 'cert2', title: 'National Mathematics Olympiad Finalist', issuer: 'National Mathematical Centre', year: '2025', badge: '🥇 Gold Medalist' },
    { id: 'cert3', title: 'Red Cross First Aid & CPR Certification', issuer: 'Nigerian Red Cross Society', year: '2024', badge: '🏥 Active Certified' }
  ]);
  const [portfolioExtracurriculars] = useState<any[]>([
    { id: 'ex1', role: 'President & Founder', club: 'Debate & Public Speaking Society', period: '2025 — Present', impact: 'Led 12-member team to National High School Debate Finals victory.' },
    { id: 'ex2', role: 'Team Captain', club: 'Mandela House First Eleven Football Squad', period: '2024 — 2026', impact: 'Captained House to Inter-House Sports Championship Trophy.' }
  ]);

  const [chatChannels, setChatChannels] = useState<any[]>([
    {
      id: 'c1',
      name: 'Mr. Kwame Darko (Math Teacher)',
      type: 'direct',
      avatar: 'KD',
      role: 'Mathematics Educator',
      online: true,
      status: 'Teaching 👨‍🏫',
      unread: 2,
      isPinned: true,
      messages: [
        { id: 'm101', senderId: 'teacher1', senderName: 'Mr. Kwame Darko', text: 'Hello Emeka! I reviewed your polynomial derivation steps in homework 4.', time: '04:15 PM', date: 'Today', status: 'read', reactions: { '👍': 2 } },
        { id: 'm102', senderId: 'teacher1', senderName: 'Mr. Kwame Darko', text: 'You demonstrated excellent mathematical rigor for problem 8. Please make sure to bring your formula sheet to Friday\'s review session.', time: '04:30 PM', date: 'Today', status: 'read', reactions: { '🔥': 1 } }
      ]
    },
    {
      id: 'c2',
      name: 'SS2 Blue Class Group',
      type: 'group',
      avatar: 'SS2',
      role: 'Class Channel (42 Members)',
      online: true,
      status: 'Active Group',
      unread: 1,
      isPinned: true,
      messages: [
        { id: 'm201', senderId: 'student2', senderName: 'David Chen', text: 'Hey everyone, remember we have chemistry lab tomorrow at 11:00 AM.', time: '01:45 PM', date: 'Today', status: 'read', reactions: { '✅': 4 } },
        { id: 'm202', senderId: 'student3', senderName: 'Amina Yusuf', text: 'Does anyone have the chemistry lab titration outline PDF?', time: '02:15 PM', date: 'Today', status: 'read', reactions: {} }
      ]
    },
    {
      id: 'c3',
      name: 'Mrs. Beatrice Mensah (Chemistry)',
      type: 'direct',
      avatar: 'BM',
      role: 'Chemistry Educator',
      online: false,
      status: 'In Lab 🥼',
      unread: 0,
      isPinned: false,
      messages: [
        { id: 'm301', senderId: 'teacher2', senderName: 'Mrs. Beatrice Mensah', text: 'Safety goggles and official white lab coats are compulsory for tomorrow\'s titration lab in Lab B.', time: 'Yesterday 10:15 AM', date: 'Yesterday', status: 'read', reactions: { '👍': 3 } }
      ]
    },
    {
      id: 'c4',
      name: 'Dr. Stella Gbandi (English)',
      type: 'direct',
      avatar: 'SG',
      role: 'Literature Educator',
      online: true,
      status: 'Available 👋',
      unread: 0,
      isPinned: false,
      messages: [
        { id: 'm401', senderId: 'teacher3', senderName: 'Dr. Stella Gbandi', text: 'Your Hamlet soliloquy critical essay analysis was very insightful. Excellent work!', time: 'July 26 09:30 AM', date: 'July 26', status: 'read', reactions: { '❤️': 2 } }
      ]
    },
    {
      id: 'c5',
      name: 'School Administration Office',
      type: 'direct',
      avatar: 'SA',
      role: 'School Admin Office',
      online: true,
      status: 'Office Hours 🏢',
      unread: 0,
      isPinned: false,
      messages: [
        { id: 'm501', senderId: 'admin1', senderName: 'School Admin', text: 'Official Notice: The Term 2 examination timetable and hall seat dockets are now published on your student portal.', time: 'July 25 09:00 AM', date: 'July 25', status: 'read', reactions: { '📢': 5 } }
      ]
    }
  ]);
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
    { id: 'id-card', label: 'Digital Student ID', icon: QrCode },
    { id: 'portfolio', label: 'Career Portfolio', icon: Briefcase },
    { id: 'academics', label: 'Academic & Grades', icon: Award },
    { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp },
    { id: 'timetable', label: 'Timetable & Exams', icon: Clock },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'messages', label: 'Internal Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notification Center', icon: Bell },
    { id: 'assignments', label: 'Assignments Desk', icon: BookOpenCheck },
    { id: 'lms', label: 'LMS Courses', icon: BookOpen },
    { id: 'library', label: 'Library Hub', icon: BookMarked },
    { id: 'activities', label: 'School Life', icon: Trophy },
    { id: 'welfare', label: 'Health & Conduct', icon: Heart },
    { id: 'hostel', label: 'Hostel Module', icon: Landmark },
    { id: 'transport', label: 'School Transport', icon: Bus },
    { id: 'documents', label: 'Official Documents', icon: FolderDown },
    { id: 'finance', label: 'Fees Ledger', icon: DollarSign },
    { id: 'ai-copilot', label: 'AI Study Copilot', icon: Brain },
    { id: 'productivity', label: 'Productivity Logs', icon: CheckSquare },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!mounted) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="animate-pulse space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent)/0.2)] mx-auto" />
          <p className="text-xs font-mono text-[hsl(var(--text-tertiary))]">Loading Student Portal Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in px-4 sm:px-6 lg:px-8 pb-12">
      {/* Top Controls Toolbar with Advanced SMS Features Suite */}
      <div className="space-y-3 pb-3 border-b border-[hsl(var(--border))]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: Branding & Adaptive School Level Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-extrabold uppercase tracking-wider">
              Student Portal Enterprise
            </span>

            {/* 1. ADAPTIVE SCHOOL LEVEL SELECTOR */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] text-xs font-bold">
              {[
                { id: 'primary', label: '🎒 Primary' },
                { id: 'junior', label: '🏫 Junior High' },
                { id: 'senior', label: '🎓 Senior High' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setSchoolLevel(lvl.id as any);
                    if (lvl.id === 'primary') setViewMode('simple');
                    else setViewMode('advanced');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    schoolLevel === lvl.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* 2. ROLE-AWARE PREFECT / STUDENT LEADER SELECTOR */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-bold">
              <span className="text-[10px] text-purple-400 font-mono px-1 uppercase">Role:</span>
              <select
                value={studentLeadershipRole}
                onChange={e => {
                  setStudentLeadershipRole(e.target.value as any);
                  setPrefectToast(`Switched active role tools to: ${e.target.value.replace('_', ' ').toUpperCase()}`);
                  setTimeout(() => setPrefectToast(null), 3000);
                }}
                className="bg-transparent text-purple-200 font-bold text-xs focus:outline-none"
              >
                <option value="standard" className="bg-slate-900 text-white">Standard Student</option>
                <option value="head_prefect" className="bg-slate-900 text-white">👑 Head Prefect</option>
                <option value="library_prefect" className="bg-slate-900 text-white">📚 Library Prefect</option>
                <option value="sports_captain" className="bg-slate-900 text-white">🏆 Sports Captain</option>
              </select>
            </div>
          </div>

          {/* Right: Offline Status, Real-Time WS Ticker, PWA Install & Accessibility */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 3. OFFLINE-FIRST SYNC ENGINE STATUS */}
            <button
              onClick={() => {
                if (pendingSyncQueue.length > 0) {
                  setSyncToast(`Synchronized ${pendingSyncQueue.length} pending items with cloud server!`);
                  setPendingSyncQueue([]);
                  setTimeout(() => setSyncToast(null), 3500);
                }
              }}
              className={`px-3 py-1 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                isOnline
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {isOnline ? `Online (Sync Queue: ${pendingSyncQueue.length})` : 'Offline Mode (Sync Pending)'}
            </button>

            {/* 4. REAL-TIME WEBSOCKET TICKER */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono">
              <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
              <span>WS Live 🟢</span>
            </div>

            {/* 5. PWA INSTALL PROMPT */}
            {!pwaInstalled && (
              <button
                onClick={() => {
                  setPwaInstalled(true);
                  setPwaToast('EduPage School SaaS PWA installed to device home screen!');
                  setTimeout(() => setPwaToast(null), 3500);
                }}
                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1 transition-all"
              >
                📱 Install App
              </button>
            )}

            {/* 6. ACCESSIBILITY CONTROLS */}
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                isHighContrast
                  ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))]'
              }`}
              title="Toggle High-Contrast Mode for Accessibility"
            >
              ⚡ High-Contrast
            </button>
          </div>
        </div>

        {/* ROLE-AWARE PREFECT ACTION BANNER */}
        {studentLeadershipRole !== 'standard' && (
          <div className="p-3 rounded-2xl border border-purple-500/30 bg-purple-500/15 text-purple-200 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <div>
                <span className="font-extrabold text-purple-300 uppercase tracking-wider font-mono text-[10px]">
                  ACTIVE STUDENT LEADERSHIP TOOLSUITE ({studentLeadershipRole.replace('_', ' ').toUpperCase()})
                </span>
                <p className="text-[11px] text-purple-200/90 font-normal">
                  {studentLeadershipRole === 'head_prefect' && 'Permission granted: Mark class morning assembly attendance & manage prefect roster.'}
                  {studentLeadershipRole === 'library_prefect' && 'Permission granted: Scan overdue book returns & send reading reminders.'}
                  {studentLeadershipRole === 'sports_captain' && 'Permission granted: Record inter-house tournament scores & track house points.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setPrefectToast(`Action executed for ${studentLeadershipRole.replace('_', ' ')}!`);
                setTimeout(() => setPrefectToast(null), 3000);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all self-start sm:self-center"
            >
              Launch Leader Console
            </button>
          </div>
        )}

        {/* TOAST NOTIFICATIONS FOR PREFECT, SYNC, PWA */}
        {(prefectToast || syncToast || pwaToast) && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 text-xs font-extrabold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4" /> {prefectToast || syncToast || pwaToast}
          </div>
        )}
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

                {/* 1.5 ONE-CLICK QUICK ACTIONS SUITE (8 SHORTCUTS) */}
                <div className="glass-card p-6 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-indigo-500/20 pb-3">
                    <div>
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" /> One-Click Student Quick Actions
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Instant shortcuts for your daily academic tasks, submissions, timetable, and teacher DMs.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black border border-amber-500/30">
                      8 SHORTCUTS READY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {[
                      { id: 'tt', label: "Today's Timetable", icon: Clock, tab: 'timetable', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20' },
                      { id: 'sub', label: 'Submit Assignment', icon: BookOpenCheck, tab: 'assignments', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20' },
                      { id: 'res', label: 'Check Results', icon: Award, tab: 'academics', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' },
                      { id: 'att', label: 'View Attendance', icon: CalendarCheck, tab: 'attendance', color: 'border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20' },
                      { id: 'rep', label: 'Report Card', icon: Download, action: 'Downloaded Official Term PDF Report Card!', color: 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20' },
                      { id: 'msg', label: 'Message Teacher', icon: MessageSquare, tab: 'messages', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' },
                      { id: 'cal', label: 'Open Calendar', icon: Calendar, tab: 'calendar', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20' },
                      { id: 'lib', label: 'Learning Hub', icon: BookMarked, tab: 'library', color: 'border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20' }
                    ].map(qa => {
                      const Icon = qa.icon;
                      return (
                        <button
                          key={qa.id}
                          onClick={() => {
                            if (qa.tab) setActiveTab(qa.tab as any);
                            else if (qa.action) handleAction(qa.action);
                          }}
                          className={`p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-1 ${qa.color}`}
                        >
                          <div className="p-2 rounded-xl bg-slate-950/40 border border-white/10">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-extrabold leading-tight text-center">{qa.label}</span>
                        </button>
                      );
                    })}
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

            {/* Tab 1.5: Student Profile & Identity Record */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fade-in">
                {/* Profile Header & Action Banner */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.05)] rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] text-[11px] font-extrabold tracking-wider uppercase border border-[hsl(var(--accent)/0.3)]">
                        Student Identity &amp; Registry Profile
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Student Profile Record
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Official student Information, contact preferences, parent/guardian details, address, admission history, and medical health ledger.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleAction('Student Profile Changes Saved Successfully!');
                      }}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 self-start sm:self-center"
                    >
                      <Save className="w-4 h-4" /> Save Profile Changes
                    </button>
                  </div>
                </div>

                {/* Photo & Identity Avatar Banner Card */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar Photo Container */}
                    <div className="relative group flex-shrink-0">
                      <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[hsl(var(--accent))] to-purple-600 flex items-center justify-center font-black text-white text-3xl shadow-xl border-4 border-[hsl(var(--bg-secondary))] overflow-hidden">
                        EO
                      </div>
                      <button
                        onClick={() => handleAction('Photo Upload Triggered')}
                        className="absolute inset-0 bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 transition-all rounded-3xl flex flex-col items-center justify-center text-[10px] font-bold gap-1"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Change Photo</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                          🟢 Active Enrolled Student
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-[10px] font-extrabold border border-[hsl(var(--accent)/0.2)]">
                          Matric ID: {studentData.studentId}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                          {studentData.className}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))]">{studentData.fullName}</h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                        {studentData.house} &bull; Science &amp; Technology Track &bull; Boarding Resident
                      </p>

                      <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
                        <button
                          onClick={() => handleAction('Photo Upload Requested')}
                          className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Upload New Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-Column Profile Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* 1. Contact Information (Editable) */}
                    <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-5 shadow-xl">
                      <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-[hsl(var(--accent))]" /> Contact Information
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Editable
                        </span>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                            Preferred Display Name
                          </label>
                          <input
                            type="text"
                            defaultValue={studentData.fullName}
                            className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              Student Mobile Phone
                            </label>
                            <input
                              type="text"
                              defaultValue="+234-802-111-0022"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl font-mono text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              Emergency Contact Phone
                            </label>
                            <input
                              type="text"
                              defaultValue="+234-803-333-4455"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl font-mono text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                            Student Email Address
                          </label>
                          <input
                            type="email"
                            defaultValue="emeka.obi@student.school.edu"
                            className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Parent & Guardian Information (Editable Contact) */}
                    <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-5 shadow-xl">
                      <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <Users className="w-5 h-5 text-indigo-400" /> Parent &amp; Guardian Information
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Editable
                        </span>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              Primary Guardian Name
                            </label>
                            <input
                              type="text"
                              defaultValue="Chief Chukwudi Obi"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              Relationship to Student
                            </label>
                            <input
                              type="text"
                              defaultValue="Father / Primary Sponsor"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              Guardian Phone Number
                            </label>
                            <input
                              type="text"
                              defaultValue="+234-803-333-4455"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl font-mono text-xs text-[hsl(var(--text-primary))]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              Guardian Email Address
                            </label>
                            <input
                              type="email"
                              defaultValue="chukwudi.obi@example.com"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                            Secondary Guardian / Mother
                          </label>
                          <input
                            type="text"
                            defaultValue="Dr. Florence Obi (Mother • +234-802-555-6677)"
                            className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Residential Address (Editable) */}
                    <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-5 shadow-xl">
                      <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <Landmark className="w-5 h-5 text-amber-400" /> Home Residential Address
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Editable
                        </span>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                            Street Home Address
                          </label>
                          <input
                            type="text"
                            defaultValue="14 Victoria Garden City Boulevard, Lekki Phase 1"
                            className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              City / Local Govt
                            </label>
                            <input
                              type="text"
                              defaultValue="Lekki / Eti-Osa LGA"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                              State &amp; Country
                            </label>
                            <input
                              type="text"
                              defaultValue="Lagos State, Nigeria"
                              className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* 4. Admission Details (Locked Registry Record 🔒) */}
                    <div className="glass-card p-6 sm:p-8 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-5 shadow-xl">
                      <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-purple-400" /> Admission &amp; Enrolment Record
                        </h3>
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                          🔒 Locked Official Record
                        </span>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex justify-between items-center">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Official Full Registered Name</span>
                          <span className="font-extrabold text-[hsl(var(--text-primary))]">{studentData.fullName}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex justify-between items-center">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Admission / Matriculation ID</span>
                          <span className="font-mono font-extrabold text-purple-400">{studentData.studentId}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex justify-between items-center">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Admission Enrolment Date</span>
                          <span className="font-mono font-bold text-[hsl(var(--text-primary))]">September 15, 2024</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex justify-between items-center">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Current Grade &amp; Track</span>
                          <span className="font-extrabold text-emerald-400">{studentData.className}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex justify-between items-center">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Enrolment Status</span>
                          <span className="font-bold text-sky-400">Full-time Boarding Student</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex justify-between items-center">
                          <span className="text-[hsl(var(--text-tertiary))] font-semibold">Assigned School House</span>
                          <span className="font-bold text-amber-400">🌟 {studentData.house}</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Medical & Health Information */}
                    <div className="glass-card p-6 sm:p-8 border border-rose-500/20 bg-rose-500/5 rounded-3xl space-y-5 shadow-xl">
                      <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <Heart className="w-5 h-5 text-rose-400" /> Medical &amp; Clinical Health Record
                        </h3>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Emergency Record
                        </span>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block">Blood Group</span>
                            <span className="text-base font-black text-rose-400">O+ Positive 🔒</span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase block">Genotype</span>
                            <span className="text-base font-black text-emerald-400">AA 🔒</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-rose-400 mb-1">
                            Known Allergies &amp; Dietary Sensitivities
                          </label>
                          <input
                            type="text"
                            defaultValue="Mild Peanut Allergy (EpiPen in Clinic), Dust Sensitive"
                            className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-[hsl(var(--text-tertiary))] mb-1">
                            Medical Conditions &amp; Chronic Notes
                          </label>
                          <textarea
                            rows={2}
                            defaultValue="Mild exercise-induced asthma (Ventolin inhaler on file in clinic)."
                            className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))]"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[11px] text-[hsl(var(--text-secondary))] space-y-1">
                          <p>🩺 <strong>School Physician:</strong> Dr. Abigail Taylor (School Clinic)</p>
                          <p>✅ <strong>Emergency Treatment Permission:</strong> Granted by Parent/Guardian</p>
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

            {/* Tab 2.5: Digital Student Identity Card & Smart Pass */}
            {activeTab === 'id-card' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="glass-card p-6 sm:p-8 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-extrabold tracking-wider uppercase border border-purple-500/30">
                        Campus Identity &amp; Smart Pass Registry
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1 flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-purple-400" /> Digital Student Identity Card
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Official encrypted digital badge with QR code, barcode ID, photo, house, and class details. Valid for Attendance, Library, Cafeteria, and Exams.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                      <button
                        onClick={() => setIdCardSide(idCardSide === 'front' ? 'back' : 'front')}
                        className="px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4 text-purple-400" /> Flip Card ({idCardSide === 'front' ? 'Show Back' : 'Show Front'})
                      </button>

                      <button
                        onClick={() => {
                          setIdCardToast('Downloaded Digital PVC ID Card (High-Res PDF & PNG)');
                          setTimeout(() => setIdCardToast(null), 3500);
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download ID Card
                      </button>
                    </div>
                  </div>

                  {idCardToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {idCardToast}
                    </div>
                  )}
                </div>

                {/* INTERACTIVE DIGITAL PVC ID BADGE */}
                <div className="max-w-xl mx-auto">
                  {idCardSide === 'front' ? (
                    /* ID CARD FRONT SIDE */
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-2 border-purple-500/40 text-white space-y-6 shadow-2xl relative overflow-hidden transition-all duration-500">
                      {/* Background Watermark Crest */}
                      <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl pointer-events-none select-none">
                        🏫
                      </div>

                      {/* Header Title */}
                      <div className="flex justify-between items-start border-b border-purple-500/30 pb-4">
                        <div>
                          <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest block font-bold">ALBERT ACADEMY SENIOR HIGH</span>
                          <h3 className="text-base font-black tracking-tight text-white mt-0.5">OFFICIAL STUDENT IDENTIFICATION</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE
                        </span>
                      </div>

                      {/* Photo Avatar & Details Row */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Student Photo */}
                        <div className="relative">
                          <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center font-black text-3xl text-white border-2 border-white/20 shadow-2xl">
                            EO
                          </div>
                          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-mono font-bold border border-white/30 shadow">
                            SS2
                          </span>
                        </div>

                        {/* Core Student Information Fields */}
                        <div className="space-y-2 text-center sm:text-left flex-1">
                          <h4 className="text-xl font-black text-white leading-tight tracking-tight">{studentData.fullName}</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono text-slate-300 pt-1">
                            <div>
                              <span className="text-[9px] text-purple-300 uppercase block font-bold">Student ID</span>
                              <span className="font-bold text-white">{studentData.studentId}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-purple-300 uppercase block font-bold">Class Grade</span>
                              <span className="font-bold text-white">{studentData.className}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-purple-300 uppercase block font-bold">House</span>
                              <span className="font-bold text-amber-300">🏠 {studentData.house}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-purple-300 uppercase block font-bold">Validity</span>
                              <span className="text-slate-300">2024 — 2027</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* High-Density Barcode Rendering */}
                      <div className="pt-4 border-t border-purple-500/30 text-center space-y-1">
                        <div className="font-mono text-2xl tracking-[0.3em] font-black text-slate-300 select-none">
                          ║█║ █║▌│█║▌│ 8842-9901 ║█║
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-purple-300 pt-1">
                          <span>BARCODE &amp; RFID ENCRYPTED</span>
                          <span className="text-amber-400 font-bold">CAMPUS PASS VALIDATED</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ID CARD BACK SIDE */
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-2 border-purple-500/40 text-white space-y-6 shadow-2xl relative overflow-hidden transition-all duration-500">
                      <div className="flex justify-between items-center border-b border-purple-500/30 pb-3">
                        <span className="text-[10px] font-mono text-purple-300 uppercase font-bold tracking-wider">OFFICIAL SECURITY TOKEN &amp; DISCLOSURE</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">CARD BACK SIDE</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        {/* QR Code Container */}
                        <div className="p-4 rounded-2xl bg-white text-slate-950 text-center space-y-2 shadow-xl border-2 border-purple-400">
                          <div className="w-32 h-32 mx-auto bg-slate-950 p-2 rounded-xl flex items-center justify-center text-white font-mono text-xs font-bold leading-tight">
                            [ SCANNABLE QR TOKEN ]
                          </div>
                          <span className="text-[9px] font-mono text-slate-600 block truncate">{qrToken}</span>
                          <button
                            onClick={() => {
                              setQrToken(`SCH-QR-8842-${Math.floor(1000 + Math.random() * 9000)}-SEC`);
                              setIdCardToast('Refreshed Encrypted Security QR Token!');
                              setTimeout(() => setIdCardToast(null), 3000);
                            }}
                            className="px-3 py-1 rounded bg-purple-600 text-white font-bold text-[10px] hover:bg-purple-700 transition-all"
                          >
                            Refresh QR Token
                          </button>
                        </div>

                        {/* Back Disclosures & Contacts */}
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-[10px] text-purple-300 font-bold uppercase block">Emergency Guardian Contact</span>
                            <p className="font-bold text-white mt-0.5">Mr. Chidi Obi (+234 802 555 1199)</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-purple-300 font-bold uppercase block">Medical Notice</span>
                            <p className="text-rose-400 font-bold mt-0.5">Asthma Inhaler in backpack &bull; Penicillin Allergy</p>
                          </div>
                          <div className="pt-2 border-t border-purple-500/30 text-[10px] text-slate-400 leading-relaxed">
                            This card is official property of Albert Academy. Found cards should be returned to Campus Security or Student Registry.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4 MULTI-USE CAMPUS INTEGRATION SERVICES */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl">
                  <div className="border-b border-[hsl(var(--border))] pb-3">
                    <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                      ⚡ Multi-Use Digital ID Campus Integration Hub
                    </h3>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">Use your Digital Student ID for automated campus access, cafeteria meals, library loans, and exam entry.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Attendance */}
                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 text-xs shadow-md">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">🗓️</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">ACTIVE PASS</span>
                      </div>
                      <h4 className="font-black text-[hsl(var(--text-primary))] text-sm">Attendance RFID</h4>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">Morning Assembly Gate check-in at 07:42 AM (On Time ✓).</p>
                    </div>

                    {/* 2. Library */}
                    <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-2 text-xs shadow-md">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">📚</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">2 LOANS ACTIVE</span>
                      </div>
                      <h4 className="font-black text-[hsl(var(--text-primary))] text-sm">Library Pass</h4>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">Scannable barcode for borrowing books &amp; digital library access.</p>
                    </div>

                    {/* 3. Cafeteria */}
                    <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2 text-xs shadow-md">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">🍽️</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">₦18,500 CREDIT</span>
                      </div>
                      <h4 className="font-black text-[hsl(var(--text-primary))] text-sm">Cafeteria Meal Plan</h4>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">POS contactless tap-to-pay for dining hall lunch combos.</p>
                    </div>

                    {/* 4. Exams */}
                    <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2 text-xs shadow-md">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">✍️</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">DESK #24 VERIFIED</span>
                      </div>
                      <h4 className="font-black text-[hsl(var(--text-primary))] text-sm">Exam Docket Pass</h4>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">QR verification for exam hall entry and seat assignment verification.</p>
                    </div>
                  </div>
                </div>

                {/* RECENT ID SCAN AUDIT LOGS */}
                <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                    📋 Recent Smart ID Scan Audit Trail
                  </h3>
                  <div className="space-y-3">
                    {idCardUseLogs.map(log => (
                      <div key={log.id} className={`p-4 rounded-2xl border ${log.color} flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs shadow-md`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{log.systemIcon}</span>
                          <div>
                            <h4 className="font-extrabold text-[hsl(var(--text-primary))]">{log.action}</h4>
                            <p className="text-[11px] text-[hsl(var(--text-tertiary))] font-mono">{log.location} &bull; {log.system}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-center">
                          <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{log.time}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2.8: Student Career Portfolio Showcase */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6 animate-fade-in text-xs">
                {/* Header Banner */}
                <div className="glass-card p-6 sm:p-8 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-extrabold tracking-wider uppercase border border-purple-500/30">
                        Multi-Year Career &amp; Academic Portfolio
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-purple-400" /> Student Career Portfolio &amp; Showcase
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Collect research projects, certified credentials, Olympiad awards, and extracurricular leadership achievements throughout your school career.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                      <button
                        onClick={() => handleAction('Exported Official Student Portfolio PDF')}
                        className="px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4 text-purple-400" /> Portfolio PDF
                      </button>

                      <button
                        onClick={() => handleAction('Copied Public Shareable Portfolio Link!')}
                        className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" /> Share Portfolio Link
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1. PROJECTS & RESEARCH SHOWCASE */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
                    🚀 Research Projects &amp; Academic Artifacts
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolioProjects.map(proj => (
                      <div key={proj.id} className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2 shadow-md">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-purple-300 uppercase font-bold">{proj.category}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            {proj.grade}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{proj.title}</h4>
                        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{proj.desc}</p>
                        <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] block pt-2 border-t border-purple-500/20">Completed: {proj.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. CERTIFICATES & AWARDS */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
                    📜 Certified Credentials &amp; Olympiad Awards
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {portfolioCertificates.map(cert => (
                      <div key={cert.id} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-2 shadow-md">
                        <span className="text-xs font-bold text-amber-400 block">{cert.badge}</span>
                        <h4 className="font-extrabold text-[hsl(var(--text-primary))]">{cert.title}</h4>
                        <p className="text-[11px] text-[hsl(var(--text-tertiary))] font-mono">{cert.issuer} &bull; {cert.year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. EXTRACURRICULAR LEADERSHIP */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
                    🏆 Extracurricular Clubs &amp; Leadership Positions
                  </h3>

                  <div className="space-y-3">
                    {portfolioExtracurriculars.map(ex => (
                      <div key={ex.id} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-md">
                        <div>
                          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{ex.role}</span>
                          <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{ex.club}</h4>
                          <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{ex.impact}</p>
                        </div>
                        <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] self-start sm:self-center">{ex.period}</span>
                      </div>
                    ))}
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

            {/* Tab 3.5: Performance Analytics Visual Dashboard */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner & Sub-Navigation */}
                <div className="glass-card p-6 sm:p-8 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-extrabold tracking-wider uppercase border border-indigo-500/30">
                        Visual Performance Diagnostic Engine
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-400" /> Student Performance Analytics
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Visual charts comparing subject performance, multi-term GPA trends, monthly attendance, assignment completion, and midterm vs. final exam scores.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setAnalyticsToast('Refreshed visual analytics charts with latest term data!');
                        setTimeout(() => setAnalyticsToast(null), 3000);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 self-start sm:self-center"
                    >
                      <RefreshCw className="w-4 h-4" /> Refresh Charts
                    </button>
                  </div>

                  {analyticsToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {analyticsToast}
                    </div>
                  )}

                  {/* Analytics Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'overview', label: '📊 Executive Summary' },
                      { id: 'subjects', label: '📐 Subject Performance' },
                      { id: 'gpa_trend', label: '📈 GPA Trend Progression' },
                      { id: 'attendance_trend', label: '🗓️ Attendance Trend' },
                      { id: 'assignments', label: '📝 Assignment Completion' },
                      { id: 'exam_comp', label: '⚔️ Midterm vs. Final Exams' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setAnalyticsSubTab(st.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          analyticsSubTab === st.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KPI SUMMARY METRICS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Overall GPA */}
                  <div className="glass-card p-5 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-1 shadow-md">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-400">CUMULATIVE GPA</span>
                    <div className="text-2xl font-black text-[hsl(var(--text-primary))]">3.85 / 4.0</div>
                    <p className="text-[10px] text-emerald-400 font-bold">▲ +0.03 vs. Last Term (High Distinction)</p>
                  </div>

                  {/* 2. Top Subject */}
                  <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-1 shadow-md">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400">HIGHEST SUBJECT</span>
                    <div className="text-xl font-black text-emerald-400">Mathematics (92%)</div>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">Mastery Level • Grade A+</p>
                  </div>

                  {/* 3. Assignment Rate */}
                  <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-1 shadow-md">
                    <span className="text-[10px] font-extrabold uppercase text-purple-400">ASSIGNMENT RATE</span>
                    <div className="text-2xl font-black text-purple-400">96% On-Time</div>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">24 of 25 Tasks Submitted</p>
                  </div>

                  {/* 4. Attendance Rate */}
                  <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-1 shadow-md">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400">ATTENDANCE RATE</span>
                    <div className="text-2xl font-black text-amber-400">96.5% Average</div>
                    <p className="text-[10px] text-emerald-400 font-bold">Exam Policy Eligible ✓</p>
                  </div>
                </div>

                {/* 1. SUBJECT PERFORMANCE CHART VISUAL */}
                {(analyticsSubTab === 'overview' || analyticsSubTab === 'subjects') && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          📐 Subject Performance &amp; Mastery Levels
                        </h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Visual comparison of student scores against target mastery benchmarks.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {subjectPerformanceData.map((subj, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-2 text-xs shadow-md">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-[hsl(var(--text-primary))] flex items-center gap-2">
                              <span>{subj.icon}</span> {subj.subject}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-[10px]">
                                Grade: {subj.grade}
                              </span>
                              <span className="font-mono text-base font-black text-[hsl(var(--text-primary))]">{subj.score}%</span>
                            </div>
                          </div>

                          {/* Progress Bar Visual */}
                          <div className="w-full bg-[hsl(var(--bg-tertiary))] h-3 rounded-full overflow-hidden relative">
                            <div className={`bg-gradient-to-r ${subj.barColor} h-full rounded-full transition-all duration-1000`} style={{ width: `${subj.score}%` }} />
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-[hsl(var(--text-tertiary))] pt-1">
                            <span>Status: <strong>{subj.status}</strong></span>
                            <span>Target Goal: {subj.target}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. MULTI-TERM GPA TREND progression */}
                {(analyticsSubTab === 'overview' || analyticsSubTab === 'gpa_trend') && (
                  <div className="glass-card p-6 sm:p-8 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          📈 Multi-Term GPA Progression Trend
                        </h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Historical term-by-term GPA trajectory towards graduation target.</p>
                      </div>
                      <span className="text-lg font-black text-indigo-400">Current: 3.85 / 4.0</span>
                    </div>

                    {/* Visual GPA Bar Chart Timeline */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {gpaTrendData.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-indigo-500/20 bg-[hsl(var(--bg-secondary))] text-center space-y-2 flex flex-col justify-between shadow-md">
                          <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] block">{item.term}</span>
                          <div className="text-xl font-black text-indigo-400">{item.gpa}</div>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. MONTHLY ATTENDANCE TREND & EXAM COMPARISON */}
                {(analyticsSubTab === 'overview' || analyticsSubTab === 'attendance_trend' || analyticsSubTab === 'exam_comp') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attendance Monthly Visual */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                        🗓️ Monthly Attendance Presence Trend
                      </h3>
                      <div className="space-y-3">
                        {attendanceTrendData.map((att, idx) => (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex justify-between font-mono">
                              <span>{att.month}</span>
                              <span className="font-bold text-emerald-400">{att.rate}% ({att.status})</span>
                            </div>
                            <div className="w-full bg-[hsl(var(--bg-tertiary))] h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${att.rate}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exam Comparison (Midterm vs Final) */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                        ⚔️ Midterm vs. Final Exam Score Comparison
                      </h3>
                      <div className="space-y-3 text-xs">
                        {examComparisonData.map((ex, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center">
                            <div>
                              <h4 className="font-extrabold text-[hsl(var(--text-primary))]">{ex.subject}</h4>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">Midterm: {ex.midterm}% ➔ Final: {ex.final}%</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs border border-emerald-500/30">
                              {ex.diff}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STRENGTHS vs AREAS FOR IMPROVEMENT INSIGHTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Strengths */}
                  <div className="glass-card p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-4 shadow-xl">
                    <h3 className="text-base font-black text-emerald-400 flex items-center gap-2">
                      🌟 Key Academic Strengths
                    </h3>
                    <div className="space-y-2.5 text-xs text-[hsl(var(--text-secondary))]">
                      <div className="p-3 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                        🏆 <strong>Top 5% STEM Standing:</strong> Outstanding problem-solving ability in Mathematics &amp; Algebra proofs.
                      </div>
                      <div className="p-3 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                        📝 <strong>96% Assignment Discipline:</strong> Consistently completes homework tasks on-time with high accuracy.
                      </div>
                      <div className="p-3 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                        ⚡ <strong>Exam Retention Growth:</strong> Midterm vs. Final exam scores show average +5.2% knowledge gain.
                      </div>
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-4 shadow-xl">
                    <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                      💡 Areas for Growth &amp; Target Boost
                    </h3>
                    <div className="space-y-2.5 text-xs text-[hsl(var(--text-secondary))]">
                      <div className="p-3 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                        🧪 <strong>Organic Chemistry Reactions:</strong> Electrophilic addition mechanisms require additional practice (+5% boost needed).
                      </div>
                      <div className="p-3 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                        📜 <strong>World History Essay Structure:</strong> Focus on thesis formulation and chronological bibliography citations.
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        🤖 <strong>AI Study Tip:</strong> Schedule 2 revision sessions on the AI Study Copilot tab for Chemistry formulas.
                      </div>
                    </div>
                  </div>
                </div>
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

            {/* Tab 4.8: Admin-Grade Internal Messaging Workspace */}
            {activeTab === 'messages' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner & Status Selector */}
                <div className="glass-card p-6 sm:p-8 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-extrabold tracking-wider uppercase border border-indigo-500/30">
                        Admin-Grade Communication Suite
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Internal Messaging &amp; Live Chat
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Direct messaging, class channels, voice/video calls, and real-time status presence with teachers and staff.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                      {/* Presence Status Selector Dropdown */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <select
                          value={userStatusMessage}
                          onChange={e => setUserStatusMessage(e.target.value)}
                          className="bg-transparent text-[hsl(var(--text-primary))] focus:outline-none font-bold text-xs cursor-pointer"
                        >
                          <option>Available 👋</option>
                          <option>In class 📚</option>
                          <option>Studying 📖</option>
                          <option>Exam Mode ✏️</option>
                          <option>Focus Mode 🤫</option>
                        </select>
                      </div>

                      <button
                        onClick={() => setShowNewDmModal(true)}
                        className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> New DM Conversation
                      </button>
                    </div>
                  </div>

                  {chatToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {chatToast}
                    </div>
                  )}
                </div>

                {/* 2-Column Chat Workspace Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
                  {/* Left Column: Chat Sidebar & Channels List (4 Cols) */}
                  <div className="lg:col-span-4 glass-card p-5 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Search Channels */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-[hsl(var(--text-tertiary))]" />
                        <input
                          type="text"
                          value={chatSearch}
                          onChange={e => setChatSearch(e.target.value)}
                          placeholder="Search channels or contacts..."
                          className="w-full pl-9 pr-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'unread', label: 'Unread (3)' },
                          { id: 'groups', label: 'Groups' },
                          { id: 'starred', label: 'Starred ⭐' }
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setChatFilter(f.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                              chatFilter === f.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {/* Channels List */}
                      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                        {chatChannels
                          .filter(c => {
                            if (chatFilter === 'unread') return c.unread > 0;
                            if (chatFilter === 'groups') return c.type === 'group';
                            if (chatFilter === 'starred') return c.isPinned;
                            if (chatSearch.trim()) return c.name.toLowerCase().includes(chatSearch.toLowerCase());
                            return true;
                          })
                          .map(ch => {
                            const isSelected = activeChatChannelId === ch.id;
                            return (
                              <div
                                key={ch.id}
                                onClick={() => {
                                  setActiveChatChannelId(ch.id);
                                  setChatChannels(prev => prev.map(item => item.id === ch.id ? { ...item, unread: 0 } : item));
                                }}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md ring-1 ring-indigo-500'
                                    : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary)/0.5)]'
                                }`}
                              >
                                <div className="flex items-center gap-3 truncate">
                                  <div className="relative">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md flex-shrink-0">
                                      {ch.avatar}
                                    </div>
                                    <span className={`w-3 h-3 rounded-full border-2 border-[hsl(var(--bg-secondary))] absolute -bottom-0.5 -right-0.5 ${ch.online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                  </div>

                                  <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{ch.name}</h4>
                                      {ch.isPinned && <span className="text-[10px]" title="Pinned">⭐</span>}
                                    </div>
                                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">{ch.messages[ch.messages.length - 1]?.text || ch.role}</p>
                                  </div>
                                </div>

                                <div className="text-right flex-shrink-0 space-y-1">
                                  <span className="text-[9px] font-mono text-[hsl(var(--text-tertiary))] block">{ch.messages[ch.messages.length - 1]?.time || 'Now'}</span>
                                  {ch.unread > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[9px] shadow-md inline-block">
                                      {ch.unread}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Chat Window & Thread (8 Cols) */}
                  <div className="lg:col-span-8 glass-card border border-[hsl(var(--border))] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                    {(() => {
                      const activeCh = chatChannels.find(c => c.id === activeChatChannelId) || chatChannels[0];
                      return (
                        <>
                          {/* Chat Window Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
                                  {activeCh.avatar}
                                </div>
                                <span className={`w-3.5 h-3.5 rounded-full border-2 border-[hsl(var(--bg-secondary))] absolute -bottom-0.5 -right-0.5 ${activeCh.online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                              </div>

                              <div>
                                <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                                  {activeCh.name}
                                </h3>
                                <p className="text-[11px] text-[hsl(var(--text-tertiary))] flex items-center gap-2 mt-0.5">
                                  <span>{activeCh.role}</span> &bull; <span className="text-emerald-400 font-semibold">{activeCh.status}</span>
                                </p>
                              </div>
                            </div>

                            {/* Call & Chat Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowCallModal({ type: 'voice', name: activeCh.name })}
                                className="p-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--border))] transition-all"
                                title="Start Voice Call"
                              >
                                <PhoneCall className="w-4 h-4 text-emerald-400" />
                              </button>
                              <button
                                onClick={() => setShowCallModal({ type: 'video', name: activeCh.name })}
                                className="p-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--border))] transition-all"
                                title="Start Video Call"
                              >
                                <Video className="w-4 h-4 text-indigo-400" />
                              </button>
                              <button
                                onClick={() => {
                                  setChatChannels(prev => prev.map(c => c.id === activeCh.id ? { ...c, isPinned: !c.isPinned } : c));
                                }}
                                className={`p-2.5 rounded-2xl border transition-all ${
                                  activeCh.isPinned ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]'
                                }`}
                                title="Pin Channel"
                              >
                                <Pin className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Messages Thread Stream */}
                          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 py-2 text-xs">
                            <div className="text-center font-mono text-[10px] text-[hsl(var(--text-tertiary))] uppercase my-2">
                              ─── Today ───
                            </div>

                            {activeCh.messages.map((msg: any) => {
                              const isMe = msg.senderName.includes('Emeka') || msg.senderId === 'me';
                              return (
                                <div key={msg.id} className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-tertiary))] px-1">
                                    <span className="font-bold text-[hsl(var(--text-primary))]">{msg.senderName}</span>
                                    <span>&bull;</span>
                                    <span className="font-mono">{msg.time}</span>
                                  </div>

                                  <div className={`p-4 rounded-3xl max-w-md space-y-2 relative group shadow-md ${
                                    isMe
                                      ? 'bg-indigo-600 text-white rounded-br-none'
                                      : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-bl-none'
                                  }`}>
                                    <p className="leading-relaxed">{msg.text}</p>

                                    {/* Emoji Reaction Bar */}
                                    <div className="flex items-center gap-1 pt-1">
                                      {Object.entries(msg.reactions || {}).map(([emoji, count]: any) => (
                                        <span key={emoji} className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-bold">
                                          {emoji} {count}
                                        </span>
                                      ))}
                                      
                                      {/* Quick Reaction Selector */}
                                      <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1 ml-2">
                                        {['👍', '❤️', '🔥', '✅'].map(emoji => (
                                          <button
                                            key={emoji}
                                            onClick={() => {
                                              setChatChannels(prev => prev.map(c => c.id === activeCh.id ? {
                                                ...c,
                                                messages: c.messages.map((m: any) => m.id === msg.id ? {
                                                  ...m,
                                                  reactions: { ...m.reactions, [emoji]: ((m.reactions as any)?.[emoji] || 0) + 1 }
                                                } : m)
                                              } : c));
                                            }}
                                            className="hover:scale-125 transition-all text-xs"
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Reply Preview Header if replying */}
                          {replyingToMsg && (
                            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex justify-between items-center">
                              <span className="text-indigo-400 font-bold truncate">Replying to: {replyingToMsg.text}</span>
                              <button onClick={() => setReplyingToMsg(null)} className="text-rose-400 font-bold text-xs">✕</button>
                            </div>
                          )}

                          {/* Chat Input Dock */}
                          <div className="pt-3 border-t border-[hsl(var(--border))] space-y-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setChatToast('Simulated attachment file uploaded successfully.');
                                  setTimeout(() => setChatToast(null), 3000);
                                }}
                                className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                                title="Attach File"
                              >
                                <Paperclip className="w-4 h-4" />
                              </button>

                              <input
                                type="text"
                                value={chatInputText}
                                onChange={e => setChatInputText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && chatInputText.trim()) {
                                    const newMsg = {
                                      id: `m${Date.now()}`,
                                      senderId: 'me',
                                      senderName: 'Emeka Obi (Student)',
                                      text: chatInputText.trim(),
                                      time: 'Just now',
                                      date: 'Today',
                                      status: 'read',
                                      reactions: {}
                                    };
                                    setChatChannels(prev => prev.map(c => c.id === activeCh.id ? { ...c, messages: [...c.messages, newMsg] } : c));
                                    setChatInputText('');
                                    setReplyingToMsg(null);
                                  }
                                }}
                                placeholder={`Message ${activeCh.name}...`}
                                className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl px-4 py-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-indigo-500"
                              />

                              <button
                                onClick={() => {
                                  if (!chatInputText.trim()) return;
                                  const newMsg = {
                                    id: `m${Date.now()}`,
                                    senderId: 'me',
                                    senderName: 'Emeka Obi (Student)',
                                    text: chatInputText.trim(),
                                    time: 'Just now',
                                    date: 'Today',
                                    status: 'read',
                                    reactions: {}
                                  };
                                  setChatChannels(prev => prev.map(c => c.id === activeCh.id ? { ...c, messages: [...c.messages, newMsg] } : c));
                                  setChatInputText('');
                                  setReplyingToMsg(null);
                                }}
                                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                              >
                                <Send className="w-4 h-4" /> Send
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* VOICE / VIDEO CALL MODAL SIMULATOR */}
                {showCallModal && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card max-w-sm w-full p-8 border border-indigo-500/30 rounded-3xl space-y-6 text-center shadow-2xl relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                        {showCallModal.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{showCallModal.name}</h3>
                        <p className="text-xs text-emerald-400 font-semibold mt-1">
                          {showCallModal.type === 'voice' ? '📞 Voice Call Connected (00:14)' : '📹 Video Call Connected (00:28)'}
                        </p>
                      </div>

                      <div className="flex justify-center items-center gap-4 pt-4 border-t border-[hsl(var(--border))]">
                        <button
                          onClick={() => setShowCallModal(null)}
                          className="w-14 h-14 rounded-full bg-rose-600 text-white font-bold text-xl flex items-center justify-center shadow-lg hover:bg-rose-700 transition-all"
                          title="End Call"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* NEW DM CONVERSATION MODAL */}
                {showNewDmModal && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card max-w-md w-full p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-2xl">
                      <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                        <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))]">Start New DM Conversation</h3>
                        <button onClick={() => setShowNewDmModal(false)} className="text-[hsl(var(--text-tertiary))] font-bold text-xs">✕</button>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Select Educator / Staff Member</label>
                          <select
                            value={newDmRecipient}
                            onChange={e => setNewDmRecipient(e.target.value)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-xs text-[hsl(var(--text-primary))]"
                          >
                            <option>Mr. Kwame Darko (Math Teacher)</option>
                            <option>Mrs. Beatrice Mensah (Chemistry Teacher)</option>
                            <option>Dr. Stella Gbandi (English Teacher)</option>
                            <option>Prof. Emmanuel Thorpe (Physics Teacher)</option>
                            <option>School Administration Office</option>
                            <option>Head Librarian (Mrs. Janet Osei)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                        <button onClick={() => setShowNewDmModal(false)} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] font-bold">Cancel</button>
                        <button
                          onClick={() => {
                            const newChan = {
                              id: `c${chatChannels.length + 1}`,
                              name: newDmRecipient,
                              type: 'direct',
                              avatar: newDmRecipient.substring(0, 2).toUpperCase(),
                              role: 'Educator / Staff',
                              online: true,
                              status: 'Available 👋',
                              unread: 0,
                              isPinned: false,
                              messages: [
                                { id: `m${Date.now()}`, senderId: 'me', senderName: 'Emeka Obi (Student)', text: 'Hello! I started a new conversation.', time: 'Just now', date: 'Today', status: 'read', reactions: {} }
                              ]
                            };
                            setChatChannels([newChan, ...chatChannels]);
                            setActiveChatChannelId(newChan.id);
                            setShowNewDmModal(false);
                            setChatToast(`Started conversation with ${newDmRecipient}!`);
                            setTimeout(() => setChatToast(null), 3000);
                          }}
                          className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                        >
                          Start Chat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4.85: Central Notification Center & Multi-Channel Alert Desk */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Control Banner */}
                <div className="glass-card p-6 sm:p-8 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-extrabold tracking-wider uppercase border border-amber-500/30">
                        Unified School Notification Engine
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-amber-400" /> Central Notification Center
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Real-time alerts for assignment deadlines, published exam results, school announcements, teacher messages, fee reminders, and RFID attendance logs.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                      <button
                        onClick={() => {
                          setNotificationsData(prev => prev.map(n => ({ ...n, read: true })));
                          setNotificationsToast('Marked all notifications as read!');
                          setTimeout(() => setNotificationsToast(null), 3000);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark All as Read
                      </button>
                    </div>
                  </div>

                  {notificationsToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {notificationsToast}
                    </div>
                  )}

                  {/* Multi-Channel Dispatch Preferences Bar (Push, Email, SMS) */}
                  <div className="p-5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-2">
                      <span className="font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                        📲 Multi-Channel Alert Delivery Settings
                      </span>
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
                        Guardian SMS Phone: {notificationsDispatchPrefs.guardianSmsPhone}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Push Toggle */}
                      <button
                        onClick={() => {
                          setNotificationsDispatchPrefs(prev => ({ ...prev, pushEnabled: !prev.pushEnabled }));
                          setNotificationsToast(`Browser Push Notifications ${!notificationsDispatchPrefs.pushEnabled ? 'Enabled ✓' : 'Disabled'}.`);
                          setTimeout(() => setNotificationsToast(null), 3000);
                        }}
                        className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                          notificationsDispatchPrefs.pushEnabled
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-tertiary))]'
                        }`}
                      >
                        <span>🔔 Push Notifications</span>
                        <span>{notificationsDispatchPrefs.pushEnabled ? 'ON ✓' : 'OFF'}</span>
                      </button>

                      {/* Email Toggle */}
                      <button
                        onClick={() => {
                          setNotificationsDispatchPrefs(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }));
                          setNotificationsToast(`Email Alerts ${!notificationsDispatchPrefs.emailEnabled ? 'Enabled ✓' : 'Disabled'}.`);
                          setTimeout(() => setNotificationsToast(null), 3000);
                        }}
                        className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                          notificationsDispatchPrefs.emailEnabled
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-tertiary))]'
                        }`}
                      >
                        <span>✉️ Email Alerts</span>
                        <span>{notificationsDispatchPrefs.emailEnabled ? 'ON ✓' : 'OFF'}</span>
                      </button>

                      {/* SMS Optional Toggle */}
                      <button
                        onClick={() => {
                          setNotificationsDispatchPrefs(prev => ({ ...prev, smsEnabled: !prev.smsEnabled }));
                          setNotificationsToast(`SMS Parent Text Messages ${!notificationsDispatchPrefs.smsEnabled ? 'Enabled ✓' : 'Disabled'}.`);
                          setTimeout(() => setNotificationsToast(null), 3000);
                        }}
                        className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                          notificationsDispatchPrefs.smsEnabled
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-tertiary))]'
                        }`}
                      >
                        <span>📱 SMS Alerts (Optional)</span>
                        <span>{notificationsDispatchPrefs.smsEnabled ? 'ON ✓' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Sub-Tabs & Search Input */}
                  <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Search */}
                      <div className="md:col-span-6 relative">
                        <Search className="w-4 h-4 absolute left-4 top-3.5 text-[hsl(var(--text-tertiary))]" />
                        <input
                          type="text"
                          value={notificationsSearchQuery}
                          onChange={e => setNotificationsSearchQuery(e.target.value)}
                          placeholder="Search notifications by title, subject, sender..."
                          className="w-full pl-11 pr-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Category Filter Pills */}
                      <div className="md:col-span-6 flex flex-wrap gap-1.5 items-center">
                        {[
                          { id: 'all', label: `All (${notificationsData.length})` },
                          { id: 'unread', label: `Unread (${notificationsData.filter(n => !n.read).length})` },
                          { id: 'assignment', label: '📝 Assignment Due' },
                          { id: 'result', label: '📊 New Result' },
                          { id: 'announcement', label: '📢 Announcement' },
                          { id: 'message', label: '💬 Teacher Message' },
                          { id: 'finance', label: '💳 Fee Reminder' },
                          { id: 'attendance', label: '🚨 Attendance' }
                        ].map(st => (
                          <button
                            key={st.id}
                            onClick={() => setNotificationsFilter(st.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              notificationsFilter === st.id
                                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                                : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* NOTIFICATIONS FEED LIST */}
                <div className="space-y-4">
                  {notificationsData
                    .filter(n => {
                      if (notificationsFilter === 'unread') return !n.read;
                      if (notificationsFilter !== 'all') return n.category === notificationsFilter;
                      return true;
                    })
                    .filter(n => {
                      if (!notificationsSearchQuery.trim()) return true;
                      const q = notificationsSearchQuery.toLowerCase();
                      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q) || n.sender.toLowerCase().includes(q);
                    })
                    .map(notif => (
                      <div
                        key={notif.id}
                        className={`glass-card p-6 border ${notif.color} rounded-3xl space-y-3 shadow-xl transition-all ${
                          !notif.read ? 'ring-2 ring-amber-500/40 bg-amber-500/5' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{notif.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase border border-amber-500/30">
                                  {notif.categoryLabel}
                                </span>
                                {!notif.read && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase animate-pulse">
                                    NEW UNREAD
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">Priority: {notif.priority}</span>
                              </div>
                              <h3 className="text-base font-black text-[hsl(var(--text-primary))] mt-1">{notif.title}</h3>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] self-start sm:self-center">
                            {notif.timestamp}
                          </span>
                        </div>

                        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="pt-3 border-t border-[hsl(var(--border)/0.5)] flex flex-wrap justify-between items-center gap-2 text-xs">
                          <span className="text-[11px] text-[hsl(var(--text-tertiary))] font-mono">
                            Sender: <strong>{notif.sender}</strong>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setNotificationsData(prev => prev.map(n => n.id === notif.id ? { ...n, read: !n.read } : n));
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))]"
                            >
                              {notif.read ? 'Mark Unread' : 'Mark Read ✓'}
                            </button>

                            {notif.actionTab && (
                              <button
                                onClick={() => {
                                  setNotificationsData(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                  setActiveTab(notif.actionTab as any);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1 shadow-md"
                              >
                                View Related Desk <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setNotificationsData(prev => prev.filter(n => n.id !== notif.id));
                                setNotificationsToast(`Deleted alert "${notif.title}".`);
                                setTimeout(() => setNotificationsToast(null), 3000);
                              }}
                              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                              title="Delete Alert"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tab 4.9: Library & Reading Hub */}
            {activeTab === 'library' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Library Sub-Navigation Bar */}
                <div className="glass-card p-6 sm:p-8 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-extrabold tracking-wider uppercase border border-amber-500/30">
                        School Central Library Hub
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Library &amp; Learning Resource Center
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Search books, track borrowed titles, manage reservations, monitor due dates, and review reading history.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setLibrarySubTab('search')}
                        className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" /> Search Catalog
                      </button>
                    </div>
                  </div>

                  {libraryToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {libraryToast}
                    </div>
                  )}

                  {/* Library Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'dashboard', label: '📊 Library Dashboard' },
                      { id: 'search', label: '🔍 Search Books, Authors & Categories' },
                      { id: 'borrowed', label: '📚 Borrowed Books & Due Dates' },
                      { id: 'reservations', label: '🔖 Reservations & Holds' },
                      { id: 'history', label: '📜 Reading History' },
                      { id: 'fines', label: '💰 Fines (₦500.00)' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setLibrarySubTab(st.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          librarySubTab === st.id
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. LIBRARY DASHBOARD OVERVIEW */}
                {librarySubTab === 'dashboard' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Summary KPI Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-blue-400">
                          <span>BORROWED BOOKS</span>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-[hsl(var(--text-primary))]">2 Active</div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">1 Book Overdue</p>
                      </div>

                      <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-emerald-400">
                          <span>NEXT DUE DATE</span>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-black text-[hsl(var(--text-primary))]">August 02, 2026</div>
                        <p className="text-[10px] text-emerald-400 font-semibold">4 Days Remaining</p>
                      </div>

                      <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-purple-400">
                          <span>RESERVATIONS</span>
                          <BookMarked className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-[hsl(var(--text-primary))]">1 On Hold</div>
                        <p className="text-[10px] text-purple-400 font-semibold">Ready at Front Desk</p>
                      </div>

                      <div className="glass-card p-5 border border-rose-500/20 bg-rose-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-rose-400">
                          <span>LIBRARY FINES</span>
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-rose-400">₦500.00</div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">1 Overdue Book Fee</p>
                      </div>
                    </div>

                    {/* Active Borrowed Books Grid */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center justify-between">
                        <span>Currently Borrowed Books ({borrowedBooksData.length})</span>
                        <button onClick={() => setLibrarySubTab('borrowed')} className="text-xs text-amber-400 hover:underline">View All &rarr;</button>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {borrowedBooksData.map(book => (
                          <div key={book.id} className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex gap-4 shadow-md">
                            <div className={`w-20 h-28 rounded-2xl bg-gradient-to-br ${book.coverBg} text-white font-black text-xs flex flex-col justify-between p-3 shadow-lg flex-shrink-0`}>
                              <span className="text-[9px] uppercase font-mono tracking-wider opacity-80">{book.callNo}</span>
                              <BookOpen className="w-6 h-6 opacity-90" />
                              <span className="text-[10px] font-bold line-clamp-2 leading-tight">{book.category}</span>
                            </div>

                            <div className="flex-1 space-y-2 text-xs">
                              <div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  book.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {book.status === 'overdue' ? 'Overdue • Late Fine ₦500' : `Due in ${book.daysLeft} Days`}
                                </span>
                                <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] mt-1">{book.title}</h4>
                                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Author: {book.author}</p>
                              </div>

                              <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] flex justify-between items-center text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
                                <span>Due: {book.dueDate}</span>
                                <button
                                  onClick={() => {
                                    setLibraryToast(`Loan renewal requested for "${book.title}". Extended by 7 days.`);
                                    setTimeout(() => setLibraryToast(null), 4000);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-amber-600/20 text-amber-300 font-bold border border-amber-500/30 hover:bg-amber-600/30 transition-all"
                                >
                                  Renew Loan
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CATALOG SEARCH (BOOKS, AUTHORS, CATEGORIES) */}
                {librarySubTab === 'search' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Search Controls Bar */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-8 relative">
                          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[hsl(var(--text-tertiary))]" />
                          <input
                            type="text"
                            value={librarySearchQuery}
                            onChange={e => setLibrarySearchQuery(e.target.value)}
                            placeholder="Search by book title, author (e.g. Shakespeare), or category..."
                            className="w-full pl-11 pr-4 py-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Category Dropdown Filter */}
                        <div className="md:col-span-4">
                          <select
                            value={libraryCategoryFilter}
                            onChange={e => setLibraryCategoryFilter(e.target.value)}
                            className="w-full py-3 px-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl text-xs text-[hsl(var(--text-primary))] focus:outline-none font-bold"
                          >
                            <option value="all">All Categories</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Literature">Literature</option>
                            <option value="Physics">Physics</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Fiction">Fiction</option>
                          </select>
                        </div>
                      </div>

                      {/* Quick Category Filter Badges */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                        {['all', 'Mathematics', 'Chemistry', 'Literature', 'Physics', 'Computer Science', 'Fiction'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setLibraryCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                              libraryCategoryFilter === cat
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                          >
                            {cat === 'all' ? 'All Books' : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Catalog Books Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {libraryCatalogData
                        .filter(book => {
                          if (libraryCategoryFilter !== 'all' && book.category !== libraryCategoryFilter) return false;
                          if (librarySearchQuery.trim()) {
                            const q = librarySearchQuery.toLowerCase();
                            return (
                              book.title.toLowerCase().includes(q) ||
                              book.author.toLowerCase().includes(q) ||
                              book.category.toLowerCase().includes(q) ||
                              book.callNo.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map(book => (
                          <div key={book.id} className="glass-card p-5 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex gap-4">
                                <div className={`w-20 h-28 rounded-2xl bg-gradient-to-br ${book.coverBg} text-white font-black text-xs flex flex-col justify-between p-3 shadow-lg flex-shrink-0`}>
                                  <span className="text-[9px] uppercase font-mono tracking-wider opacity-80">{book.callNo}</span>
                                  <BookOpen className="w-6 h-6 opacity-90" />
                                  <span className="text-[10px] font-bold line-clamp-2 leading-tight">{book.category}</span>
                                </div>

                                <div className="space-y-1 text-xs">
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-extrabold uppercase">
                                    {book.category}
                                  </span>
                                  <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] leading-snug">{book.title}</h4>
                                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">By {book.author}</p>
                                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">Call No: {book.callNo}</p>
                                </div>
                              </div>

                              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-3">
                                {book.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between text-xs">
                              <span className="text-[11px] font-bold text-emerald-400">
                                {book.availableCopies} / {book.totalCopies} Available
                              </span>

                              <button
                                onClick={() => {
                                  const newRes = {
                                    id: `r${reservedBooksData.length + 1}`,
                                    title: book.title,
                                    author: book.author,
                                    category: book.category,
                                    callNo: book.callNo,
                                    coverBg: book.coverBg,
                                    reservedDate: 'Just now',
                                    pickupDeadline: 'In 3 days',
                                    status: 'Reservation Confirmed',
                                    deskLocation: 'Main Reserve Counter'
                                  };
                                  setReservedBooksData([newRes, ...reservedBooksData]);
                                  setLibraryToast(`Book "${book.title}" successfully reserved! Place on hold at Front Desk.`);
                                  setTimeout(() => setLibraryToast(null), 4000);
                                }}
                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                              >
                                <BookMarked className="w-3.5 h-3.5" /> Reserve Book
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 3. BORROWED BOOKS & DUE DATES */}
                {librarySubTab === 'borrowed' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Currently Borrowed Books &amp; Due Dates</h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Active library checkouts with expiration timers and renewal options.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {borrowedBooksData.map(book => (
                        <div key={book.id} className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-md">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-16 rounded-2xl bg-gradient-to-br ${book.coverBg} text-white font-black text-xs flex items-center justify-center shadow-md flex-shrink-0`}>
                              <BookOpen className="w-6 h-6" />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  book.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {book.status === 'overdue' ? 'Overdue Fee Applied' : 'Active Checkout'}
                                </span>
                                <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{book.callNo}</span>
                              </div>
                              <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] mt-1">{book.title}</h4>
                              <p className="text-xs text-[hsl(var(--text-tertiary))]">Author: {book.author}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[hsl(var(--border))] justify-between sm:justify-end">
                            <div className="text-right text-xs">
                              <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Due Date</span>
                              <span className="font-extrabold text-[hsl(var(--text-primary))] font-mono">{book.dueDate}</span>
                            </div>

                            <button
                              onClick={() => {
                                setLibraryToast(`Renewed loan for "${book.title}". New due date extended.`);
                                setTimeout(() => setLibraryToast(null), 4000);
                              }}
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all"
                            >
                              Renew Loan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. RESERVATIONS & HOLDS */}
                {librarySubTab === 'reservations' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Reserved Books &amp; Pickup Holds</h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Books currently reserved for you at the central library front desk counter.</p>
                    </div>

                    <div className="space-y-4">
                      {reservedBooksData.map(res => (
                        <div key={res.id} className="p-5 rounded-3xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-black text-xs flex items-center justify-center shadow-md flex-shrink-0">
                              <BookMarked className="w-6 h-6" />
                            </div>

                            <div>
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-extrabold uppercase">
                                {res.status}
                              </span>
                              <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] mt-1">{res.title}</h4>
                              <p className="text-xs text-[hsl(var(--text-tertiary))]">📍 Pickup Counter: {res.deskLocation}</p>
                            </div>
                          </div>

                          <div className="text-right text-xs">
                            <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Hold Deadline</span>
                            <span className="font-extrabold text-amber-400 font-mono">{res.pickupDeadline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. READING HISTORY */}
                {librarySubTab === 'history' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Borrowing &amp; Reading History</h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Archived log of previously checked out and completed books.</p>
                    </div>

                    <div className="space-y-3">
                      {readingHistoryData.map(hist => (
                        <div key={hist.id} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                          <div>
                            <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{hist.title}</h4>
                            <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Author: {hist.author} &bull; Category: {hist.category}</p>
                            <p className="text-[11px] text-amber-400 font-semibold mt-1">"{hist.reviewNote}"</p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="flex gap-1 justify-end text-amber-400 mb-1">
                              {[...Array(hist.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                            </div>
                            <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">Returned: {hist.returnedDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. FINES & OVERDUE PAYMENTS */}
                {librarySubTab === 'fines' && (
                  <div className="glass-card p-6 sm:p-8 border border-rose-500/20 bg-rose-500/5 rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Library Fines &amp; Overdue Charges</h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Pay overdue fines online or at the library circulation desk.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase block">Total Due</span>
                        <span className="text-2xl font-black text-rose-400">₦500.00</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-extrabold text-[hsl(var(--text-primary))]">Organic Chemistry: Structure &amp; Mechanism</h4>
                        <p className="text-[11px] text-rose-300">7 Days Overdue (Due July 22, 2026)</p>
                      </div>

                      <button
                        onClick={() => {
                          setLibraryToast('Library fine of ₦500.00 paid successfully online via portal payment gateway.');
                          setTimeout(() => setLibraryToast(null), 5000);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md transition-all flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" /> Pay ₦500.00 Fine
                      </button>
                    </div>
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

            {/* Tab 7: Clubs & Extracurricular Activities Hub */}
            {activeTab === 'activities' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Sub-Navigation Bar */}
                <div className="glass-card p-6 sm:p-8 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-extrabold tracking-wider uppercase border border-purple-500/30">
                        Extracurricular Life &amp; Leadership
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Clubs, Events &amp; Trophy Cabinet
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Join school clubs, view meeting schedules, register for events, track attendance participation, and celebrate achievements.
                      </p>
                    </div>

                    <button
                      onClick={() => setClubsSubTab('browse')}
                      className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 self-start sm:self-center"
                    >
                      <Plus className="w-4 h-4" /> Browse All Clubs
                    </button>
                  </div>

                  {clubsToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {clubsToast}
                    </div>
                  )}

                  {/* Clubs Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'my_clubs', label: `👥 My Clubs (${clubsData.filter(c => c.joined).length})` },
                      { id: 'browse', label: '🔍 Browse All Clubs' },
                      { id: 'schedules', label: '📅 Weekly Meeting Schedules' },
                      { id: 'events', label: '🎟️ Events & Competitions' },
                      { id: 'participation', label: '📊 Attendance & Participation' },
                      { id: 'achievements', label: '🏆 Trophy Cabinet (4)' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setClubsSubTab(st.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          clubsSubTab === st.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. MY JOINED CLUBS */}
                {clubsSubTab === 'my_clubs' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {clubsData
                        .filter(c => c.joined)
                        .map(club => (
                          <div key={club.id} className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-extrabold uppercase">
                                  {club.category}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold">
                                  {club.role}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-base font-black text-[hsl(var(--text-primary))] leading-snug">{club.name}</h3>
                                <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">Patron: {club.patron}</p>
                              </div>

                              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-3">
                                {club.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-[hsl(var(--border))] space-y-2 text-xs">
                              <div className="flex justify-between text-[11px] text-[hsl(var(--text-tertiary))] font-mono">
                                <span>📍 {club.room}</span>
                                <span>⏰ {club.attendanceRate} Attendance</span>
                              </div>

                              <div className="flex justify-between items-center pt-1">
                                <span className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))]">{club.schedule}</span>
                                <button
                                  onClick={() => {
                                    setClubsData(prev => prev.map(item => item.id === club.id ? { ...item, joined: false } : item));
                                    setClubsToast(`Left "${club.name}". Membership updated.`);
                                    setTimeout(() => setClubsToast(null), 3000);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px] hover:bg-rose-500/20 transition-all"
                                >
                                  Leave Club
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. BROWSE ALL CLUBS */}
                {clubsSubTab === 'browse' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {clubsData.map(club => (
                      <div key={club.id} className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-extrabold uppercase">
                              {club.category}
                            </span>
                            <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{club.members} Active Members</span>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-[hsl(var(--text-primary))] leading-snug">{club.name}</h3>
                            <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">Faculty Patron: {club.patron}</p>
                          </div>

                          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                            {club.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[hsl(var(--border))] space-y-3 text-xs">
                          <div className="space-y-1 text-[11px] text-[hsl(var(--text-tertiary))]">
                            <p>📅 <strong>Schedule:</strong> {club.schedule}</p>
                            <p>📍 <strong>Venue:</strong> {club.room}</p>
                          </div>

                          <button
                            onClick={() => {
                              setClubsData(prev => prev.map(item => item.id === club.id ? { ...item, joined: !item.joined } : item));
                              setClubsToast(club.joined ? `Left "${club.name}".` : `Successfully joined "${club.name}"!`);
                              setTimeout(() => setClubsToast(null), 3000);
                            }}
                            className={`w-full py-2.5 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                              club.joined
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            {club.joined ? 'Leave Club' : 'Join Club'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. MEETING SCHEDULES */}
                {clubsSubTab === 'schedules' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Weekly Club Meeting Schedules</h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Timetable mapping for all extracurricular club meetings and practice sessions.</p>
                    </div>

                    <div className="space-y-3">
                      {clubsData.map(club => (
                        <div key={club.id} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-purple-400 uppercase">{club.category}</span>
                            <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{club.name}</h4>
                            <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Patron: {club.patron} &bull; Room: {club.room}</p>
                          </div>

                          <div className="text-right flex-shrink-0 font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                            {club.schedule}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. EVENTS & COMPETITIONS */}
                {clubsSubTab === 'events' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {clubEventsData.map(ev => (
                        <div key={ev.id} className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-extrabold uppercase">
                                {ev.badge}
                              </span>
                              <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{ev.date}</span>
                            </div>

                            <div>
                              <h3 className="text-base font-black text-[hsl(var(--text-primary))] leading-snug">{ev.title}</h3>
                              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Organized by: {ev.club}</p>
                              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">📍 Venue: {ev.venue}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-between items-center text-xs">
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              {ev.registered ? `Status: ${ev.seatNo}` : 'Registration Open'}
                            </span>

                            <button
                              onClick={() => {
                                setClubEventsData(prev => prev.map(item => item.id === ev.id ? { ...item, registered: !item.registered, seatNo: 'Seat #22' } : item));
                                setClubsToast(ev.registered ? `Cancelled registration for "${ev.title}".` : `Registered for "${ev.title}"!`);
                                setTimeout(() => setClubsToast(null), 3000);
                              }}
                              className={`px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition-all ${
                                ev.registered
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                            >
                              {ev.registered ? 'Registered ✓' : 'Register for Event'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. ATTENDANCE & PARTICIPATION TRACKING */}
                {clubsSubTab === 'participation' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Club Participation &amp; Session Attendance</h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Overall club meeting attendance rate and active participation standing.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase block">Overall Attendance</span>
                        <span className="text-2xl font-black text-emerald-400">95% Average</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {clubsData.filter(c => c.joined).map(club => (
                        <div key={club.id} className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3 shadow-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{club.name}</h4>
                              <p className="text-xs text-[hsl(var(--text-tertiary))]">Role: {club.role} &bull; Patron: {club.patron}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-black text-emerald-400">{club.attendanceRate}</span>
                              <span className="text-[10px] text-[hsl(var(--text-tertiary))] block font-mono">{club.sessionsAttended}</span>
                            </div>
                          </div>

                          {/* Attendance Progress Bar */}
                          <div className="w-full bg-[hsl(var(--bg-tertiary))] h-2 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: club.attendanceRate }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. ACHIEVEMENTS & TROPHY CABINET */}
                {clubsSubTab === 'achievements' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {achievementsData.map(ach => (
                        <div key={ach.id} className={`glass-card p-6 border ${ach.color} rounded-3xl space-y-4 shadow-xl hover:-translate-y-1 transition-all text-center flex flex-col justify-between`}>
                          <div className="space-y-3">
                            <div className="text-4xl animate-bounce">{ach.icon}</div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">{ach.category}</span>
                              <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] mt-1 leading-snug">{ach.title}</h4>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[hsl(var(--border)/0.5)] text-[10px] font-mono text-[hsl(var(--text-tertiary))]">
                            <span>Issued By: {ach.issuedBy}</span>
                            <span className="block font-bold text-[hsl(var(--text-primary))] mt-0.5">{ach.awardedDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 8: Discipline, Conduct & Health Ledger */}
            {activeTab === 'welfare' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Conduct Standing Banner */}
                <div className="glass-card p-6 sm:p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold tracking-wider uppercase border border-emerald-500/30">
                        Behavior &amp; Conduct Transparency Ledger
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Discipline, Merits &amp; Conduct Portal
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Complete transparency on commendations, warnings, discipline records, merit points, and demerits to foster personal growth.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
                        <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">Net Standing</span>
                        <span className="text-xl font-black text-emerald-400">+75 Net Merits</span>
                        <span className="text-[10px] text-emerald-300 block font-semibold">Tier 1: Model Conduct</span>
                      </div>
                    </div>
                  </div>

                  {/* Discipline Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'overview', label: '📊 Conduct Overview' },
                      { id: 'commendations', label: '🌟 Commendations (3)' },
                      { id: 'warnings', label: '⚠️ Warnings (2)' },
                      { id: 'records', label: '📋 Discipline Records (2)' },
                      { id: 'merits', label: '🏆 Merit Points (+85)' },
                      { id: 'demerits', label: '🔻 Demerits (-10)' },
                      { id: 'health', label: '🏥 Health & Clinic Logs' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setDisciplineSubTab(st.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          disciplineSubTab === st.id
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. OVERVIEW VIEW */}
                {disciplineSubTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Summary KPI Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-emerald-400">
                          <span>COMMENDATIONS</span>
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-emerald-400">3 Citations</div>
                        <p className="text-[10px] text-emerald-300 font-semibold">Exemplary Character</p>
                      </div>

                      <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-amber-400">
                          <span>ACTIVE WARNINGS</span>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-[hsl(var(--text-primary))]">2 Advisories</div>
                        <p className="text-[10px] text-amber-400 font-semibold">All Resolved with Counseling</p>
                      </div>

                      <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-blue-400">
                          <span>TOTAL MERITS</span>
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-blue-400">+85 Points</div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Leadership &amp; Tutoring</p>
                      </div>

                      <div className="glass-card p-5 border border-rose-500/20 bg-rose-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-rose-400">
                          <span>TOTAL DEMERITS</span>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-black text-rose-400">-10 Points</div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Assembly &amp; Lab Apparel</p>
                      </div>
                    </div>

                    {/* Commendations Highlights */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center justify-between">
                        <span className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-400" /> Recent Commendations &amp; Honors</span>
                        <button onClick={() => setDisciplineSubTab('commendations')} className="text-xs text-emerald-400 hover:underline">View All &rarr;</button>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {commendationsData.map(com => (
                          <div key={com.id} className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold uppercase">
                                {com.badge}
                              </span>
                              <span className="font-mono text-emerald-400 font-bold">{com.pointsAwarded}</span>
                            </div>
                            <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-xs leading-snug">{com.title}</h4>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">By: {com.issuedBy}</p>
                            <p className="text-[11px] text-[hsl(var(--text-secondary))] pt-1 border-t border-[hsl(var(--border)/0.5)] leading-relaxed">{com.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Discipline Incident Log Table */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center justify-between">
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-400" /> Discipline Incident Records</span>
                        <button onClick={() => setDisciplineSubTab('records')} className="text-xs text-indigo-400 hover:underline">View All &rarr;</button>
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[hsl(var(--border))] font-mono text-[10px] text-[hsl(var(--text-tertiary))] uppercase">
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Incident / Category</th>
                              <th className="py-2.5 px-3">Reported By</th>
                              <th className="py-2.5 px-3">Action Taken</th>
                              <th className="py-2.5 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                            {disciplineRecordsData.map(rec => (
                              <tr key={rec.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-all">
                                <td className="py-3 px-3 font-mono text-[10px] text-[hsl(var(--text-tertiary))]">{rec.date}</td>
                                <td className="py-3 px-3">
                                  <span className="font-bold text-[hsl(var(--text-primary))]">{rec.incident}</span>
                                  <span className="block text-[10px] text-[hsl(var(--text-tertiary))]">{rec.category}</span>
                                </td>
                                <td className="py-3 px-3 text-[hsl(var(--text-secondary))]">{rec.reportedBy}</td>
                                <td className="py-3 px-3 text-amber-400 font-semibold">{rec.actionTaken}</td>
                                <td className="py-3 px-3 text-right">
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase">
                                    {rec.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COMMENDATIONS VIEW */}
                {disciplineSubTab === 'commendations' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400" /> Commendations &amp; Official Citations
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Recognition citations awarded for exemplary character, leadership, and service.</p>
                    </div>

                    <div className="space-y-4">
                      {commendationsData.map(com => (
                        <div key={com.id} className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                                {com.badge}
                              </span>
                              <h4 className="text-base font-extrabold text-[hsl(var(--text-primary))] mt-1">{com.title}</h4>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-md">
                              {com.pointsAwarded}
                            </span>
                          </div>
                          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{com.description}</p>
                          <div className="flex justify-between items-center text-[10px] font-mono text-[hsl(var(--text-tertiary))] pt-2 border-t border-[hsl(var(--border)/0.5)]">
                            <span>Issued By: {com.issuedBy}</span>
                            <span>Date: {com.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. WARNINGS & ADVISORIES VIEW */}
                {disciplineSubTab === 'warnings' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" /> Warnings &amp; Advisory Notices
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Official warning notes issued for minor school rule infractions with guidance support.</p>
                    </div>

                    <div className="space-y-4">
                      {warningsData.map(warn => (
                        <div key={warn.id} className="p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-3 shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                                {warn.status}
                              </span>
                              <h4 className="text-base font-extrabold text-[hsl(var(--text-primary))] mt-1">{warn.title}</h4>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-extrabold text-xs">
                              {warn.deduction}
                            </span>
                          </div>
                          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{warn.description}</p>
                          <div className="flex justify-between items-center text-[10px] font-mono text-[hsl(var(--text-tertiary))] pt-2 border-t border-[hsl(var(--border)/0.5)]">
                            <span>Issued By: {warn.issuedBy}</span>
                            <span>Date: {warn.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. DISCIPLINE INCIDENT RECORDS */}
                {disciplineSubTab === 'records' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" /> Discipline Incident Log
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Transparent record of all conduct notes, counseling outcomes, and corrective steps.</p>
                    </div>

                    <div className="space-y-4">
                      {disciplineRecordsData.map(rec => (
                        <div key={rec.id} className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3 shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold uppercase">
                                {rec.category} &bull; {rec.severity}
                              </span>
                              <h4 className="text-base font-extrabold text-[hsl(var(--text-primary))] mt-1">{rec.incident}</h4>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                              {rec.status}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border)/0.5)] text-xs text-[hsl(var(--text-primary))]">
                            <strong>Action / Outcome:</strong> {rec.actionTaken}
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-[hsl(var(--text-tertiary))] pt-1">
                            <span>Reported By: {rec.reportedBy}</span>
                            <span>Date: {rec.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. MERIT POINTS LEDGER */}
                {disciplineSubTab === 'merits' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-emerald-400" /> Merit Points History
                        </h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Earned merit points for academic, conduct, and leadership contributions.</p>
                      </div>
                      <span className="text-2xl font-black text-emerald-400">+85 Merits</span>
                    </div>

                    <div className="space-y-3">
                      {meritsData.map(m => (
                        <div key={m.id} className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">{m.category}</span>
                            <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{m.title}</h4>
                            <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{m.date}</span>
                          </div>
                          <span className="text-base font-black text-emerald-400">{m.points} Merits</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. DEMERIT POINTS LEDGER */}
                {disciplineSubTab === 'demerits' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-rose-400" /> Demerit Points History
                        </h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Demerit deductions logged for rule non-compliance.</p>
                      </div>
                      <span className="text-2xl font-black text-rose-400">-10 Demerits</span>
                    </div>

                    <div className="space-y-3">
                      {demeritsData.map(d => (
                        <div key={d.id} className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-rose-400 uppercase">{d.category}</span>
                            <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{d.title}</h4>
                            <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{d.date}</span>
                          </div>
                          <span className="text-base font-black text-rose-400">{d.points} Demerits</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. HEALTH & CLINIC LOGS */}
                {disciplineSubTab === 'health' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-400" /> School Clinic &amp; Medical Visit Records
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Log of health visits, medical check-ins, and treatments administered.</p>
                    </div>

                    <div className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-rose-400">Clinic Visit &bull; Asthmatic Inhaler Administration</span>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">May 12, 2026</span>
                      </div>
                      <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                        Attended school clinic during PE period due to mild shortness of breath. Two puffs of Ventolin inhaler administered by Nurse Abigail. Rested for 20 minutes before returning to class.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 8.5: Hostel & Boarding Accommodation Module (Optional Module for Boarding Schools) */}
            {activeTab === 'hostel' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner & Module Toggle Controls */}
                <div className="glass-card p-6 sm:p-8 border border-sky-500/20 bg-sky-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[11px] font-extrabold tracking-wider uppercase border border-sky-500/30">
                        Boarding School Accommodation
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Hostel &amp; Boarding Ledger
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        View hostel hall assignment, room number, bed allocation, house warden contact details, and room inspection notices.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Module Enable / Disable Toggle Switch */}
                      <button
                        onClick={() => {
                          setIsHostelModuleEnabled(!isHostelModuleEnabled);
                          setHostelToast(isHostelModuleEnabled ? 'Hostel module disabled (Switched to Day Student Mode).' : 'Hostel module enabled for Boarding Student!');
                          setTimeout(() => setHostelToast(null), 4000);
                        }}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                          isHostelModuleEnabled
                            ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        <Landmark className="w-4 h-4" />
                        {isHostelModuleEnabled ? 'Module Enabled ✓' : 'Module Disabled (Enable Boarding)'}
                      </button>
                    </div>
                  </div>

                  {hostelToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {hostelToast}
                    </div>
                  )}
                </div>

                {/* IF HOSTEL MODULE IS ENABLED */}
                {isHostelModuleEnabled ? (
                  <div className="space-y-6 animate-fade-in">
                    {/* 4 Primary Hostel Information Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 1. Hostel Hall */}
                      <div className="glass-card p-5 border border-sky-500/20 bg-sky-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-sky-400">
                          <span>HOSTEL HALL</span>
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="text-sm font-black text-[hsl(var(--text-primary))] leading-snug">{hostelData.hostelName}</div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Senior Secondary Wing</p>
                      </div>

                      {/* 2. Room Assignment */}
                      <div className="glass-card p-5 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-indigo-400">
                          <span>ROOM NUMBER</span>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="text-base font-black text-indigo-400">{hostelData.roomNumber}</div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{hostelData.dormitoryType}</p>
                      </div>

                      {/* 3. Bed Number */}
                      <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-emerald-400">
                          <span>BED ALLOCATION</span>
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div className="text-base font-black text-emerald-400">{hostelData.bedNumber}</div>
                        <p className="text-[10px] text-emerald-300 font-semibold">Assigned &amp; Verified</p>
                      </div>

                      {/* 4. Warden Contact */}
                      <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-1 shadow-md">
                        <div className="flex justify-between items-center text-xs font-extrabold text-purple-400">
                          <span>HOUSE WARDEN</span>
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-black text-[hsl(var(--text-primary))] leading-tight">{hostelData.wardenName}</div>
                        <p className="text-[9px] text-purple-300 font-mono mt-0.5">{hostelData.wardenContact}</p>
                      </div>
                    </div>

                    {/* Roommates & Dorm Rules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Roommates */}
                      <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                        <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center justify-between">
                          <span>Room Occupants &amp; Roommates ({hostelData.roommates.length})</span>
                          <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{hostelData.roomNumber}</span>
                        </h3>

                        <div className="space-y-2.5">
                          {hostelData.roommates.map((rm, idx) => (
                            <div key={idx} className="p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center text-xs font-bold text-[hsl(var(--text-primary))]">
                              <span>👤 {rm}</span>
                              <span className="text-[10px] text-sky-400 font-mono">Confirmed Resident</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Curfew & Dorm Rules */}
                      <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                        <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))]">Dormitory Guidelines &amp; Curfew</h3>
                        <div className="space-y-3 text-xs">
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                            <span className="font-extrabold uppercase block text-[10px]">Nightly Curfew &amp; Lights Out</span>
                            <p className="text-xs font-bold">{hostelData.curfewTime}</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1 text-[11px] text-[hsl(var(--text-secondary))]">
                            <p>&bull; Mandatory morning bed dressing by 07:15 AM prior to assembly.</p>
                            <p>&bull; High-wattage electrical cooking appliances are strictly prohibited.</p>
                            <p>&bull; Visitors allowed in common study lounge on Saturdays 02:00 PM - 05:00 PM.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Room Inspection Notices & Audits */}
                    <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-5 shadow-xl">
                      <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-sky-400" /> Dormitory Room Inspection Notices
                          </h3>
                          <p className="text-xs text-[hsl(var(--text-tertiary))]">Weekly room neatness reviews, curfew attendance audits, and safety inspections.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {hostelData.inspectionNotices.map(insp => (
                          <div key={insp.id} className="p-5 rounded-3xl border border-sky-500/20 bg-sky-500/5 space-y-3 shadow-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))]">{insp.title}</h4>
                                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Inspector: {insp.inspector}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-sky-600 text-white font-extrabold text-xs shadow-md">
                                {insp.score}
                              </span>
                            </div>

                            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                              <strong>Inspector Remarks:</strong> {insp.remarks}
                            </p>

                            <div className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] pt-2 border-t border-[hsl(var(--border)/0.5)]">
                              Inspection Date: {insp.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* IF HOSTEL MODULE IS DISABLED (DAY STUDENT MODE) */
                  <div className="glass-card p-12 border border-[hsl(var(--border))] rounded-3xl text-center space-y-5 shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-slate-500/10 text-slate-400 font-black text-2xl flex items-center justify-center mx-auto">
                      🏢
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Hostel &amp; Boarding Module Disabled</h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] max-w-md mx-auto mt-1 leading-relaxed">
                        This student account is currently configured in <strong>Day Student Mode</strong> (or the institution operates as a Day School).
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsHostelModuleEnabled(true);
                        setHostelToast('Hostel & Boarding Accommodation module activated for Boarding Student!');
                        setTimeout(() => setHostelToast(null), 4000);
                      }}
                      className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-lg transition-all"
                    >
                      Enable Boarding Accommodation
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 8.8: School Transport & Bus Tracking Module */}
            {activeTab === 'transport' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="glass-card p-6 sm:p-8 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-extrabold tracking-wider uppercase border border-amber-500/30">
                        School Fleet &amp; Commute Management
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        School Transport &amp; Bus Tracking
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        View assigned bus vehicle, driver profile, pickup &amp; drop-off times, route stop sequence, and live GPS map tracking.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setTransportToast('Refreshed Live GPS location. Bus #07 is currently 1.8 km away.');
                          setTimeout(() => setTransportToast(null), 3000);
                        }}
                        className="px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold shadow-md hover:bg-amber-500/30 transition-all flex items-center gap-2"
                      >
                        <Bus className="w-4 h-4" /> Refresh Live GPS
                      </button>
                    </div>
                  </div>

                  {transportToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {transportToast}
                    </div>
                  )}
                </div>

                {/* 4 Transport Key Detail Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Bus Vehicle */}
                  <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-1 shadow-md">
                    <div className="flex justify-between items-center text-xs font-extrabold text-amber-400">
                      <span>ASSIGNED BUS</span>
                      <Bus className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-black text-[hsl(var(--text-primary))] leading-snug">{transportData.busNumber}</div>
                    <p className="text-[10px] text-amber-300 font-mono font-bold">Plate: {transportData.plateNumber}</p>
                  </div>

                  {/* 2. Driver & Attendant */}
                  <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5 rounded-3xl space-y-1 shadow-md">
                    <div className="flex justify-between items-center text-xs font-extrabold text-blue-400">
                      <span>BUS DRIVER</span>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-black text-[hsl(var(--text-primary))] leading-tight">{transportData.driverName}</div>
                    <p className="text-[9px] text-blue-300 font-mono mt-0.5">{transportData.driverPhone}</p>
                  </div>

                  {/* 3. Scheduled Pickup */}
                  <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-1 shadow-md">
                    <div className="flex justify-between items-center text-xs font-extrabold text-emerald-400">
                      <span>MORNING PICKUP</span>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-base font-black text-emerald-400">{transportData.morningPickupTime}</div>
                    <p className="text-[10px] text-emerald-300 font-semibold">Afternoon Drop-off: {transportData.afternoonDropoffTime}</p>
                  </div>

                  {/* 4. Route Corridor */}
                  <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-1 shadow-md">
                    <div className="flex justify-between items-center text-xs font-extrabold text-purple-400">
                      <span>ASSIGNED ROUTE</span>
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-black text-[hsl(var(--text-primary))] leading-tight">{transportData.routeName}</div>
                    <p className="text-[9px] text-purple-300 font-bold mt-0.5">My Stop: Stop #4</p>
                  </div>
                </div>

                {/* Live GPS Map Simulation Card */}
                <div className="glass-card p-6 sm:p-8 border border-amber-500/20 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[hsl(var(--border))] pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase animate-pulse">
                        🛰️ {transportData.gpsStatus}
                      </span>
                      <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mt-1">Live Vehicle GPS Tracking</h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">Real-time bus location tracking and arrival estimate for your designated bus stop.</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase block font-bold">Estimated Arrival</span>
                      <span className="text-xl font-black text-amber-400">{transportData.liveEta}</span>
                    </div>
                  </div>

                  {/* Simulated GPS Visual Map Box */}
                  <div className="relative w-full h-56 rounded-3xl bg-slate-950 border border-amber-500/30 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
                    {/* Background Map Grid Effect */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Top Status Overlay */}
                    <div className="relative z-10 flex justify-between items-center text-xs">
                      <div className="bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 font-mono text-[11px] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Speed: {transportData.currentSpeed} &bull; Toyota Coaster #07
                      </div>

                      <a
                        href={`tel:${transportData.driverPhone}`}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md hover:bg-amber-400 transition-all flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Driver
                      </a>
                    </div>

                    {/* Bus Route Progress Bar Line */}
                    <div className="relative z-10 space-y-2 my-auto">
                      <div className="flex justify-between text-[11px] text-slate-300 font-mono font-bold">
                        <span>Central Depot (Start)</span>
                        <span className="text-amber-400 font-black animate-pulse">📍 Bus #07 (Approaching VGC Gate)</span>
                        <span>Campus Bus Bay (End)</span>
                      </div>

                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <div className="bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 h-full rounded-full w-[72%] transition-all duration-1000 shadow-lg relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-300 rounded-full border-2 border-slate-950 shadow-md animate-ping" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Location Info */}
                    <div className="relative z-10 flex justify-between items-center text-[11px] text-slate-400 font-mono">
                      <span>Driver: {transportData.driverName}</span>
                      <span>Target Stop: {transportData.myStop}</span>
                    </div>
                  </div>
                </div>

                {/* Route Stops Sequence Table */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-5 shadow-xl">
                  <div className="border-b border-[hsl(var(--border))] pb-3">
                    <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-amber-400" /> Route Stops &amp; Timetable Sequence
                    </h3>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">Sequential list of morning pickup stops along Route B.</p>
                  </div>

                  <div className="space-y-3">
                    {transportData.routeStops.map(stop => (
                      <div
                        key={stop.id}
                        className={`p-4 rounded-2xl border transition-all flex justify-between items-center text-xs ${
                          stop.status === 'Target Stop'
                            ? 'border-amber-500/40 bg-amber-500/10 text-[hsl(var(--text-primary))] shadow-md'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-secondary))]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{stop.icon}</span>
                          <div>
                            <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{stop.name}</h4>
                            <p className="text-[11px] font-mono text-[hsl(var(--text-tertiary))]">Scheduled Time: {stop.time}</p>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full font-extrabold text-[10px] ${
                            stop.status === 'Passed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : stop.status === 'Target Stop'
                              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                              : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]'
                          }`}
                        >
                          {stop.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 8.9: Official Documents & Downloads Vault */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="glass-card p-6 sm:p-8 border border-blue-500/20 bg-blue-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-extrabold tracking-wider uppercase border border-blue-500/30">
                        Official School Document Registry
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Documents &amp; Downloads Vault
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Preview &amp; download verified report cards, admission letters, digital ID card, academic certificates, fee receipts, timetables, and transcripts.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setDocumentsToast('Packaging all 11 official verified documents into ZIP archive... Download started!');
                        setTimeout(() => setDocumentsToast(null), 4000);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 self-start sm:self-center"
                    >
                      <Download className="w-4 h-4" /> Download All Files (.zip)
                    </button>
                  </div>

                  {documentsToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {documentsToast}
                    </div>
                  )}

                  {/* Document Category Filter Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'all', label: `📂 All Verified Documents (${studentDocumentsData.length})` },
                      { id: 'reports', label: '📊 Report Cards (2)' },
                      { id: 'admission', label: '📜 Admission Letter (1)' },
                      { id: 'id_card', label: '🪪 Digital ID Card (1)' },
                      { id: 'certificates', label: '🏆 Certificates (3)' },
                      { id: 'receipts', label: '💳 Fee Receipts (2)' },
                      { id: 'timetable', label: '📅 Timetable & Slip (1)' },
                      { id: 'transcript', label: '🎓 Academic Transcript (1)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setDocumentsCategory(tab.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          documentsCategory === tab.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DIGITAL ID CARD PREVIEW FEATURE BOX */}
                {(documentsCategory === 'all' || documentsCategory === 'id_card') && (
                  <div className="glass-card p-6 sm:p-8 border border-purple-500/20 bg-purple-500/5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          🪪 Official Digital Student Identity Card
                        </h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Digital access badge with QR code verification &amp; barcode ID.</p>
                      </div>
                      <button
                        onClick={() => {
                          setDocumentsToast('Downloaded Digital Student ID Card (PDF / Image Badge)');
                          setTimeout(() => setDocumentsToast(null), 3000);
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download ID Card
                      </button>
                    </div>

                    {/* ID Card Graphical Render Box */}
                    <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-purple-500/40 text-white space-y-4 shadow-2xl relative overflow-hidden">
                      <div className="flex justify-between items-start border-b border-purple-500/30 pb-3">
                        <div>
                          <span className="text-[9px] font-mono text-purple-300 uppercase tracking-widest block">ALBERT ACADEMY SENIOR HIGH</span>
                          <h4 className="text-sm font-black tracking-tight">OFFICIAL STUDENT IDENTIFICATION</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-extrabold border border-emerald-500/30">
                          VERIFIED
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-2xl border-2 border-white/20 shadow-inner flex-shrink-0">
                          EO
                        </div>
                        <div className="space-y-1 text-xs">
                          <h5 className="text-base font-black text-white leading-tight">{studentData.fullName}</h5>
                          <p className="text-[11px] text-purple-200 font-mono">ID: {studentData.studentId}</p>
                          <p className="text-[11px] text-slate-300">Grade: {studentData.className} &bull; {studentData.house}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Emergency Contact: +234-803-333-4455</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-purple-500/30 flex justify-between items-center text-[10px] font-mono text-purple-300">
                        <span>Issued: Sept 2024 &bull; Exp: July 2027</span>
                        <span className="font-bold text-amber-400">QR &amp; BARCODE ENCRYPTED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENT CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentDocumentsData
                    .filter(doc => documentsCategory === 'all' || doc.category === documentsCategory)
                    .map(doc => (
                      <div
                        key={doc.id}
                        className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-extrabold uppercase">
                              {doc.badge}
                            </span>
                            <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{doc.fileSize}</span>
                          </div>

                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{doc.icon}</span>
                            <div>
                              <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] leading-snug">{doc.title}</h3>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Issued By: {doc.issuedBy}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[hsl(var(--border))] space-y-3 text-xs">
                          <div className="flex justify-between items-center text-[10px] font-mono text-[hsl(var(--text-tertiary))]">
                            <span>Issue Date: {doc.date}</span>
                            <span className="text-emerald-400 font-bold">QR Verified ✓</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                if (doc.action === 'report_card') setShowReportCardModal(true);
                                else if (doc.action === 'transcript') setShowTranscriptModal(true);
                                else if (doc.action === 'timetable') handlePrintTimetable();
                                else {
                                  setDocumentsToast(`Opened preview for "${doc.title}".`);
                                  setTimeout(() => setDocumentsToast(null), 3000);
                                }
                              }}
                              className="py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold text-xs hover:bg-[hsl(var(--border))] transition-all flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" /> Preview
                            </button>

                            <button
                              onClick={() => {
                                setDocumentsToast(`Downloaded verified file: "${doc.title}" (${doc.fileSize}).`);
                                setTimeout(() => setDocumentsToast(null), 3500);
                              }}
                              className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tab 9: Fee Information & Payment Portal */}
            {activeTab === 'finance' && (
              <div className="space-y-6 animate-fade-in">
                {/* Finance Banner & Summary Cards */}
                <div className="glass-card p-6 sm:p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold tracking-wider uppercase border border-emerald-500/30">
                        Official Student Financial Ledger
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">
                        Fee Information &amp; Payment Portal
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        View outstanding balance, payment history, official receipts, and manage installment plans or pay online.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                      <button
                        onClick={() => setShowPayNowModal(true)}
                        className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" /> Pay Now Online
                      </button>
                      <button
                        onClick={() => handleAction('Download Financial Statement PDF')}
                        className="px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs font-bold hover:bg-[hsl(var(--border))] transition-all flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" /> Statement PDF
                      </button>
                    </div>
                  </div>

                  {paymentSuccessToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {paymentSuccessToast}
                    </div>
                  )}

                  {/* Financial KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[hsl(var(--border))]">
                    <div className="p-4 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-1">
                      <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Total Term Invoice</span>
                      <p className="text-lg font-black text-[hsl(var(--text-primary))]">₦250,000.00</p>
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">Invoice: INV-2026-0902</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Paid Fees</span>
                      <p className="text-lg font-black text-emerald-400">₦205,000.00</p>
                      <span className="text-[10px] text-emerald-300 font-semibold">82.0% Settled</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase">Outstanding Balance</span>
                      <p className="text-lg font-black text-rose-400">₦45,000.00</p>
                      <span className="text-[10px] text-rose-300 font-semibold">Due Aug 15, 2026</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Payment Standing</span>
                      <p className="text-sm font-black text-amber-400 mt-1">Partially Paid</p>
                      <span className="text-[10px] text-amber-300 font-semibold">Installment Plan Active</span>
                    </div>
                  </div>
                </div>

                {/* Installment Plans & Schedule */}
                <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" /> Approved Fee Installment Plan
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Term 2 tuition broken down into 3 structured payment installments.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      3 Installments
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {[
                      { num: 'Installment 1 of 3', amount: '₦105,000.00', due: 'Paid May 01, 2026', status: 'Paid in Full', receipt: 'REC-2026-0891', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
                      { num: 'Installment 2 of 3', amount: '₦100,000.00', due: 'Paid June 15, 2026', status: 'Paid in Full', receipt: 'REC-2026-1042', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
                      { num: 'Installment 3 of 3', amount: '₦45,000.00', due: 'Due August 15, 2026', status: 'Pending / Due', receipt: 'Pending', color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' }
                    ].map((inst, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border ${inst.color} space-y-2`}>
                        <div className="flex justify-between font-bold">
                          <span className="text-[11px] opacity-80">{inst.num}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-current">
                            {inst.status}
                          </span>
                        </div>
                        <p className="text-lg font-black text-[hsl(var(--text-primary))]">{inst.amount}</p>
                        <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-[hsl(var(--border)/0.5)]">
                          <span>{inst.due}</span>
                          <span className="font-semibold">{inst.receipt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment History & Official Receipts Table */}
                <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                    <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[hsl(var(--accent))]" /> Payment History &amp; Official Receipts
                    </h3>
                    <span className="text-xs font-mono text-[hsl(var(--text-tertiary))]">2 Verified Transactions</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))] font-mono text-[10px] text-[hsl(var(--text-tertiary))] uppercase">
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Transaction Ref</th>
                          <th className="py-2 px-3">Amount Paid</th>
                          <th className="py-2 px-3">Payment Method</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Receipt No</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[hsl(var(--border)/0.5)] font-semibold">
                        {[
                          { date: 'June 15, 2026', ref: 'TXN-882190', amount: '₦100,000.00', method: '💳 Visa / Mastercard Online', status: 'Completed', receipt: 'REC-2026-1042' },
                          { date: 'May 01, 2026', ref: 'TXN-773104', amount: '₦105,000.00', method: '📱 Mobile Money (MTN)', status: 'Completed', receipt: 'REC-2026-0891' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-all">
                            <td className="py-3 px-3 font-mono text-[11px] text-[hsl(var(--text-secondary))]">{row.date}</td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[hsl(var(--text-primary))]">{row.ref}</td>
                            <td className="py-3 px-3 font-extrabold text-emerald-400">{row.amount}</td>
                            <td className="py-3 px-3 text-[11px] text-[hsl(var(--text-secondary))]">{row.method}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[hsl(var(--accent))]">{row.receipt}</td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleAction(`Download Receipt ${row.receipt} PDF`)}
                                className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-[11px] font-bold hover:bg-[hsl(var(--border))] transition-all flex items-center gap-1 ml-auto"
                              >
                                <Download className="w-3 h-3" /> Receipt PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PAY NOW ONLINE PAYMENT MODAL */}
                {showPayNowModal && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card max-w-md w-full p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-2xl relative">
                      <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-4">
                        <div>
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Secure Payment Gateway</span>
                          <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mt-0.5">Pay Tuition Fees Online</h3>
                        </div>
                        <button
                          onClick={() => setShowPayNowModal(false)}
                          className="w-8 h-8 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] font-bold flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-4 text-xs">
                        {/* Amount Input */}
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">
                            Payment Amount (₦)
                          </label>
                          <input
                            type="number"
                            value={payAmountInput}
                            onChange={e => setPayAmountInput(e.target.value)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-base font-black text-[hsl(var(--text-primary))] focus:outline-none focus:border-emerald-500"
                          />
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Outstanding Balance: ₦45,000.00</p>
                        </div>

                        {/* Payment Method Selector */}
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">
                            Select Payment Method
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'card', label: '💳 Card' },
                              { id: 'momo', label: '📱 MoMo' },
                              { id: 'bank', label: '🏦 Bank' }
                            ].map(m => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedPayMethod(m.id as any)}
                                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                                  selectedPayMethod === m.id
                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md'
                                    : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)] text-[hsl(var(--text-secondary))]'
                                }`}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment Details Input */}
                        {selectedPayMethod === 'card' && (
                          <div className="space-y-2.5 p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]">
                            <input type="text" placeholder="Card Number (4000 1234 5678 9010)" className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--text-primary))]" />
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="MM/YY" className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--text-primary))]" />
                              <input type="text" placeholder="CVV" className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--text-primary))]" />
                            </div>
                          </div>
                        )}

                        {selectedPayMethod === 'momo' && (
                          <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-2">
                            <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold">Mobile Money Number</label>
                            <input type="text" placeholder="+233 24 123 4567 / +234 80 1234 5678" className="w-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--text-primary))]" />
                          </div>
                        )}

                        {selectedPayMethod === 'bank' && (
                          <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-1 font-mono text-[11px]">
                            <p className="font-bold text-[hsl(var(--text-primary))]">Bank Account Details:</p>
                            <p className="text-[hsl(var(--text-secondary))]">Bank: Zenith Bank PLC</p>
                            <p className="text-[hsl(var(--text-secondary))]">Account No: 1019283746</p>
                            <p className="text-[hsl(var(--text-secondary))]">Name: St. Jude International School</p>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer Buttons */}
                      <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                        <button
                          type="button"
                          onClick={() => setShowPayNowModal(false)}
                          className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] font-bold text-xs hover:bg-[hsl(var(--bg-tertiary))]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isProcessingPayment}
                          onClick={() => {
                            setIsProcessingPayment(true);
                            setTimeout(() => {
                              setIsProcessingPayment(false);
                              setShowPayNowModal(false);
                              setPaymentSuccessToast(`Payment of ₦${Number(payAmountInput).toLocaleString()} processed successfully! Receipt REC-2026-1192 generated.`);
                              setTimeout(() => setPaymentSuccessToast(null), 5000);
                            }, 1500);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                        >
                          {isProcessingPayment ? (
                            <>Processing Payment...</>
                          ) : (
                            <>Confirm &amp; Pay ₦{Number(payAmountInput).toLocaleString()}</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 10: AI Learning Assistant & Curriculum Copilot (Optional Module) */}
            {activeTab === 'ai-copilot' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner & Enable/Disable Toggle */}
                <div className="glass-card p-6 sm:p-8 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-extrabold tracking-wider uppercase border border-indigo-500/30">
                          AI Learning Engine v3.5
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-bold border border-purple-500/20">
                          Curriculum Aligned (WAEC / IGCSE / SAT)
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-indigo-400" /> AI Learning Assistant &amp; Curriculum Copilot
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Personalized AI tutor to explain lessons, generate practice quizzes, summarize class notes, recommend study plans, answer curriculum Q&amp;A, and diagnose weak topics.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Module Enable / Disable Toggle Switch */}
                      <button
                        onClick={() => {
                          setIsAiAssistantEnabled(!isAiAssistantEnabled);
                          setAiAssistantToast(
                            !isAiAssistantEnabled
                              ? 'AI Learning Assistant enabled for self-directed study!'
                              : 'AI Learning Assistant module disabled.'
                          );
                          setTimeout(() => setAiAssistantToast(null), 3500);
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                          isAiAssistantEnabled
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        {isAiAssistantEnabled ? 'Module Enabled ✓' : 'Module Disabled (Enable AI)'}
                      </button>
                    </div>
                  </div>

                  {aiAssistantToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {aiAssistantToast}
                    </div>
                  )}

                  {/* AI Assistant Sub-Navigation Tabs */}
                  {isAiAssistantEnabled && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                      {[
                        { id: 'explain', label: '📖 Explain Lessons' },
                        { id: 'quiz', label: '🧪 Generate Quizzes' },
                        { id: 'summarize', label: '📝 Summarize Notes' },
                        { id: 'study_plan', label: '📅 Recommend Study Plans' },
                        { id: 'qa', label: '💬 Curriculum Q&A' },
                        { id: 'weak_topics', label: '🎯 Identify Weak Topics' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setAiSubTab(st.id as any)}
                          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                            aiSubTab === st.id
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* MODULE DISABLED STATE BANNER */}
                {!isAiAssistantEnabled ? (
                  <div className="glass-card p-12 text-center border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 font-black text-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                      🤖
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">AI Learning Assistant is Disabled</h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                        The AI Learning Assistant module is currently turned off for your profile. Click the toggle button in the header above to activate AI lesson explanations, quiz generators, and study plan recommendations.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAiAssistantEnabled(true);
                        setAiAssistantToast('AI Learning Assistant enabled for self-directed study!');
                        setTimeout(() => setAiAssistantToast(null), 3500);
                      }}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs shadow-lg hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Enable AI Assistant Now
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 1. EXPLAIN LESSONS FEATURE */}
                    {aiSubTab === 'explain' && (
                      <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                        <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                              📖 AI Interactive Lesson Explainer
                            </h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))]">Enter any curriculum topic to generate clear concept breakdowns, formulas, and real-life examples.</p>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Quick Presets / Custom Topic</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {[
                                'Organic Chemistry: Electrophilic Addition',
                                'Calculus: Integration by Parts',
                                'Newton’s Laws of Motion',
                                'Photosynthesis: Calvin Cycle'
                              ].map(preset => (
                                <button
                                  key={preset}
                                  onClick={() => setAiLessonTopic(preset)}
                                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                                    aiLessonTopic === preset
                                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                                      : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))]'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>

                            <input
                              type="text"
                              value={aiLessonTopic}
                              onChange={e => setAiLessonTopic(e.target.value)}
                              placeholder="Enter lesson concept (e.g. Quadratic Formula, Photosynthesis, French Grammar)..."
                              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-3.5 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setIsGeneratingExplanation(true);
                                setAiLessonExplanation(null);
                                setTimeout(() => {
                                  setIsGeneratingExplanation(false);
                                  setAiLessonExplanation(
                                    `### Concept Breakdown: ${aiLessonTopic}\n\n1. **Core Principle**: Electrophilic addition is a reaction where a double carbon bond (alkene) opens up to add electrophiles (electron-seeking species) across the double bond.\n\n2. **Key Steps**:\n   - **Step 1**: The electron-rich C=C double bond attacks the electrophile H⁺, forming a stable **carbocation intermediate**.\n   - **Step 2**: The halide ion (Cl⁻/Br⁻) attacks the positive carbocation to yield an alkyl halide product.\n\n3. **Markovnikov Rule**: The hydrogen atom adds to the carbon atom that already possesses the greater number of hydrogen atoms.\n\n4. **Real-Life Application**: Essential process in industrial polymer manufacturing (making polyethylene plastics) and pharmaceutical drug synthesis.`
                                  );
                                }, 1200);
                              }}
                              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" /> {isGeneratingExplanation ? 'Generating Explanation...' : 'Explain Lesson Concept'}
                            </button>
                          </div>

                          {(aiLessonExplanation || isGeneratingExplanation) && (
                            <div className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-xs text-[hsl(var(--text-primary))] space-y-3 shadow-inner">
                              {isGeneratingExplanation ? (
                                <div className="flex items-center gap-2 text-indigo-400 font-bold animate-pulse">
                                  <Sparkles className="w-4 h-4 animate-spin" /> AI Tutor is synthesizing curriculum lesson breakdown...
                                </div>
                              ) : (
                                <div className="space-y-3 leading-relaxed whitespace-pre-line font-sans">
                                  <div className="flex justify-between items-center border-b border-indigo-500/20 pb-2">
                                    <span className="font-mono text-[10px] text-indigo-300 uppercase tracking-wider">AI TUTOR EXPLANATION</span>
                                    <span className="text-[10px] text-emerald-400 font-bold">Verified Curriculum Explanation ✓</span>
                                  </div>
                                  <p>{aiLessonExplanation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. GENERATE QUIZZES FEATURE */}
                    {aiSubTab === 'quiz' && (
                      <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                        <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                              🧪 AI Practice Quiz Generator
                            </h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))]">Generate interactive 5-question quizzes with instant scoring and explanations.</p>
                          </div>
                          {quizScore !== null && (
                            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                              Quiz Score: {quizScore} / {aiQuizQuestions?.length || 0}
                            </span>
                          )}
                        </div>

                        <div className="space-y-6 text-xs">
                          {/* Subject Selector */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                            <div>
                              <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold block">Selected Quiz Subject</span>
                              <span className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{aiQuizSubject}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={aiQuizSubject}
                                onChange={e => setAiQuizSubject(e.target.value)}
                                className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--text-primary))]"
                              >
                                <option>Mathematics (Algebra &amp; Proofs)</option>
                                <option>Organic Chemistry (CHEM-202)</option>
                                <option>Modern Physics (PHYS-201)</option>
                                <option>English Literature (ENG-301)</option>
                              </select>
                              <button
                                onClick={() => {
                                  setQuizScore(null);
                                  setAiQuizQuestions([
                                    {
                                      id: 'q1',
                                      question: 'In the quadratic equation ax² + bx + c = 0, what does the discriminant (b² - 4ac) determine?',
                                      options: ['The sum of the roots', 'The number and nature of real roots', 'The y-intercept', 'The vertex coordinate'],
                                      correctAnswer: 1,
                                      selectedAnswer: null,
                                      explanation: 'The discriminant b² - 4ac indicates whether the quadratic has 2 distinct real roots (>0), 1 repeated real root (=0), or complex roots (<0).'
                                    },
                                    {
                                      id: 'q2',
                                      question: 'Which property guarantees that if a line is tangent to a circle, it is perpendicular to the radius at the point of contact?',
                                      options: ['Pythagorean Theorem', 'Radius-Tangent Theorem', 'Chord Inscribed Theorem', 'Secant Segment Rule'],
                                      correctAnswer: 1,
                                      selectedAnswer: null,
                                      explanation: 'The Radius-Tangent Theorem states that a tangent to a circle is always perpendicular to the radius drawn to the point of tangency.'
                                    }
                                  ]);
                                  setAiAssistantToast(`Generated new AI Quiz for ${aiQuizSubject}!`);
                                  setTimeout(() => setAiAssistantToast(null), 3000);
                                }}
                                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Generate Quiz
                              </button>
                            </div>
                          </div>

                          {/* Quiz Questions List */}
                          <div className="space-y-4">
                            {aiQuizQuestions?.map((q, qIdx) => (
                              <div key={q.id} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3 shadow-md">
                                <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">
                                  Q{qIdx + 1}. {q.question}
                                </h4>

                                <div className="space-y-2">
                                  {q.options.map((opt: string, oIdx: number) => {
                                    const isSelected = q.selectedAnswer === oIdx;
                                    const isCorrect = q.correctAnswer === oIdx;
                                    let btnStyle = 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)] text-[hsl(var(--text-secondary))]';

                                    if (quizScore !== null) {
                                      if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
                                      else if (isSelected && !isCorrect) btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-300 font-bold';
                                    } else if (isSelected) {
                                      btnStyle = 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold';
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        onClick={() => {
                                          if (quizScore !== null) return;
                                          setAiQuizQuestions(prev => prev?.map((item, i) => i === qIdx ? { ...item, selectedAnswer: oIdx } : item) || null);
                                        }}
                                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex justify-between items-center ${btnStyle}`}
                                      >
                                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                        {quizScore !== null && isCorrect && <span className="text-emerald-400 font-bold text-[10px]">Correct ✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>

                                {quizScore !== null && (
                                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] font-mono">
                                    💡 <strong>Explanation:</strong> {q.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                if (!aiQuizQuestions) return;
                                let correct = 0;
                                aiQuizQuestions.forEach(q => {
                                  if (q.selectedAnswer === q.correctAnswer) correct++;
                                });
                                setQuizScore(correct);
                                setAiAssistantToast(`Quiz scored! You got ${correct} / ${aiQuizQuestions.length} correct.`);
                                setTimeout(() => setAiAssistantToast(null), 3500);
                              }}
                              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Submit Answers &amp; Grade Quiz
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. SUMMARIZE NOTES FEATURE */}
                    {aiSubTab === 'summarize' && (
                      <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                        <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                              📝 AI Class Note Summarizer &amp; Flashcard Generator
                            </h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))]">Paste class lecture notes or textbook passages to extract bulleted executive summaries and flashcards.</p>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Paste Lecture Notes or Passage</label>
                            <textarea
                              value={aiNoteText}
                              onChange={e => setAiNoteText(e.target.value)}
                              placeholder="Paste lecture notes here..."
                              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-4 text-xs text-[hsl(var(--text-primary))] h-32 focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setAiNoteSummaryResult({
                                  summary: [
                                    'Photosynthesis occurs inside chloroplast organelles using chlorophyll pigment to capture light energy.',
                                    'Light-dependent reaction generates high-energy ATP and NADPH electron carriers.',
                                    'Calvin Cycle (light-independent) utilizes RuBisCO enzyme for carbon fixation into glucose sugar.'
                                  ],
                                  flashcards: [
                                    { front: 'Where does photosynthesis occur?', back: 'Chloroplast organelles in plant cell leaves.' },
                                    { front: 'What is the primary carbon-fixing enzyme?', back: 'RuBisCO in the Calvin Cycle.' }
                                  ]
                                });
                                setAiAssistantToast('Summarized class notes & created revision flashcard deck!');
                                setTimeout(() => setAiAssistantToast(null), 3000);
                              }}
                              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" /> Summarize Notes &amp; Create Flashcards
                            </button>
                          </div>

                          {aiNoteSummaryResult && (
                            <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-4 shadow-inner">
                              <h4 className="font-extrabold text-purple-300 text-sm flex items-center gap-2">
                                ✨ Executive Summary &amp; Key Takeaways
                              </h4>
                              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[hsl(var(--text-secondary))]">
                                {aiNoteSummaryResult.summary.map((bullet: string, bIdx: number) => (
                                  <li key={bIdx}>{bullet}</li>
                                ))}
                              </ul>

                              <div className="pt-3 border-t border-purple-500/20 space-y-2">
                                <span className="text-[10px] font-mono text-purple-300 uppercase font-bold">REVISION FLASHCARDS DECK</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {aiNoteSummaryResult.flashcards.map((fc: any, fcIdx: number) => (
                                    <div key={fcIdx} className="p-4 rounded-xl border border-purple-500/20 bg-[hsl(var(--bg-secondary))] space-y-1 text-xs">
                                      <p className="font-bold text-[hsl(var(--text-primary))]">Q: {fc.front}</p>
                                      <p className="text-[11px] text-purple-300 font-mono">A: {fc.back}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 4. RECOMMEND STUDY PLANS FEATURE */}
                    {aiSubTab === 'study_plan' && (
                      <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                        <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                              📅 AI Personalized Study Plan Generator
                            </h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))]">Automated study schedule customized to your target GPA and weak subject areas.</p>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Academic Goal / Target GPA</label>
                            <input
                              type="text"
                              value={aiStudyPlanTarget}
                              onChange={e => setAiStudyPlanTarget(e.target.value)}
                              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-3.5 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-indigo-500 font-bold"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setAiGeneratedStudyPlan([
                                  { day: 'Monday (04:30 PM - 06:00 PM)', subject: 'Organic Chemistry (CHEM-202)', activity: 'Practice Electrophilic Addition reaction mechanisms & mechanism diagrams.', focus: 'Weak Topic (+5% boost needed)' },
                                  { day: 'Wednesday (05:00 PM - 06:30 PM)', subject: 'World History (HIST-102)', activity: 'Draft 3 essay thesis statements with chronological citations.', focus: 'Essay Formatting Boost' },
                                  { day: 'Friday (04:00 PM - 05:30 PM)', subject: 'Mathematics (MATH-101)', activity: 'Solve past exam questions on polynomial derivations.', focus: 'Mastery Consolidation' }
                                ]);
                                setAiAssistantToast('Generated customized weekly study schedule!');
                                setTimeout(() => setAiAssistantToast(null), 3000);
                              }}
                              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" /> Recommend Study Plan
                            </button>
                          </div>

                          {aiGeneratedStudyPlan && (
                            <div className="space-y-3">
                              {aiGeneratedStudyPlan.map((plan, pIdx) => (
                                <div key={pIdx} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-md">
                                  <div>
                                    <span className="text-[10px] font-mono text-indigo-400 font-bold">{plan.day}</span>
                                    <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm mt-0.5">{plan.subject}</h4>
                                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{plan.activity}</p>
                                  </div>

                                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-extrabold self-start sm:self-center">
                                    {plan.focus}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 5. CURRICULUM Q&A TUTOR FEATURE */}
                    {aiSubTab === 'qa' && (
                      <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                        <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                              💬 AI Curriculum Q&amp;A Conversational Tutor
                            </h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))]">Ask any STEM, Literature, or History question for instant step-by-step guidance.</p>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Ask a Curriculum Question</label>
                            <input
                              type="text"
                              value={aiQaPrompt}
                              onChange={e => setAiQaPrompt(e.target.value)}
                              placeholder="e.g. How do I balance redox equations in basic solution?"
                              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl p-3.5 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setAiQaResponse(
                                  `**Newton’s Second Law of Motion** states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass: **F = m × a**.\n\n**Real-Life Example**: Pushing a grocery cart. An empty cart (small mass) accelerates quickly with a light push. A full cart (heavy mass) requires much more force to achieve the exact same acceleration.`
                                );
                              }}
                              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                            >
                              <Send className="w-4 h-4" /> Ask AI Tutor
                            </button>
                          </div>

                          {aiQaResponse && (
                            <div className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-xs text-[hsl(var(--text-primary))] space-y-2 whitespace-pre-line leading-relaxed shadow-inner">
                              <span className="font-bold text-indigo-400 block border-b border-indigo-500/20 pb-1">AI Tutor Answer:</span>
                              <p>{aiQaResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 6. IDENTIFY WEAK TOPICS FEATURE */}
                    {aiSubTab === 'weak_topics' && (
                      <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                        <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                              🎯 Curriculum Diagnostic &amp; Weak Topic Finder
                            </h3>
                            <p className="text-xs text-[hsl(var(--text-tertiary))]">Automated analysis highlighting curriculum topics requiring review prior to term finals.</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {weakTopicsData.map(topic => (
                            <div key={topic.id} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3 shadow-md">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                  <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] uppercase block">{topic.subject}</span>
                                  <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm mt-0.5">{topic.topicName}</h4>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${topic.badgeColor} self-start sm:self-center`}>
                                  {topic.status} (Mastery: {topic.masteryScore}%)
                                </span>
                              </div>

                              <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] flex flex-wrap justify-between items-center gap-2 text-xs">
                                <p className="text-xs text-[hsl(var(--text-secondary))]">💡 <strong>AI Tip:</strong> {topic.recommendation}</p>

                                <button
                                  onClick={() => {
                                    setAiLessonTopic(topic.topicName);
                                    setAiSubTab('explain');
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1"
                                >
                                  Start AI Lesson Review <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
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

            {/* Tab 11.5: Help & Support Desk Module */}
            {activeTab === 'support' && (
              <div className="space-y-6 animate-fade-in text-xs">
                {/* Header Banner & New Ticket Action */}
                <div className="glass-card p-6 sm:p-8 border border-blue-500/20 bg-blue-500/5 rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-extrabold tracking-wider uppercase border border-blue-500/30">
                        Student Care &amp; ICT Helpdesk
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-blue-400" /> Help &amp; Support Desk
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Report portal issues, contact ICT support, search FAQs knowledge base, and track your active support tickets.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowNewTicketModal(true)}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 self-start sm:self-center"
                    >
                      <PlusCircle className="w-4 h-4" /> Submit Support Ticket
                    </button>
                  </div>

                  {supportToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {supportToast}
                    </div>
                  )}

                  {/* Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    {[
                      { id: 'faqs', label: '❓ Knowledge Base FAQs' },
                      { id: 'tickets', label: `🎟️ Active Tickets (${supportTickets.length})` },
                      { id: 'ict_contact', label: '💻 Contact ICT Support' },
                      { id: 'report_issue', label: '🚨 Report Portal Issue' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setSupportSubTab(st.id as any)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                          supportSubTab === st.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. FAQS KNOWLEDGE BASE FEATURE */}
                {supportSubTab === 'faqs' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          ❓ Frequently Asked Questions (FAQs)
                        </h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Search instant answers to common portal, academic, and fee questions.</p>
                      </div>

                      {/* FAQ Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[hsl(var(--text-tertiary))]" />
                        <input
                          type="text"
                          value={faqSearchQuery}
                          onChange={e => setFaqSearchQuery(e.target.value)}
                          placeholder="Search FAQs..."
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl pl-9 pr-3 py-2 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {['all', 'Portal & Passwords', 'Academics & Transcripts', 'Fees & Payments', 'Hostel & Transport'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedFaqCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                            selectedFaqCategory === cat
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))]'
                          }`}
                        >
                          {cat === 'all' ? 'All FAQs' : cat}
                        </button>
                      ))}
                    </div>

                    {/* FAQ List Accordions */}
                    <div className="space-y-3">
                      {faqList
                        .filter(f => selectedFaqCategory === 'all' || f.category === selectedFaqCategory)
                        .filter(f => !faqSearchQuery || f.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || f.answer.toLowerCase().includes(faqSearchQuery.toLowerCase()))
                        .map(faq => (
                          <div key={faq.id} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-2 shadow-md">
                            <div className="flex justify-between items-center">
                              <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{faq.question}</h4>
                              <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[9px] font-bold border border-blue-500/20">
                                {faq.category}
                              </span>
                            </div>
                            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed pt-1 border-t border-[hsl(var(--border)/0.5)]">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. SUPPORT TICKETS TRACKER FEATURE */}
                {supportSubTab === 'tickets' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          🎟️ Active Support Tickets Tracker
                        </h3>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">View progress and technician responses for your submitted helpdesk tickets.</p>
                      </div>

                      <button
                        onClick={() => setShowNewTicketModal(true)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Ticket
                      </button>
                    </div>

                    <div className="space-y-4">
                      {supportTickets.map(ticket => (
                        <div key={ticket.id} className={`p-5 rounded-2xl border ${ticket.color} space-y-3 shadow-md`}>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[hsl(var(--border)/0.5)] pb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">{ticket.id}</span>
                                <span className="px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] text-[10px] font-bold">
                                  {ticket.category}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">{ticket.subject}</h4>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <span className="px-3 py-1 rounded-full text-[10px] font-black border border-current">
                                Priority: {ticket.priority}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                                {ticket.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-[hsl(var(--text-tertiary))] font-mono">
                            <span>Assigned Tech: <strong className="text-[hsl(var(--text-primary))]">{ticket.assignedTo}</strong></span>
                            <span>Created: {ticket.createdAt} &bull; Updated: {ticket.updatedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CONTACT ICT SUPPORT FEATURE */}
                {supportSubTab === 'ict_contact' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                        💻 Contact School ICT Helpdesk
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Direct support channels for technical assistance, password resets, and hardware issues.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Live Chat Card */}
                      <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-3 shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                          💬
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">Live ICT Chat</h4>
                          <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5">Average response time: &lt; 5 mins (Mon-Fri, 08:00 AM - 05:00 PM).</p>
                        </div>
                        <button
                          onClick={() => {
                            setSupportToast('Initiated Live Chat with ICT Support Specialist!');
                            setTimeout(() => setSupportToast(null), 3500);
                          }}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Start Live Chat
                        </button>
                      </div>

                      {/* Email Support Card */}
                      <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-3 shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                          📧
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">Email ICT Desk</h4>
                          <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5">Direct email line: support@schoolsaas.com (24hr response guarantee).</p>
                        </div>
                        <a
                          href="mailto:support@schoolsaas.com"
                          className="block text-center w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Send Email
                        </a>
                      </div>

                      {/* Phone Hotline Card */}
                      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                          📞
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-sm">Phone Hotline</h4>
                          <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5">Toll-Free ICT Line: +234 800 SCH HELP (+234-800-724-4357).</p>
                        </div>
                        <button
                          onClick={() => {
                            setSupportToast('Calling ICT Hotline (+234-800-SCH-HELP)...');
                            setTimeout(() => setSupportToast(null), 3500);
                          }}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Call Support
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. REPORT PORTAL ISSUE WIZARD FEATURE */}
                {supportSubTab === 'report_issue' && (
                  <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl animate-fade-in">
                    <div className="border-b border-[hsl(var(--border))] pb-3">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                        🚨 Report Portal Technical Issue
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Report a bug, broken page link, or grading discrepancy directly to system engineering.</p>
                    </div>

                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (!ticketSubject.trim()) return;
                        const newId = `TICK-8842-0${supportTickets.length + 1}`;
                        setSupportTickets(prev => [
                          {
                            id: newId,
                            category: ticketCategory,
                            subject: ticketSubject,
                            priority: ticketPriority,
                            status: 'Open',
                            assignedTo: 'ICT Helpdesk Team',
                            createdAt: 'Just now',
                            updatedAt: 'Just now',
                            color: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                          },
                          ...prev
                        ]);
                        setSupportToast(`Reported issue successfully! Created Ticket ${newId}.`);
                        setTicketSubject('');
                        setTicketDescription('');
                        setSupportSubTab('tickets');
                        setTimeout(() => setSupportToast(null), 4000);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Issue Category</label>
                          <select
                            value={ticketCategory}
                            onChange={e => setTicketCategory(e.target.value)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-xs text-[hsl(var(--text-primary))]"
                          >
                            <option>ICT &amp; Portal Login</option>
                            <option>LMS Courseware &amp; Labs</option>
                            <option>Grade &amp; Transcript Discrepancy</option>
                            <option>Cafeteria &amp; Digital ID</option>
                            <option>Hostel &amp; Maintenance</option>
                            <option>Transport &amp; Bus Route</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Urgency / Priority</label>
                          <select
                            value={ticketPriority}
                            onChange={e => setTicketPriority(e.target.value)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-xs text-[hsl(var(--text-primary))]"
                          >
                            <option>Low (General Inquiry)</option>
                            <option>Medium (Standard Issue)</option>
                            <option>High (Urgent / Exam Blocked)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Issue Title / Subject</label>
                        <input
                          type="text"
                          value={ticketSubject}
                          onChange={e => setTicketSubject(e.target.value)}
                          placeholder="Brief summary of the issue (e.g. Unable to submit Homework #3 PDF)..."
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-xs text-[hsl(var(--text-primary))]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1.5">Detailed Description</label>
                        <textarea
                          value={ticketDescription}
                          onChange={e => setTicketDescription(e.target.value)}
                          placeholder="Provide steps to reproduce the issue..."
                          className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-3 text-xs text-[hsl(var(--text-primary))] h-28 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" /> Submit Technical Issue
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* SUBMIT SUPPORT TICKET MODAL */}
                {showNewTicketModal && (
                  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card max-w-lg w-full p-6 border border-blue-500/30 rounded-3xl space-y-4 shadow-2xl bg-[hsl(var(--bg-secondary))] text-xs">
                      <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                          <PlusCircle className="w-5 h-5 text-blue-400" /> Create Support Ticket
                        </h3>
                        <button onClick={() => setShowNewTicketModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-white font-bold">✕</button>
                      </div>

                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          if (!ticketSubject.trim()) return;
                          const newId = `TICK-8842-0${supportTickets.length + 1}`;
                          setSupportTickets(prev => [
                            {
                              id: newId,
                              category: ticketCategory,
                              subject: ticketSubject,
                              priority: ticketPriority,
                              status: 'Open',
                              assignedTo: 'ICT Helpdesk Desk',
                              createdAt: 'Just now',
                              updatedAt: 'Just now',
                              color: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                            },
                            ...prev
                          ]);
                          setSupportToast(`Created Ticket ${newId} successfully!`);
                          setTicketSubject('');
                          setTicketDescription('');
                          setShowNewTicketModal(false);
                          setSupportSubTab('tickets');
                          setTimeout(() => setSupportToast(null), 4000);
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Category</label>
                          <select
                            value={ticketCategory}
                            onChange={e => setTicketCategory(e.target.value)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-xs text-[hsl(var(--text-primary))]"
                          >
                            <option>ICT &amp; Portal Login</option>
                            <option>LMS Courseware &amp; Labs</option>
                            <option>Grade &amp; Transcript Discrepancy</option>
                            <option>Cafeteria &amp; Digital ID</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Subject</label>
                          <input
                            type="text"
                            value={ticketSubject}
                            onChange={e => setTicketSubject(e.target.value)}
                            placeholder="Brief description of request..."
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-xs text-[hsl(var(--text-primary))]"
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowNewTicketModal(false)}
                            className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-bold text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-md"
                          >
                            Submit Ticket
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 12: Comprehensive Settings & Student Preferences Center */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in text-xs">
                {/* Header Banner & Save Controls */}
                <div className="glass-card p-6 sm:p-8 border border-[hsl(var(--border))] rounded-3xl space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-extrabold tracking-wider uppercase border border-indigo-500/30">
                        Account Controls &amp; Preferences
                      </span>
                      <h2 className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-400" /> Settings &amp; Student Preferences
                      </h2>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">
                        Manage your theme, language, notification channels, password security, and two-factor authentication.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSettingsToast('Student preferences and notification settings saved!');
                        setTimeout(() => setSettingsToast(null), 3500);
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 self-start sm:self-center"
                    >
                      <Save className="w-4 h-4" /> Save Preferences
                    </button>
                  </div>

                  {settingsToast && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-extrabold text-xs flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> {settingsToast}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT COLUMN: APPEARANCE, NOTIFICATIONS, SECURITY */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* 1. THEME & LANGUAGE PREFERENCES */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
                        🎨 Theme &amp; Language Customization
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Theme Switcher */}
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-2">Display Theme</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'dark', label: '🌙 Dark' },
                              { id: 'light', label: '☀️ Light' },
                              { id: 'system', label: '💻 System' }
                            ].map(t => (
                              <button
                                key={t.id}
                                onClick={() => setSelectedTheme(t.id as any)}
                                className={`p-2.5 rounded-xl border text-center font-bold transition-all text-xs ${
                                  selectedTheme === t.id
                                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-md'
                                    : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)] text-[hsl(var(--text-secondary))]'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Language Switcher */}
                        <div>
                          <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-2">Portal Language</label>
                          <select
                            value={selectedLanguage}
                            onChange={e => setSelectedLanguage(e.target.value as any)}
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-xs text-[hsl(var(--text-primary))] font-bold"
                          >
                            <option value="en">🇬🇧 English (Default)</option>
                            <option value="fr">🇫🇷 French (Français)</option>
                            <option value="es">🇪🇸 Spanish (Español)</option>
                            <option value="ha">🇳🇬 Hausa</option>
                            <option value="yo">🇳🇬 Yoruba</option>
                            <option value="ig">🇳🇬 Igbo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 2. MULTI-CHANNEL NOTIFICATION PREFERENCES */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
                        <Bell className="w-4 h-4 text-indigo-400" /> Multi-Channel Notification Preferences
                      </h3>

                      <div className="space-y-3">
                        {[
                          { label: 'Push Notifications (App Alerts)', desc: 'Instant mobile & browser alerts for assignments, grades & DMs.', state: notifPushPref, setter: setNotifPushPref },
                          { label: 'Email Notifications', desc: 'Term report cards, fee receipts & official school newsletters.', state: notifEmailPref, setter: setNotifEmailPref },
                          { label: 'SMS Notifications (Parent Phone)', desc: 'Emergency school closures & gate RFID check-in SMS to +234-803-333-4455.', state: notifSmsPref, setter: setNotifSmsPref },
                          { label: 'Assignment Due Reminders', desc: 'Alerts 24 hours prior to homework & project deadlines.', state: notifAssignmentsPref, setter: setNotifAssignmentsPref },
                          { label: 'New Published Grade Alerts', desc: 'Alerts when subject teachers release midterm or test scores.', state: notifGradesPref, setter: setNotifGradesPref },
                          { label: 'Fee Payment Reminders', desc: 'Installment deadline reminders & receipt confirmations.', state: notifFeeRemindersPref, setter: setNotifFeeRemindersPref }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center gap-3">
                            <div>
                              <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-xs">{item.label}</h4>
                              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => item.setter(!item.state)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                                item.state
                                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                  : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]'
                              }`}
                            >
                              {item.state ? 'Enabled ✓' : 'Disabled'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. PASSWORD CHANGE FORM */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
                        🔑 Password &amp; Account Security
                      </h3>

                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          if (!currPassword) {
                            setPasswordToast('Please enter your current password.');
                            return;
                          }
                          if (newPassword.length < 8) {
                            setPasswordToast('New password must be at least 8 characters long.');
                            return;
                          }
                          if (newPassword !== confirmPassword) {
                            setPasswordToast('New password and confirm password do not match.');
                            return;
                          }
                          setPasswordToast('Password updated successfully! Next login will require new password.');
                          setCurrPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setTimeout(() => setPasswordToast(null), 4000);
                        }}
                        className="space-y-4"
                      >
                        {passwordToast && (
                          <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> {passwordToast}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Current Password</label>
                            <input
                              type="password"
                              value={currPassword}
                              onChange={e => setCurrPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-xs text-[hsl(var(--text-primary))]"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">New Password</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-xs text-[hsl(var(--text-primary))]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold mb-1">Confirm New Password</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2.5 text-xs text-[hsl(var(--text-primary))]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" /> Update Password
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: 2FA & ACTIVE SESSIONS */}
                  <div className="space-y-6">
                    {/* 4. TWO-FACTOR AUTHENTICATION (2FA) */}
                    <div className="glass-card p-6 border border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-4 shadow-lg">
                      <div className="flex justify-between items-center border-b border-indigo-500/20 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Two-Factor Authentication (2FA)
                          </h3>
                          <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">Secure your portal account with TOTP Authenticator apps.</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          is2FAEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}>
                          {is2FAEnabled ? '2FA Active ✓' : '2FA Disabled'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                          Require a 6-digit verification code from Google Authenticator or Authy when signing in.
                        </p>

                        <button
                          onClick={() => setShow2FAModal(true)}
                          className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                            is2FAEnabled
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          {is2FAEnabled ? 'Disable Two-Factor Auth' : 'Setup 2FA Authenticator'}
                        </button>
                      </div>

                      {/* 2FA MODAL / SETUP PREVIEW */}
                      {show2FAModal && (
                        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-[hsl(var(--bg-secondary))] space-y-3 shadow-xl mt-3">
                          <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-2">
                            <span className="font-extrabold text-[hsl(var(--text-primary))] text-xs">Scan 2FA QR Code</span>
                            <button onClick={() => setShow2FAModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-white text-xs">✕</button>
                          </div>

                          <div className="p-3 bg-white rounded-xl text-center space-y-1 text-slate-950">
                            <div className="w-24 h-24 mx-auto bg-slate-950 text-white p-2 rounded-lg flex items-center justify-center font-mono text-[10px]">
                              [ TOTP QR CODE ]
                            </div>
                            <span className="text-[9px] font-mono text-slate-600 block">SECRET: JBSWY3DPEHPK3PXP</span>
                          </div>

                          <input
                            type="text"
                            value={totpCodeInput}
                            onChange={e => setTotpCodeInput(e.target.value)}
                            placeholder="Enter 6-digit TOTP code (e.g. 849201)"
                            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-2 text-xs text-center font-mono text-[hsl(var(--text-primary))]"
                          />

                          <button
                            onClick={() => {
                              setIs2FAEnabled(!is2FAEnabled);
                              setShow2FAModal(false);
                              setTotpCodeInput('');
                              setSettingsToast(is2FAEnabled ? '2FA has been disabled.' : '2FA successfully paired & activated!');
                              setTimeout(() => setSettingsToast(null), 3500);
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md"
                          >
                            Verify &amp; Enable 2FA
                          </button>
                        </div>
                      )}

                      {/* Backup Recovery Codes */}
                      {is2FAEnabled && (
                        <div className="pt-3 border-t border-indigo-500/20 space-y-2">
                          <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold">BACKUP RECOVERY CODES</span>
                          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-300">
                            {backupCodes.map((code, cIdx) => (
                              <div key={cIdx} className="p-1.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-center">
                                {code}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 5. ACTIVE LOGIN SESSIONS */}
                    <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-3xl space-y-4 shadow-lg">
                      <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
                        <h3 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                          📱 Active Device Sessions
                        </h3>
                        <button
                          onClick={() => {
                            setActiveLoginSessions(prev => prev.filter(s => s.current));
                            setSettingsToast('Signed out of all other device sessions!');
                            setTimeout(() => setSettingsToast(null), 3500);
                          }}
                          className="text-[10px] font-bold text-rose-400 hover:underline"
                        >
                          Sign out others
                        </button>
                      </div>

                      <div className="space-y-3">
                        {activeLoginSessions.map(sess => (
                          <div key={sess.id} className="p-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-extrabold text-[hsl(var(--text-primary))] text-xs">{sess.device}</h4>
                              {sess.current && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">
                              IP: {sess.ip} &bull; {sess.location} &bull; {sess.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 6. LOCKED REGISTRY NOTICE */}
                    <div className="glass-card p-6 border border-rose-500/20 bg-rose-500/5 rounded-3xl space-y-3 shadow-lg">
                      <p className="font-bold text-rose-400 flex items-center gap-2 text-xs">
                        <AlertTriangle className="w-4 h-4" /> Locked Registrar Records
                      </p>
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))] leading-relaxed">
                        Official student details (Full Legal Name, Date of Birth, Class Allocation, and Official Transcripts) are locked to maintain academic compliance. Contact the School Registrar to request corrections.
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
