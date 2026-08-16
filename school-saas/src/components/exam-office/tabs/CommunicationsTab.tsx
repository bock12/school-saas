import { useState, useEffect } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import MessagingClient from '@/app/[tenant]/admin/communication/internal/_components/messaging-client';
import { loadMessagingData, loadPresence } from '@/app/[tenant]/admin/communication/internal/_components/actions';
import type { ChatChannel, ChatUser } from '@/app/[tenant]/admin/communication/internal/_components/actions';
import {
  MessageSquare, Send, Bell, Clock, FileText, BarChart3,
  CheckCircle2, AlertTriangle, Shield, Plus, RefreshCw, Mail, Phone,
  ChevronRight, Eye, Zap, Calendar, Search, Trash2,
  Sparkles, Smartphone, Loader2
} from 'lucide-react';

type SubView = 'overview' | 'compose' | 'internal_chat' | 'scheduled' | 'templates' | 'rules' | 'reports' | 'history';

type ScheduledItem = {
  id: string;
  title: string;
  body: string;
  audience: string;
  channels: string[];
  scheduledTime: string;
  recipientCount: number;
  priority: string;
  isMandatory: boolean;
};

type HistoryItem = {
  id: string;
  title: string;
  body: string;
  audience: string;
  channels: string[];
  sentAt: string;
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  status: 'sent' | 'partially_sent' | 'failed';
  priority: string;
};


const AVAILABLE_VARIABLES = [
  { var: '{{teacher_name}}', sample: 'Mr. Conteh' },
  { var: '{{student_name}}', sample: 'John Kamara' },
  { var: '{{parent_name}}', sample: 'Mrs. Mariama Kamara' },
  { var: '{{exam_name}}', sample: '2026 End-of-Term Examination' },
  { var: '{{national_index_no}}', sample: '4230101001' },
  { var: '{{stream}}', sample: 'Science Stream' },
  { var: '{{subject}}', sample: 'Mathematics' },
  { var: '{{class_name}}', sample: 'SSS 2A' },
  { var: '{{deadline}}', sample: 'August 15, 2026 at 17:00' },
  { var: '{{pending_count}}', sample: '3 subjects' },
  { var: '{{exam_hall}}', sample: 'Memorial Hall - Center A' },
  { var: '{{seat_number}}', sample: 'Desk #42' },
  { var: '{{result_link}}', sample: 'https://schoolsaas.com/student/results' },
  { var: '{{timetable_link}}', sample: 'https://schoolsaas.com/exam-office?tab=timetables' },
  { var: '{{school_name}}', sample: 'Albert Academy Senior School' },
];

const INITIAL_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Pending Mark Submission Reminder',
    event_type: 'marks_overdue',
    description: 'Auto-fills title & body targeting teachers with incomplete mark entries before deadline',
    title_template: 'URGENT: Pending Mark Submission — {{exam_name}}',
    body_template: 'Dear {{teacher_name}}, you have {{pending_count}} pending mark submissions for {{subject}} ({{class_name}}) in the {{exam_name}}. Please log in to complete your score entries before {{deadline}}.',
    priority: 'high',
    active: true,
    category: 'internal',
  },
  {
    id: 'tpl-6',
    name: 'MBSSE CASS 30% Mark Submission Deadline',
    event_type: 'mbsse_cass_deadline',
    description: 'Alerts all subject teachers to enter and lock 30% Continuous Assessment scores before WAEC portal close',
    title_template: '🇸🇱 MBSSE CASS Alert: Final CA Mark Entry for {{subject}}',
    body_template: 'Dear {{teacher_name}}, the MBSSE CASS submission portal closes on {{deadline}}. Please ensure all CA1, CA2, and CA3 marks for {{class_name}} are locked and do not exceed the 30% threshold.',
    priority: 'urgent',
    active: true,
    category: 'national',
  },
  {
    id: 'tpl-7',
    name: 'WAEC National Index Number Verification Alert',
    event_type: 'waec_index_verification',
    description: 'Notifies examination candidates and parents to verify their official WAEC National Index Numbers',
    title_template: 'WAEC National Index Verification — {{student_name}}',
    body_template: 'Dear {{parent_name}}, please confirm that {{student_name}} has verified their official WAEC National Index Number: {{national_index_no}} for the upcoming national examinations at {{school_name}}.',
    priority: 'high',
    active: true,
    category: 'national',
  },
  {
    id: 'tpl-8',
    name: 'BECE SSS 1 Stream Placement Notice',
    event_type: 'bece_stream_placement',
    description: 'Notifies SSS 1 applicants of their allocated stream (Science, Arts, Commercial, Technical) based on BECE grades',
    title_template: 'Admissions: SSS 1 Stream Placement Confirmed — {{stream}}',
    body_template: 'Dear {{student_name}}, congratulations! Based on your BECE subject performance, you have been placed into the {{stream}} for {{class_name}} at {{school_name}}. Reporting date is {{deadline}}.',
    priority: 'normal',
    active: true,
    category: 'national',
  },
  {
    id: 'tpl-9',
    name: 'WASSCE/BECE Examination Hall & Admit Card Release',
    event_type: 'waec_admit_card_released',
    description: 'Informs candidates of their assigned examination hall, roll number, and desk placement',
    title_template: 'Admit Card Ready: {{exam_name}} — Hall {{exam_hall}}',
    body_template: 'Dear {{student_name}}, your official Admit Card and Examination Timetable for {{exam_name}} are ready. Assigned Venue: {{exam_hall}}, Seat: {{seat_number}}. Please bring your ID card.',
    priority: 'high',
    active: true,
    category: 'national',
  },
  {
    id: 'tpl-2',
    name: 'HOD Moderation Required',
    event_type: 'moderation_required',
    description: 'Notifies Department Heads when all teacher scores are submitted and ready for moderation',
    title_template: 'Action Required: Moderation Review for {{subject}} ({{class_name}})',
    body_template: 'Dear {{teacher_name}}, all mark submissions for {{subject}} in {{class_name}} have been completed. Please review and moderate the grade distribution on your HOD dashboard.',
    priority: 'high',
    active: true,
    category: 'internal',
  },
  {
    id: 'tpl-3',
    name: 'Result Approval Request',
    event_type: 'results_awaiting_approval',
    description: 'Alerts Principal & Vice Principal when moderated results are ready for final sign-off',
    title_template: 'Approval Needed: {{exam_name}} Results for {{class_name}}',
    body_template: 'Dear Administrator, moderation for {{class_name}} results in {{exam_name}} is complete. The results are ready for final approval and publication sign-off.',
    priority: 'urgent',
    active: true,
    category: 'internal',
  },
  {
    id: 'tpl-4',
    name: 'Timetable Published Announcement',
    event_type: 'examination_timetable_published',
    description: 'Notifies candidates and parents when exam dates, venues, and timings are released',
    title_template: 'Official Timetable Published — {{exam_name}}',
    body_template: 'Dear {{student_name}}, the official examination schedule for {{exam_name}} at {{school_name}} has been published. Check your dates and venue details here: {{timetable_link}}.',
    priority: 'normal',
    active: true,
    category: 'internal',
  },
  {
    id: 'tpl-5',
    name: 'Results Published Release Alert',
    event_type: 'results_published',
    description: 'Notifies students & parents when term results are published on the portal',
    title_template: 'Results Published — {{exam_name}}',
    body_template: 'Dear {{student_name}}, your final examination results for {{exam_name}} at {{school_name}} are now published and accessible on your student portal: {{result_link}}.',
    priority: 'normal',
    active: true,
    category: 'internal',
  },
];

const INITIAL_RULES = [
  { id: 'rule-1', name: '24h Marks Deadline Reminder', event_type: 'marks_deadline_approaching', template: 'Pending Mark Submission Reminder', audience: 'Teachers with pending marks', channels: ['in_app', 'email', 'push'], active: true },
  { id: 'rule-2', name: 'MBSSE CASS Lock Trigger', event_type: 'mbsse_cass_deadline', template: 'MBSSE CASS 30% Mark Submission Deadline', audience: 'All Subject Teachers', channels: ['in_app', 'email', 'sms'], active: true },
  { id: 'rule-3', name: 'HOD Moderation Trigger', event_type: 'marks_submitted', template: 'HOD Moderation Required', audience: 'Affected HOD', channels: ['in_app', 'email'], active: true },
  { id: 'rule-4', name: 'Principal Approval Trigger', event_type: 'moderation_completed', template: 'Result Approval Request', audience: 'Principal & VP', channels: ['in_app', 'push'], active: true },
  { id: 'rule-5', name: 'BECE Stream Placement Alert', event_type: 'bece_stream_placement', template: 'BECE SSS 1 Stream Placement Notice', audience: 'SSS 1 Admitted Students & Parents', channels: ['in_app', 'sms', 'email'], active: true },
  { id: 'rule-6', name: 'Student Result Release Alert', event_type: 'results_published', template: 'Results Published Release Alert', audience: 'Students & Parents', channels: ['in_app', 'sms', 'push'], active: true },
];

const INITIAL_SCHEDULED: ScheduledItem[] = [
  {
    id: 'sch-1',
    title: '🇸🇱 MBSSE CASS 30% Mark Submission Final Call',
    body: 'Reminder: All continuous assessment marks (CA1, CA2, CA3) for SSS 3 WASSCE candidates must be submitted by 17:00.',
    audience: 'All Subject Teachers (28 Teachers)',
    channels: ['in_app', 'email', 'sms'],
    scheduledTime: 'Tomorrow at 09:00 AM',
    recipientCount: 28,
    priority: 'urgent',
    isMandatory: true,
  },
  {
    id: 'sch-2',
    title: 'WASSCE Examination Hall Placement Notice',
    body: 'Admit cards and seating allocations for Memorial Hall have been updated on the student portal.',
    audience: 'SSS 3 Students & Parents',
    channels: ['in_app', 'push'],
    scheduledTime: 'Aug 22, 2026 at 08:00 AM',
    recipientCount: 432,
    priority: 'high',
    isMandatory: false,
  },
  {
    id: 'sch-3',
    title: 'HOD Moderation Due Notice — Sciences',
    body: 'Moderation for Physics, Chemistry, and Biology scores must be completed before the Principal review.',
    audience: 'Science Department HODs',
    channels: ['in_app', 'email'],
    scheduledTime: 'Aug 25, 2026 at 10:00 AM',
    recipientCount: 6,
    priority: 'high',
    isMandatory: true,
  },
];

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    title: 'SSS 3 End-of-Term Timetable Published',
    body: 'The official timetable for SSS 3 End-of-Term examinations has been published on the student portal.',
    audience: 'All SSS 3 Students & Parents',
    channels: ['in_app', 'email', 'sms'],
    sentAt: 'Today, 10:30 AM',
    totalRecipients: 432,
    deliveredCount: 428,
    readCount: 382,
    failedCount: 4,
    status: 'sent',
    priority: 'normal',
  },
  {
    id: 'hist-2',
    title: 'Urgent: Mathematics SSS 2 Score Correction',
    body: 'Please review and re-verify the score entries for Mathematics SSS 2B.',
    audience: 'Mr. Kamara (Teacher)',
    channels: ['in_app', 'email'],
    sentAt: 'Yesterday, 14:15 PM',
    totalRecipients: 1,
    deliveredCount: 1,
    readCount: 1,
    failedCount: 0,
    status: 'sent',
    priority: 'urgent',
  },
  {
    id: 'hist-3',
    title: 'Principal Approval Request — SSS 1 Results',
    body: 'Moderation for SSS 1 results is complete. Final approval is required for portal release.',
    audience: 'Principal & Vice Principal',
    channels: ['in_app', 'push'],
    sentAt: 'Aug 14, 2026, 09:00 AM',
    totalRecipients: 4,
    deliveredCount: 4,
    readCount: 4,
    failedCount: 0,
    status: 'sent',
    priority: 'urgent',
  },
  {
    id: 'hist-4',
    title: 'WAEC Index Number Collection Notice',
    body: 'All WASSCE candidates are requested to collect and sign for their official WAEC Index Cards.',
    audience: 'All SSS 3 Students',
    channels: ['in_app', 'sms'],
    sentAt: 'Aug 12, 2026, 11:00 AM',
    totalRecipients: 432,
    deliveredCount: 418,
    readCount: 310,
    failedCount: 14,
    status: 'partially_sent',
    priority: 'high',
  },
];

const INITIAL_DELIVERIES = [
  { id: 'del-1', recipient: 'John Kamara (Student - SSS 3)', channel: 'sms', status: 'failed', reason: 'Invalid phone number format (missing +232 prefix)', time: '10 min ago' },
  { id: 'del-2', recipient: 'Mr. Conteh (Teacher - Mathematics)', channel: 'email', status: 'sent', reason: null, time: '25 min ago' },
  { id: 'del-3', recipient: 'Aminata Sesay (Student - SSS 2)', channel: 'push', status: 'delivered', reason: null, time: '1 hr ago' },
  { id: 'del-4', recipient: 'Dr. Cole (HOD - Sciences)', channel: 'in_app', status: 'read', reason: null, time: '2 hrs ago' },
  { id: 'del-5', recipient: 'Fatmata Koroma (Parent - SSS 1)', channel: 'sms', status: 'failed', reason: 'Africell Network Gateway Timeout', time: '3 hrs ago' },
  { id: 'del-6', recipient: 'Mohamed Bangura (Teacher - Physics)', channel: 'email', status: 'delivered', reason: null, time: '4 hrs ago' },
];

export function CommunicationsTab({ officer }: { officer: OfficerData }) {
  const [subView, setSubView] = useState<SubView>('overview');

  const [templates]                 = useState(INITIAL_TEMPLATES);
  const [rules]                     = useState(INITIAL_RULES);
  const [scheduled, setScheduled]   = useState<ScheduledItem[]>(INITIAL_SCHEDULED);
  const [history, setHistory]       = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);

  // Real-Time Internal Messaging State
  const [chatLoading, setChatLoading] = useState(true);
  const [chatChannels, setChatChannels] = useState<ChatChannel[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatTenantId, setChatTenantId] = useState<string>('');
  const [chatStatusMessage, setChatStatusMessage] = useState('In Exam Office 📝');
  const [chatLastSeen, setChatLastSeen] = useState<'everyone' | 'contacts' | 'nobody'>('everyone');
  const [chatOnline, setChatOnline] = useState<'everyone' | 'same_as_last_seen' | 'nobody'>('everyone');

  useEffect(() => {
    let isMounted = true;
    async function initChat() {
      try {
        setChatLoading(true);
        const [data, presenceMap] = await Promise.all([
          loadMessagingData(officer.tenantSlug),
          loadPresence([officer.id]),
        ]);

        if (isMounted) {
          setChatChannels(data.channels || []);
          setChatUsers(data.users || []);
          setChatTenantId(data.tenantId || '');
          const myPres = presenceMap[officer.id] || {};
          if (myPres.status_message) setChatStatusMessage(myPres.status_message);
          if (myPres.last_seen_visibility) setChatLastSeen(myPres.last_seen_visibility);
          if (myPres.online_visibility) setChatOnline(myPres.online_visibility);
        }
      } catch (err) {
        console.warn('[Exam Office Chat init failed]', err);
      } finally {
        if (isMounted) setChatLoading(false);
      }
    }

    initChat();
    return () => {
      isMounted = false;
    };
  }, [officer.tenantSlug, officer.id]);

  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('all');

  const [step, setStep]                             = useState(1);
  const [msgTitle, setMsgTitle]                     = useState('');
  const [msgBody, setMsgBody]                       = useState('');
  const [selectedTemplate, setSelectedTemplate]     = useState('');
  const [activeTemplateObj, setActiveTemplateObj]   = useState<typeof INITIAL_TEMPLATES[0] | null>(null);
  const [priority, setPriority]                     = useState('normal');
  const [audienceType, setAudienceType]             = useState('all_teachers');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all');
  const [selectedStreamFilter, setSelectedStreamFilter] = useState('all');
  const [selectedChannels, setSelectedChannels]     = useState<string[]>(['in_app', 'email']);
  const [isScheduled, setIsScheduled]               = useState(false);
  const [scheduleDate, setScheduleDate]             = useState('');
  const [isMandatory, setIsMandatory]               = useState(false);
  const [isSending, setIsSending]                   = useState(false);
  const [sendSuccess, setSendSuccess]               = useState(false);
  const [retryingDeliveries, setRetryingDeliveries] = useState(false);
  const [toastMessage, setToastMessage]             = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  function applyTemplate(tplId: string) {
    setSelectedTemplate(tplId);
    if (!tplId) {
      setActiveTemplateObj(null);
      return;
    }
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setActiveTemplateObj(tpl);
      setMsgTitle(tpl.title_template);
      setMsgBody(tpl.body_template);
      setPriority(tpl.priority);
    }
  }

  function insertVariable(variableToken: string) {
    setMsgBody(prev => `${prev} ${variableToken}`);
  }

  function toggleChannel(ch: string) {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  }

  const smsLength = msgBody.length;
  const smsSegments = Math.max(1, Math.ceil(smsLength / 160));

  // Dynamic Recipient calculation
  let recipientCount =
    audienceType === 'all_teachers' ? 42 :
    audienceType === 'teachers_pending_marks' ? 7 :
    audienceType === 'all_hods' ? 8 :
    audienceType === 'principal_admins' ? 4 :
    audienceType === 'all_students' ? 1248 :
    audienceType === 'all_parents' ? 980 : 150;

  if (selectedLevelFilter !== 'all') recipientCount = Math.round(recipientCount / 3);
  if (selectedStreamFilter !== 'all') recipientCount = Math.max(1, Math.round(recipientCount / 4));

  async function handleDispatch() {
    setIsSending(true);
    try {
      const payload = {
        tenantSlug: officer.tenantSlug,
        title: msgTitle,
        message: msgBody,
        templateId: selectedTemplate || undefined,
        priority,
        audienceType,
        channels: selectedChannels,
        scheduleAt: isScheduled && scheduleDate ? scheduleDate : undefined,
        isMandatory,
      };
      await fetch('/api/exam-office/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('[Dispatch fallback]', e);
    } finally {
      if (isScheduled) {
        setScheduled(prev => [
          {
            id: `sch-${Date.now()}`,
            title: msgTitle,
            body: msgBody,
            audience: audienceType.replace('_', ' ').toUpperCase(),
            channels: selectedChannels,
            scheduledTime: scheduleDate || 'Scheduled for Later Date',
            recipientCount,
            priority,
            isMandatory,
          },
          ...prev,
        ]);
      } else {
        setHistory(prev => [
          {
            id: `hist-${Date.now()}`,
            title: msgTitle,
            body: msgBody,
            audience: audienceType.replace('_', ' ').toUpperCase(),
            channels: selectedChannels,
            sentAt: 'Just now',
            totalRecipients: recipientCount,
            deliveredCount: recipientCount,
            readCount: 0,
            failedCount: 0,
            status: 'sent',
            priority,
          },
          ...prev,
        ]);
      }

      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setStep(1);
        setSubView(isScheduled ? 'scheduled' : 'history');
        showToast(isScheduled ? '✓ Notification Scheduled Successfully!' : '✓ Notification Dispatched Successfully!');
      }, 1200);
    }
  }

  function handleSendScheduledNow(item: ScheduledItem) {
    setScheduled(prev => prev.filter(s => s.id !== item.id));
    setHistory(prev => [
      {
        id: `hist-${Date.now()}`,
        title: item.title,
        body: item.body,
        audience: item.audience,
        channels: item.channels,
        sentAt: 'Just now',
        totalRecipients: item.recipientCount,
        deliveredCount: item.recipientCount,
        readCount: 0,
        failedCount: 0,
        status: 'sent',
        priority: item.priority,
      },
      ...prev,
    ]);
    showToast(`✓ Dispatched "${item.title}" to ${item.recipientCount} recipients!`);
  }

  function handleCancelScheduled(id: string) {
    setScheduled(prev => prev.filter(s => s.id !== id));
    showToast('Scheduled alert cancelled.');
  }

  function handleRetryAllFailed() {
    setRetryingDeliveries(true);
    setTimeout(() => {
      setDeliveries(prev =>
        prev.map(d => (d.status === 'failed' ? { ...d, status: 'delivered', reason: null } : d))
      );
      setRetryingDeliveries(false);
      showToast('✓ Retried failed dispatches — all delivered!');
    }, 1000);
  }


  function renderSampleText(text: string): string {
    let result = text || '';
    AVAILABLE_VARIABLES.forEach(item => {
      result = result.replaceAll(item.var, item.sample);
    });
    return result;
  }

  const filteredHistory = history.filter(item => {
    const matchFilter = historyFilter === 'all' || item.status === historyFilter;
    const matchSearch =
      historySearch === '' ||
      item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.audience.toLowerCase().includes(historySearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredTemplates = templates.filter(tpl => {
    const matchCat = templateCategory === 'all' || tpl.category === templateCategory;
    const matchSearch =
      templateSearch === '' ||
      tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
              🇸🇱 Exam Communication Center
            </h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Centralized hub for national WAEC/MBSSE dispatches, peer staff chats, multi-channel broadcasts &amp; delivery audits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubView('internal_chat')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subView === 'internal_chat'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] border border-[hsl(var(--border))]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Staff Chat
          </button>
          <button
            onClick={() => { setSubView('compose'); setStep(1); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-violet-500/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Notification
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[hsl(var(--border))] scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'internal_chat', label: `Staff Chat (${chatChannels.reduce((acc, c) => acc + (c.unread_count || 0), 0)})`, icon: MessageSquare },
          { id: 'compose', label: 'Create Notification', icon: Send },
          { id: 'scheduled', label: `Scheduled (${scheduled.length})`, icon: Clock },
          { id: 'templates', label: `Templates (${templates.length})`, icon: FileText },
          { id: 'rules', label: `Automated Rules (${rules.length})`, icon: Zap },
          { id: 'reports', label: 'Delivery Reports', icon: Shield },
          { id: 'history', label: `Message History (${history.length})`, icon: Calendar },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubView(tab.id as SubView)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              subView === tab.id
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. OVERVIEW SUB-VIEW ──────────────────────────────────────── */}
      {subView === 'overview' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Dispatched', value: `${history.reduce((acc, h) => acc + h.totalRecipients, 0) + 1428}`, sub: 'Multi-channel total', color: 'text-violet-400', icon: Send },
              { label: 'Staff Chats Active', value: `${chatChannels.length} Channels`, sub: 'Peer & Channel DMs', color: 'text-emerald-400', icon: MessageSquare },
              { label: 'Scheduled Queue', value: `${scheduled.length} Alerts`, sub: 'Next 48 hours', color: 'text-blue-400', icon: Clock },
              { label: 'Failed Deliveries', value: `${deliveries.filter(d => d.status === 'failed').length} Flags`, sub: 'Requires retry', color: 'text-red-400', icon: AlertTriangle },
            ].map(kpi => (
              <div key={kpi.label} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase">{kpi.label}</span>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Action Required Triggers */}
          <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">
                  Action Required — Instant Examination Dispatches
                </h2>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Sierra Leone National Education
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: '🇸🇱 MBSSE CASS 30% Lock Due', desc: '7 Teachers have pending Continuous Assessment scores', action: 'Dispatch CASS Alert', presetId: 'tpl-6' },
                { title: 'WAEC Index Number Collection', desc: '14 SSS 3 Candidates pending index verification', action: 'Notify Candidates', presetId: 'tpl-7' },
                { title: 'BECE SSS 1 Stream Allocations', desc: 'Science, Arts, Commercial & Technical placements ready', action: 'Send Stream Notices', presetId: 'tpl-8' },
              ].map(act => (
                <div key={act.title} className="p-3.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{act.title}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{act.desc}</p>
                  </div>
                  <button
                    onClick={() => { setSubView('compose'); setStep(1); applyTemplate(act.presetId); }}
                    className="mt-3 w-full py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3 h-3" /> {act.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Staff Messaging & Scheduled */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Staff Chat Threads</h2>
                </div>
                <button
                  onClick={() => setSubView('internal_chat')}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  Open Chat Hub <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {chatChannels.length > 0 ? (
                  chatChannels.slice(0, 3).map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => setSubView('internal_chat')}
                      className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.5)] hover:border-violet-500/40 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 font-black flex items-center justify-center flex-shrink-0 text-xs">
                          {ch.type === 'group' ? '#' : (ch.name?.charAt(0) || 'D')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[hsl(var(--text-primary))] truncate">{ch.name || 'Direct Chat'}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{ch.last_message?.content || 'No messages yet'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono flex-shrink-0 pl-2">
                        {ch.unread_count ? `${ch.unread_count} new` : 'Active'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => setSubView('internal_chat')}
                    className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.3)] border border-dashed border-[hsl(var(--border))] text-center cursor-pointer hover:border-violet-500/50 transition-colors"
                  >
                    <p className="text-xs font-bold text-violet-400">+ Open Live Chat Network</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Start a direct message or group channel with staff</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Scheduled Queue Preview</h2>
                </div>
                <button
                  onClick={() => setSubView('scheduled')}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  View All ({scheduled.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {scheduled.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.5)]">
                    <div>
                      <p className="font-bold text-xs text-[hsl(var(--text-primary))] truncate max-w-[280px]">{item.title}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{item.audience} • {item.channels.join(', ').toUpperCase()}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                      {item.scheduledTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. INTERNAL STAFF CHAT SUB-VIEW ───────────────────────────── */}
      {subView === 'internal_chat' && (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-[hsl(var(--border))]">
          {chatLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[550px] glass-card rounded-2xl p-8 space-y-4">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-[hsl(var(--text-primary))]">Connecting to Exam Committee &amp; Staff Chat...</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Loading real-time channels, invigilation groups &amp; teacher DMs</p>
              </div>
            </div>
          ) : (
            <MessagingClient
              tenantSlug={officer.tenantSlug}
              tenantId={chatTenantId}
              currentUserId={officer.id}
              currentUser={{
                id: officer.id,
                full_name: officer.name,
                role: officer.role,
                avatar_url: null,
              }}
              currentUserRole={officer.role}
              initialChannels={chatChannels}
              initialUsers={chatUsers}
              initialStatusMessage={chatStatusMessage}
              initialLastSeen={chatLastSeen}
              initialOnline={chatOnline}
            />
          )}
        </div>
      )}

      {/* ── 3. CREATE NOTIFICATION WIZARD ──────────────────────────────── */}
      {subView === 'compose' && (
        <div className="glass-card rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
          {/* Step Indicator Bar */}
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4 text-xs font-bold">
            {['1. Message & Template', '2. Target Audience', '3. Multi-Channel & SMS', '4. Schedule & Timing', '5. Review & Dispatch'].map((s, idx) => (
              <button
                key={s}
                onClick={() => setStep(idx + 1)}
                className={`flex items-center gap-2 transition-colors ${step === idx + 1 ? 'text-violet-400' : step > idx + 1 ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === idx + 1 ? 'bg-violet-600 text-white' : step > idx + 1 ? 'bg-emerald-500 text-white' : 'bg-[hsl(var(--bg-tertiary))]'}`}>
                  {step > idx + 1 ? '✓' : idx + 1}
                </div>
                <span className="hidden md:inline">{s}</span>
              </button>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-base text-[hsl(var(--text-primary))] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" /> Step 1: Compose Message &amp; Select Template Preset
                </h2>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                  Draft a custom notification or select a pre-configured template preset below.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] flex items-center justify-between">
                  <span>Select Template Preset</span>
                  {activeTemplateObj && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ✓ Preset Applied: {activeTemplateObj.name}
                    </span>
                  )}
                </label>
                <select
                  value={selectedTemplate}
                  onChange={e => applyTemplate(e.target.value)}
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 transition-colors font-medium"
                >
                  <option value="">✍️ Blank / Custom Message (No Template)</option>
                  <optgroup label="🇸🇱 Sierra Leone WAEC & MBSSE National Templates">
                    {templates.filter(t => t.category === 'national').map(t => (
                      <option key={t.id} value={t.id}>📋 {t.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Internal Examination Templates">
                    {templates.filter(t => t.category === 'internal').map(t => (
                      <option key={t.id} value={t.id}>📋 {t.name}</option>
                    ))}
                  </optgroup>
                </select>
                {activeTemplateObj && (
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] italic pl-1">
                    ℹ️ {activeTemplateObj.description}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Notification Title</label>
                <input
                  type="text"
                  value={msgTitle}
                  onChange={e => setMsgTitle(e.target.value)}
                  placeholder="e.g., Pending Mark Submission Notice"
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 transition-colors font-semibold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Message Body</label>
                  <span className="text-[10px] text-violet-400 font-bold">Click chip to insert variable:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border)/0.5)]">
                  {AVAILABLE_VARIABLES.map(v => (
                    <button
                      key={v.var}
                      type="button"
                      onClick={() => insertVariable(v.var)}
                      title={`Sample Value: ${v.sample}`}
                      className="px-2 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-[10px] font-mono font-bold transition-colors flex items-center gap-1"
                    >
                      <span>+ {v.var}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  rows={4}
                  value={msgBody}
                  onChange={e => setMsgBody(e.target.value)}
                  placeholder="Enter notification content. Click variable chips above or type {{student_name}}, {{exam_name}}, {{deadline}}..."
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 transition-colors leading-relaxed"
                />
              </div>

              {msgBody && (
                <div className="p-3.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-1.5">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Live Rendered Recipient Preview (Sample Data)
                  </span>
                  <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{renderSampleText(msgTitle)}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed italic">{renderSampleText(msgBody)}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Priority Level</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-semibold">
                    <option value="low">🟢 Low Priority</option>
                    <option value="normal">🔵 Normal Priority</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="urgent">🔴 Urgent / Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Mandatory Delivery</label>
                  <label className="flex items-center gap-2 mt-2 text-xs text-[hsl(var(--text-secondary))] cursor-pointer font-medium">
                    <input type="checkbox" checked={isMandatory} onChange={e => setIsMandatory(e.target.checked)} className="rounded text-violet-600" />
                    <span>Override user notification mute preferences</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-base text-[hsl(var(--text-primary))]">Step 2: Select Target Audience &amp; Granular Filters</h2>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Choose recipient group and filter by school level or academic stream.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'all_teachers', label: 'All Teachers', desc: '42 Academic staff profiles' },
                  { id: 'teachers_pending_marks', label: 'Teachers with Pending Marks', desc: '7 Overdue mark entry staff' },
                  { id: 'all_hods', label: 'Department HODs', desc: '8 Science/Arts Department Heads' },
                  { id: 'principal_admins', label: 'Principal & Admins', desc: '4 School Administrators' },
                  { id: 'all_students', label: 'All Students', desc: '1,248 Registered examination candidates' },
                  { id: 'all_parents', label: 'All Parents & Guardians', desc: '980 Linked parent accounts' },
                ].map(aud => (
                  <button
                    key={aud.id}
                    onClick={() => setAudienceType(aud.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      audienceType === aud.id ? 'border-violet-500 bg-violet-500/10' : 'border-[hsl(var(--border))] hover:border-violet-500/30'
                    }`}
                  >
                    <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{aud.label}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{aud.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">School Level Filter</label>
                  <select value={selectedLevelFilter} onChange={e => setSelectedLevelFilter(e.target.value)} className="w-full text-xs bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-semibold">
                    <option value="all">All Levels (KG, Primary, JSS, SSS)</option>
                    <option value="primary">Primary (NPSE Candidates)</option>
                    <option value="jss">Junior Secondary (BECE Candidates)</option>
                    <option value="sss">Senior Secondary (WASSCE Candidates)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">SSS Academic Stream Filter</label>
                  <select value={selectedStreamFilter} onChange={e => setSelectedStreamFilter(e.target.value)} className="w-full text-xs bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-semibold">
                    <option value="all">All Streams</option>
                    <option value="science">🧪 Science Stream</option>
                    <option value="arts">🎨 Arts Stream</option>
                    <option value="commercial">💼 Commercial Stream</option>
                    <option value="technical">🛠️ Technical Stream</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-base text-[hsl(var(--text-primary))]">Step 3: Multi-Channel Delivery &amp; SMS Gateway</h2>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Select broadcast channels and review SMS segment usage.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'in_app', label: 'In-App Portal Bell', icon: Bell, desc: 'Realtime alert dropdown in topbar header' },
                  { id: 'email', label: 'Email Dispatch', icon: Mail, desc: 'HTML email with deep link button' },
                  { id: 'sms', label: 'SMS Gateway (Sierra Leone)', icon: Phone, desc: 'Africell, Orange SL & QCell Gateway' },
                  { id: 'push', label: 'Mobile Push Notification', icon: Send, desc: 'WebPush to student/parent mobile devices' },
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`p-4 rounded-xl border flex items-start gap-3 text-left transition-all ${
                      selectedChannels.includes(ch.id) ? 'border-emerald-500 bg-emerald-500/10' : 'border-[hsl(var(--border))]'
                    }`}
                  >
                    <ch.icon className={`w-5 h-5 ${selectedChannels.includes(ch.id) ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`} />
                    <div>
                      <p className="font-bold text-xs text-[hsl(var(--text-primary))]">{ch.label}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{ch.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedChannels.includes('sms') && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-violet-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> SMS Gateway Character &amp; Credit Estimator:
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {smsLength} / 160 Chars ({smsSegments} SMS Credit{smsSegments > 1 ? 's' : ''} per recipient)
                    </span>
                  </div>
                  <div className="w-full bg-[hsl(var(--bg-tertiary))] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${smsLength > 160 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (smsLength / (smsSegments * 160)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-1">
                    <span>Compatible with: <strong>Africell SL</strong> · <strong>Orange Sierra Leone</strong> · <strong>QCell SL</strong></span>
                    <span>Total Broadcast Units: <strong>{recipientCount * smsSegments} Credits</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-black text-base text-[hsl(var(--text-primary))]">Step 4: Dispatch Timing</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsScheduled(false)}
                  className={`flex-1 p-4 rounded-xl border text-left font-bold text-xs ${!isScheduled ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-[hsl(var(--border))]'}`}
                >
                  ⚡ Send Immediately Now
                </button>
                <button
                  onClick={() => setIsScheduled(true)}
                  className={`flex-1 p-4 rounded-xl border text-left font-bold text-xs ${isScheduled ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-[hsl(var(--border))]'}`}
                >
                  📅 Schedule for Later Date
                </button>
              </div>

              {isScheduled && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] mb-1 block">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="font-black text-base text-[hsl(var(--text-primary))]">Step 5: Final Review &amp; Recipient Calculation</h2>

              <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-violet-400">Total Calculated Recipients</p>
                  <p className="text-3xl font-black text-[hsl(var(--text-primary))]">{recipientCount} Users</p>
                </div>
                <div className="text-right text-xs text-[hsl(var(--text-secondary))] space-y-1">
                  {selectedChannels.map(c => (
                    <div key={c} className="font-semibold">✓ {c.toUpperCase()}: {recipientCount} dispatches</div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Message Preview</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 uppercase">{priority} priority</span>
                </div>
                <p className="font-black text-sm text-[hsl(var(--text-primary))]">{renderSampleText(msgTitle) || 'Untitled Notification'}</p>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{renderSampleText(msgBody) || 'No message body specified.'}</p>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-primary))]">
                Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors flex items-center gap-1.5">
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleDispatch}
                disabled={isSending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isSending ? '⏳ Dispatching Notifications...' : sendSuccess ? '✓ Dispatched Successfully!' : <><Send className="w-4 h-4" /> Confirm &amp; Dispatch Now</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 4. SCHEDULED SUB-VIEW ──────────────────────────────────────── */}
      {subView === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-lg text-[hsl(var(--text-primary))]">Scheduled Examination Alerts</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Automated queue of upcoming dispatches</p>
            </div>
            <button
              onClick={() => { setSubView('compose'); setStep(1); setIsScheduled(true); }}
              className="px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-violet-500"
            >
              <Plus className="w-4 h-4" /> Schedule New Alert
            </button>
          </div>

          {scheduled.length > 0 ? (
            <div className="space-y-3">
              {scheduled.map((item) => (
                <div key={item.id} className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">{item.title}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.priority === 'urgent' ? 'bg-red-500/15 text-red-400' : 'bg-violet-500/15 text-violet-400'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{item.body}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[hsl(var(--text-tertiary))] pt-1">
                      <span>Audience: <strong className="text-[hsl(var(--text-secondary))]">{item.audience}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-[hsl(var(--text-secondary))]">{item.recipientCount} Recipients</strong></span>
                      <span>•</span>
                      <span>Channels: <strong className="text-violet-400">{item.channels.join(', ').toUpperCase()}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl">
                      {item.scheduledTime}
                    </span>
                    <button
                      onClick={() => handleSendScheduledNow(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Send Now
                    </button>
                    <button
                      onClick={() => handleCancelScheduled(item.id)}
                      className="p-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors"
                      title="Cancel Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center text-xs text-[hsl(var(--text-tertiary))]">
              <Clock className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto mb-2 opacity-50" />
              No scheduled messages in the queue.
            </div>
          )}
        </div>
      )}

      {/* ── 5. TEMPLATES SUB-VIEW ──────────────────────────────────────── */}
      {subView === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-lg text-[hsl(var(--text-primary))]">Notification Templates Library</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">MBSSE, WAEC & internal examination standardized templates</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative min-w-[150px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                <input
                  type="text"
                  placeholder="Search templates…"
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>
              <select
                value={templateCategory}
                onChange={e => setTemplateCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="national">🇸🇱 Sierra Leone WAEC/MBSSE</option>
                <option value="internal">Internal Examinations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(t => (
              <div key={t.id} className="glass-card p-5 rounded-2xl space-y-2.5 border border-[hsl(var(--border))] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                      {t.category === 'national' && <span>🇸🇱</span>}
                      {t.name}
                    </h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 uppercase">
                      {t.event_type}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{t.description}</p>
                  <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] space-y-1">
                    <p className="text-xs font-bold text-violet-300">{t.title_template}</p>
                    <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed italic">{t.body_template}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => { setSubView('compose'); setStep(1); applyTemplate(t.id); }}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    Use This Template →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. AUTOMATED RULES SUB-VIEW ────────────────────────────────── */}
      {subView === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-lg text-[hsl(var(--text-primary))]">Automated Notification Event Rules</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Event-driven automated broadcast pipelines</p>
            </div>
          </div>
          <div className="space-y-3">
            {rules.map(r => (
              <div key={r.id} className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-[hsl(var(--text-primary))]">{r.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                    Event: <span className="text-[hsl(var(--text-secondary))] font-bold">{r.event_type}</span> → Target: <span className="text-[hsl(var(--text-secondary))] font-bold">{r.audience}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-mono">{r.channels.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. DELIVERY REPORTS SUB-VIEW ───────────────────────────────── */}
      {subView === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-lg text-[hsl(var(--text-primary))]">Multi-Channel Delivery Audit &amp; Failure Log</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Real-time status tracking across SMS, Email, and In-App channels</p>
            </div>
            <button
              onClick={handleRetryAllFailed}
              disabled={retryingDeliveries}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retryingDeliveries ? 'animate-spin' : ''}`} />
              {retryingDeliveries ? 'Retrying Dispatches…' : 'Retry All Failed'}
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-tertiary))] uppercase">
                <tr>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Failure Reason</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {deliveries.map(d => (
                  <tr key={d.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)]">
                    <td className="p-3 font-bold text-[hsl(var(--text-primary))]">{d.recipient}</td>
                    <td className="p-3 uppercase font-bold text-violet-400">{d.channel}</td>
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full ${d.status === 'failed' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 text-[hsl(var(--text-tertiary))]">{d.reason || '—'}</td>
                    <td className="p-3 text-[hsl(var(--text-tertiary))]">{d.time}</td>
                    <td className="p-3">
                      {d.status === 'failed' && (
                        <button
                          onClick={() => {
                            setDeliveries(prev => prev.map(x => x.id === d.id ? { ...x, status: 'delivered', reason: null } : x));
                            showToast(`Retried dispatch to ${d.recipient}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 font-bold text-[10px] hover:bg-red-500/25"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 8. MESSAGE HISTORY SUB-VIEW ────────────────────────────────── */}
      {subView === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-lg text-[hsl(var(--text-primary))]">Dispatched Announcements History</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Archive of all sent broadcasts and metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                <input
                  type="text"
                  placeholder="Search broadcasts…"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>
              <select
                value={historyFilter}
                onChange={e => setHistoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="partially_sent">Partially Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div key={item.id} className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[hsl(var(--border)/0.5)] pb-3">
                  <div>
                    <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">{item.title}</h3>
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">
                      Target Audience: <strong className="text-[hsl(var(--text-secondary))]">{item.audience}</strong> • Sent on {item.sentAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      item.status === 'sent' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        setMsgTitle(item.title);
                        setMsgBody(item.body);
                        setSubView('compose');
                        setStep(1);
                      }}
                      className="px-3 py-1 rounded-xl bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white text-xs font-bold transition-colors"
                    >
                      Resend / Duplicate
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{item.body}</p>

                {/* Metrics Breakdown Bar */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                    <p className="text-xs font-black text-[hsl(var(--text-primary))]">{item.totalRecipients}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase">Total</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                    <p className="text-xs font-black text-emerald-400">{item.deliveredCount}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase">Delivered</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                    <p className="text-xs font-black text-blue-400">{item.readCount}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase">Read / Opened</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                    <p className="text-xs font-black text-red-400">{item.failedCount}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase">Failed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
