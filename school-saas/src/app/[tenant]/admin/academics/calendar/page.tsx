'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CalendarCheck, Plus, Calendar, Clock, MapPin, Users,
  Pencil, Trash2, Eye, AlertCircle, ArrowLeft, X, Check,
  Sparkles, Filter, Search, ChevronLeft, ChevronRight,
  Download, Tag, BookOpen, Layers, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import {
  getAcademicCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  AcademicCalendarEvent,
  CalendarEventPayload
} from '@/app/actions/academic-calendar';
import { getAcademicSessions, AcademicSessionRecord } from '@/app/actions/academic-sessions';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Academic: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', badge: 'bg-blue-500' },
  Holiday: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', badge: 'bg-rose-500' },
  Examinations: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-500' },
  Meeting: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', badge: 'bg-purple-500' },
  Sports: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', badge: 'bg-emerald-500' },
  Administrative: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', badge: 'bg-slate-500' },
};

function formatDateDisplay(d: any): string {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d);
}

export default function AcademicCalendarPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [sessions, setSessions] = useState<AcademicSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<AcademicCalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<AcademicCalendarEvent | null>(null);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [eventForm, setEventForm] = useState<CalendarEventPayload>({
    academicYearId: '',
    title: '',
    description: '',
    category: 'Academic',
    startDate: todayStr,
    endDate: todayStr,
    startTime: '09:00',
    endTime: '15:00',
    isAllDay: true,
    location: '',
    audience: 'all',
    isPublished: true,
  });

  const loadData = async () => {
    setLoading(true);
    const [eventsRes, sessRes] = await Promise.all([
      getAcademicCalendarEvents(tenant, {
        academicYearId: selectedSessionFilter,
        category: selectedCategoryFilter,
      }),
      getAcademicSessions(tenant),
    ]);

    if (eventsRes.success && eventsRes.data) {
      setEvents(eventsRes.data);
    }
    if (sessRes.success && sessRes.data) {
      setSessions(sessRes.data);
      if (!eventForm.academicYearId && sessRes.data.length > 0) {
        const activeSess = sessRes.data.find(s => s.is_current) || sessRes.data[0];
        setEventForm(p => ({ ...p, academicYearId: activeSess.id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [tenant, selectedSessionFilter, selectedCategoryFilter]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.startDate) {
      alert('Please provide event title and start date.');
      return;
    }

    setSaving(true);
    const res = await createCalendarEvent(tenant, eventForm);
    setSaving(false);

    if (res.success) {
      setIsAddingEvent(false);
      setEventForm({
        academicYearId: sessions.find(s => s.is_current)?.id || '',
        title: '',
        description: '',
        category: 'Academic',
        startDate: todayStr,
        endDate: todayStr,
        startTime: '09:00',
        endTime: '15:00',
        isAllDay: true,
        location: '',
        audience: 'all',
        isPublished: true,
      });
      loadData();
    } else {
      alert(res.error || 'Failed to create calendar event');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !eventForm.title.trim()) return;

    setSaving(true);
    const res = await updateCalendarEvent(tenant, editingEvent.id, eventForm);
    setSaving(false);

    if (res.success) {
      setEditingEvent(null);
      loadData();
    } else {
      alert(res.error || 'Failed to update calendar event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    setSaving(true);
    const res = await deleteCalendarEvent(tenant, deletingEvent.id);
    setSaving(false);

    if (res.success) {
      setDeletingEvent(null);
      loadData();
    } else {
      alert(res.error || 'Failed to delete calendar event');
    }
  };

  const openEditModal = (event: AcademicCalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      academicYearId: event.academic_year_id || '',
      termId: event.term_id || '',
      title: event.title,
      description: event.description || '',
      category: event.category,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time || '09:00',
      endTime: event.end_time || '15:00',
      isAllDay: event.is_all_day,
      location: event.location || '',
      audience: event.audience || 'all',
      isPublished: event.is_published,
    });
  };

  const filteredEvents = events.filter(e => {
    const matchSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  // Metrics summary
  const holidayCount = events.filter(e => e.category === 'Holiday').length;
  const examCount = events.filter(e => e.category === 'Examinations').length;
  const meetingCount = events.filter(e => e.category === 'Meeting').length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1680px] mx-auto animate-fade-in w-full pb-12">
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border))]">
        <div className="space-y-1">
          <Link
            href={`/${tenant}/admin/academics`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Institutional Event Roadmap
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-[hsl(var(--accent))]" />
            Academic Calendar Events
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Map term resumptions, national holidays, examination windows, PTA meetings, and sports championships.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-[hsl(var(--bg-tertiary))] p-1 rounded-2xl border border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              Agenda List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              Monthly Grid
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingEvent(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* ── 2. Top Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {[
          { label: 'Total Scheduled Events', val: events.length, sub: 'This Academic Year', icon: Calendar, color: 'from-blue-500/15 to-blue-600/5 text-blue-400 border-blue-500/20' },
          { label: 'Holidays & Recesses', val: `${holidayCount} Recesses`, sub: 'Official Breaks', icon: Clock, color: 'from-rose-500/15 to-rose-600/5 text-rose-400 border-rose-500/20' },
          { label: 'Examination Windows', val: `${examCount} Periods`, sub: 'Terminal & Mock Exams', icon: CalendarCheck, color: 'from-amber-500/15 to-amber-600/5 text-amber-400 border-amber-500/20' },
          { label: 'PTA & Stakeholder Meets', val: `${meetingCount} Meets`, sub: 'Consultation Sessions', icon: Users, color: 'from-purple-500/15 to-purple-600/5 text-purple-400 border-purple-500/20' }
        ].map(stat => (
          <div key={stat.label} className={`p-4 sm:p-5 rounded-3xl border bg-gradient-to-br ${stat.color} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))] truncate">{stat.label}</span>
              <stat.icon className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))]">{stat.val}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 3. Filters & Search Bar ── */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs sm:text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            />
          </div>

          <select
            value={selectedSessionFilter}
            onChange={e => setSelectedSessionFilter(e.target.value)}
            className="h-11 px-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="all">All Academic Sessions</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} Session {s.is_current ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['all', 'Academic', 'Holiday', 'Examinations', 'Meeting', 'Sports', 'Administrative'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                selectedCategoryFilter === cat
                  ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] shadow-sm'
                  : 'bg-[hsl(var(--bg-tertiary)/0.5)] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border)/0.8)]'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Main Views: Agenda List OR Monthly Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[hsl(var(--accent)/0.2)] border-t-[hsl(var(--accent))] rounded-full animate-spin" />
        </div>
      ) : viewMode === 'agenda' ? (
        /* Agenda View */
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl border border-[hsl(var(--border))] space-y-3">
              <Calendar className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">No Events Found</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] max-w-sm mx-auto">
                No events match your current filter settings. Click "Add Event" to create a new calendar entry.
              </p>
            </div>
          ) : (
            filteredEvents.map(evt => {
              const catConfig = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Academic;
              return (
                <div
                  key={evt.id}
                  className="glass-card p-5 rounded-3xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-black uppercase text-[hsl(var(--text-tertiary))]">
                        {new Date(evt.start_date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl font-black text-[hsl(var(--text-primary))]">
                        {new Date(evt.start_date).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black text-[hsl(var(--text-primary))]">{evt.title}</h4>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
                          {evt.category}
                        </span>
                        {evt.audience && evt.audience !== 'all' && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border))]">
                            For {evt.audience}
                          </span>
                        )}
                      </div>

                      {evt.description && (
                        <p className="text-xs text-[hsl(var(--text-secondary))] line-clamp-2 max-w-2xl">
                          {evt.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-[hsl(var(--text-tertiary))] pt-1 flex-wrap font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                          {formatDateDisplay(evt.start_date)} {formatDateDisplay(evt.start_date) !== formatDateDisplay(evt.end_date) ? `→ ${formatDateDisplay(evt.end_date)}` : ''}
                        </span>
                        {!evt.is_all_day && evt.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {evt.start_time} - {evt.end_time}
                          </span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            {evt.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingEvent(evt)}
                      className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(evt)}
                      className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      title="Edit Event"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingEvent(evt)}
                      className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Monthly Grid View */
        <div className="glass-card p-5 sm:p-7 rounded-3xl border border-[hsl(var(--border))] space-y-4 shadow-lg">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
            <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{monthName}</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={todayMonth}
                className="px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-[hsl(var(--text-tertiary))]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] rounded-2xl bg-[hsl(var(--bg-tertiary)/0.15)] opacity-30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setEventForm(p => ({ ...p, startDate: dateStr, endDate: dateStr }));
                    setIsAddingEvent(true);
                  }}
                  className={`min-h-[95px] p-2 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer group hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.04)] ${
                    isToday
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)]'
                      : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--bg-tertiary)/0.3)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isToday ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-primary))]'}`}>
                      {dayNum}
                    </span>
                    <Plus className="w-3 h-3 text-[hsl(var(--text-tertiary))] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => {
                      const catCol = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.Academic;
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingEvent(ev);
                          }}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border ${catCol.bg} ${catCol.text} ${catCol.border}`}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] font-bold text-[hsl(var(--text-tertiary))] block">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. Create Event Modal ── */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Schedule Academic Event</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Add a new event, holiday, or examination milestone to the calendar.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingEvent(false)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. First Term Terminal Examinations"
                  value={eventForm.title}
                  onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full h-11 px-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Academic Session *
                </label>
                <select
                  value={eventForm.academicYearId}
                  onChange={e => setEventForm(p => ({ ...p, academicYearId: e.target.value }))}
                  className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                >
                  <option value="">General / All Sessions</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} Session {s.is_current ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={e => setEventForm(p => ({ ...p, category: e.target.value as any }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="Academic">Academic / Resumption</option>
                    <option value="Holiday">Holiday / Break</option>
                    <option value="Examinations">Examinations Period</option>
                    <option value="Meeting">Meeting / PTA</option>
                    <option value="Sports">Sports & Championship</option>
                    <option value="Administrative">Administrative / Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Target Audience
                  </label>
                  <select
                    value={eventForm.audience}
                    onChange={e => setEventForm(p => ({ ...p, audience: e.target.value as any }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="all">Entire School (All)</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers & Faculty</option>
                    <option value="parents">Parents & Guardians</option>
                    <option value="staff">Administrative Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={eventForm.startDate}
                    onChange={e => setEventForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={eventForm.endDate}
                    onChange={e => setEventForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium / Examination Hall A"
                  value={eventForm.location}
                  onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full h-10 px-3.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-semibold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Description / Event Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional details regarding timetables, dress codes, or required materials..."
                  value={eventForm.description}
                  onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving Event…' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. View Details Modal ── */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  CATEGORY_COLORS[viewingEvent.category]?.bg || 'bg-blue-500/10'
                } ${CATEGORY_COLORS[viewingEvent.category]?.text || 'text-blue-400'} ${CATEGORY_COLORS[viewingEvent.category]?.border || 'border-blue-500/20'}`}>
                  {viewingEvent.category}
                </span>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{viewingEvent.title}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  Session: {viewingEvent.academic_year_name || 'All Sessions'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold block">Start Date</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{formatDateDisplay(viewingEvent.start_date)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold block">End Date</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{formatDateDisplay(viewingEvent.end_date)}</span>
              </div>
            </div>

            {viewingEvent.location && (
              <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] text-xs flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold text-[hsl(var(--text-primary))]">Location: {viewingEvent.location}</span>
              </div>
            )}

            {viewingEvent.description && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[hsl(var(--text-tertiary))]">Event Notes & Details</label>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]">
                  {viewingEvent.description}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                className="px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Edit Modal ── */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Edit Calendar Event</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Update event title, timing, or audience.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  required
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full h-11 px-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Academic Session *
                </label>
                <select
                  value={eventForm.academicYearId}
                  onChange={e => setEventForm(p => ({ ...p, academicYearId: e.target.value }))}
                  className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                >
                  <option value="">General / All Sessions</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} Session {s.is_current ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={e => setEventForm(p => ({ ...p, category: e.target.value as any }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Examinations">Examinations</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Sports">Sports</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Audience
                  </label>
                  <select
                    value={eventForm.audience}
                    onChange={e => setEventForm(p => ({ ...p, audience: e.target.value as any }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="all">Entire School (All)</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers & Faculty</option>
                    <option value="parents">Parents</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={eventForm.startDate}
                    onChange={e => setEventForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={eventForm.endDate}
                    onChange={e => setEventForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full h-10 px-3.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-semibold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full p-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. Delete Modal ── */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Delete Calendar Event?</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] leading-relaxed">
                Are you sure you want to delete <strong className="text-[hsl(var(--text-primary))]">"{deletingEvent.title}"</strong>? This will remove the event from student, teacher, and parent calendars.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shadow-sm disabled:opacity-50"
              >
                {saving ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
