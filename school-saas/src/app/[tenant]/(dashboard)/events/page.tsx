'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Trophy, Plus, Calendar, Users, DollarSign, MapPin, Clock, CheckCircle2, Tag,
  Menu, Sparkles, UserCheck, ShieldCheck, Heart, Landmark, HelpCircle, Save,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  CalendarCheck, Gift, Award, ClipboardList, Camera, Printer, Megaphone, AlertTriangle
} from 'lucide-react';

type EventTab =
  | 'overview'
  | 'calendar'
  | 'school'
  | 'sports'
  | 'graduation'
  | 'pta'
  | 'open-days'
  | 'competitions'
  | 'conferences'
  | 'registrations'
  | 'venues'
  | 'budgets'
  | 'volunteers'
  | 'attendance'
  | 'reports'
  | 'settings';

export default function EventsPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<EventTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Calendar display state mock
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState('July 2026');

  // Planning lifecycle list mock
  const [events, setEvents] = useState([
    { id: 'EVT-901', name: 'Annual Sports Day', category: 'Sports', date: '2026-07-17', time: '08:00 AM', venue: 'School Sports Field', budget: '₦2,500,000', registered: 480, capacity: 600, status: 'Published' },
    { id: 'EVT-902', name: 'Speech & Prize Giving Day', category: 'Ceremonies', date: '2026-07-28', time: '10:00 AM', venue: 'Main Auditorium', budget: '₦8,000,000', registered: 280, capacity: 400, status: 'Draft' },
    { id: 'EVT-903', name: 'Mid-Year PTA Conference', category: 'Administrative', date: '2026-07-10', time: '02:00 PM', venue: 'Assembly Hall', budget: '₦800,000', registered: 145, capacity: 200, status: 'Approved' }
  ]);

  // Registrations mock database
  const [registrations, setRegistrations] = useState([
    { name: 'Priya Sharma', category: 'Student', event: 'Annual Sports Day', rsvp: 'Attending', paid: 'N/A', checkIn: 'Checked-in' },
    { name: 'Dr. Kwame Mensah', category: 'Parent', event: 'Mid-Year PTA Conference', rsvp: 'Attending', paid: 'N/A', checkIn: 'Awaiting' },
    { name: 'Alumni David Okafor', category: 'Alumni', event: 'Speech & Prize Giving', rsvp: 'Attending', paid: '₦5,000', checkIn: 'Awaiting' }
  ]);

  // Venue booking conflicts list
  const [venueBookings, setVenueBookings] = useState([
    { name: 'Main Auditorium', event: 'Speech & Prize Giving Day', date: '2026-07-28', status: 'Booked' },
    { name: 'School Sports Field', event: 'Annual Sports Day', date: '2026-07-17', status: 'Booked' },
  ]);

  // Budget comparison logs
  const [budgets, setBudgets] = useState([
    { eventName: 'Annual Sports Day', planned: '₦2,500,000', actual: '₦2,420,000', decor: '₦150,000', catering: '₦1,200,000', remaining: '₦80,000' },
    { eventName: 'Speech & Prize Giving Day', planned: '₦8,000,000', actual: '₦0', decor: '₦800,000', catering: '₦4,500,000', remaining: '₦8,000,000' }
  ]);

  // Volunteer shifts roster
  const [volunteers, setVolunteers] = useState([
    { name: 'Mrs. Janet Boateng', role: 'Staff Coordinator', shift: '08:00 AM - 12:00 PM', contact: '+2348011112222', task: 'Ushers placement' },
    { name: 'Samuel Osei', role: 'Parent Volunteer', shift: '12:00 PM - 04:00 PM', contact: '+2348033334444', task: 'Medical post support' }
  ]);

  // Match brackets for competitions
  const [competitionMatches, setCompetitionMatches] = useState([
    { match: 'Senior Science Quiz - Semifinal 1', teamA: 'Grade 11 Science A', teamB: 'Grade 11 Science B', score: '82 - 76', winner: 'Science A' },
    { match: 'Inter-House Soccer Finals', teamA: 'Blue House', teamB: 'Red House', score: '3 - 2', winner: 'Blue House' }
  ]);

  const handleQuickAction = (action: string) => {
    setSaving(true);
    setSavedMessage(null);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(`Action "${action}" triggered successfully!`);
      setTimeout(() => setSavedMessage(null), 3000);
    }, 800);
  };

  const menuItems = [
    { id: 'overview', label: 'Events Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Events Calendar', icon: Calendar },
    { id: 'school', label: 'School Activities', icon: Landmark },
    { id: 'sports', label: 'Sports Events Roster', icon: Trophy },
    { id: 'graduation', label: 'Graduation Planner', icon: Award },
    { id: 'pta', label: 'PTA General Meetings', icon: Users },
    { id: 'open-days', label: 'Open Days Invitations', icon: Megaphone },
    { id: 'competitions', label: 'Competitions & brackets', icon: Gift },
    { id: 'conferences', label: 'Conferences schedules', icon: FileText },
    { id: 'registrations', label: 'RSVP Registrations', icon: UserCheck },
    { id: 'venues', label: 'Venue Reservations', icon: Landmark },
    { id: 'budgets', label: 'Budgets worksheets', icon: DollarSign },
    { id: 'volunteers', label: 'Volunteers Shifts', icon: ShieldCheck },
    { id: 'attendance', label: 'QR Attendance Check', icon: Clock },
    { id: 'reports', label: 'Events Reports', icon: Download },
    { id: 'settings', label: 'Events Settings', icon: Save }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[hsl(var(--accent))]" />
            Events Management System
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Centralized planning, budget reconciliations, RSVP registrations lists, QR code attendance checks, and tournament match fixtures.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            Satisfied Rating: 94.8%
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
              setActiveTab(item.id as EventTab);
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
              setActiveTab(item.id as EventTab);
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
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Events Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as EventTab);
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
        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Upcoming Events', value: '8 Events', sub: 'July - August 2026', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Active Registrations', value: '908 RSVPs', sub: 'Students & Parents', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Events This Month', value: '4 Events', sub: 'Sports day, Science quiz', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Budget Utilization', value: '96.2%', sub: 'Planned vs Actual', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Attendees Registered', value: '760 Seats', sub: '90% Capacity filled', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { label: 'Attendance Rate', value: '94.8% Checked', sub: 'QR Scanned validation', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                { label: 'Pending Approvals', value: '1 Event', sub: 'Speech Day Budget review', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Event Revenue Est.', value: '₦1,420,000', sub: 'Tickets & sponsorships', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                { label: 'Outstanding Tasks', value: '4 Tasks', sub: 'Robe distribution, ushers', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { label: 'Satisfaction Score', value: '92.4%', sub: 'Post-event surveys rating', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
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
              <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Quick Operations</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => handleQuickAction('Create Event')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">+ Create Event</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Lodge new academic activity details</p>
                </button>
                <button onClick={() => handleQuickAction('Register Participants')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Register Parent / Guest</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Lodge RSVP lists manual registrations</p>
                </button>
                <button onClick={() => handleQuickAction('Book Venue')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Book Sports Field</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Trigger facilities scheduling check</p>
                </button>
                <button onClick={() => handleQuickAction('Track Budget')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Reconcile Budget expenses</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Match vendor catering invoices</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Calendar View */}
        {activeTab === 'calendar' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Academic Calendar Agenda</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Tracks examinations, holidays, sports bookings, and board PTA meetings.</p>
              </div>
              <span className="font-mono text-xs font-bold bg-[hsl(var(--bg-tertiary))] px-3 py-1.5 rounded-lg border border-[hsl(var(--border))]">{currentCalendarMonth}</span>
            </div>

            {/* Grid Representation of Calendar Days */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <span key={day} className="font-bold text-[hsl(var(--text-tertiary))] uppercase text-[10px]">{day}</span>
              ))}
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const matchesEvent = dayNum === 17 ? 'Sports Day' : dayNum === 10 ? 'PTA Meet' : dayNum === 28 ? 'Speech Day' : null;
                return (
                  <div key={dayNum} className="h-16 border border-[hsl(var(--border))] rounded-lg p-1.5 bg-[hsl(var(--bg-secondary))] flex flex-col justify-between items-start text-[10px]">
                    <span className="font-semibold text-[hsl(var(--text-tertiary))]">{dayNum}</span>
                    {matchesEvent && (
                      <span className="px-1 py-0.5 rounded bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] font-bold block w-full truncate text-left">{matchesEvent}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* School Events List */}
        {activeTab === 'school' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">School Activities Lifecycle Registry</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Manage draft workflow, principal approvals, and published timelines.</p>
              </div>
              <button onClick={() => {
                const newE = { id: `EVT-${900 + events.length + 1}`, name: 'Orientation Day 2026', category: 'Administrative', date: '2026-08-01', time: '09:00 AM', venue: 'Main Hall', budget: '₦400,000', registered: 0, capacity: 150, status: 'Draft' };
                setEvents([...events, newE]);
              }} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))]">
                <Plus className="w-3.5 h-3.5" /> Log Event
              </button>
            </div>

            <div className="space-y-4">
              {events.map((evt, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex flex-col sm:flex-row justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[hsl(var(--text-primary))]">{evt.name}</p>
                      <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] font-mono text-[9px]">{evt.id}</span>
                    </div>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-2">
                      <span>Category: {evt.category}</span>
                      <span>•</span>
                      <span>Venue: {evt.venue}</span>
                    </p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Budget allocation: <strong className="text-[hsl(var(--text-secondary))]">{evt.budget}</strong></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">{evt.status}</span>
                    {evt.status === 'Draft' && (
                      <button onClick={() => {
                        const copy = [...events];
                        copy[idx].status = 'Published';
                        setEvents(copy);
                      }} className="px-3 py-1 bg-emerald-500 text-white rounded font-bold text-[10px] hover:opacity-90 transition-opacity">Publish</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Registrations */}
        {activeTab === 'registrations' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">RSVP Registrations Management</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configurable participant fields tracking check-in codes status.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Participant Name</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Registered Event</th>
                    <th className="py-2.5 px-2">RSVP Status</th>
                    <th className="py-2.5 px-2">Tickets Paid</th>
                    <th className="py-2.5 px-2 text-right">Check-in Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{reg.name}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{reg.category}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{reg.event}</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-tertiary))]">{reg.rsvp}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))] font-mono">{reg.paid}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${reg.checkIn === 'Checked-in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{reg.checkIn}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Competition brackets */}
        {activeTab === 'competitions' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Competition Match Fixtures</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Inter-house soccer match brackets, debate judges, and quiz brackets.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {competitionMatches.map((match, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3 text-xs">
                  <p className="font-bold text-[hsl(var(--text-primary))]">{match.match}</p>
                  <div className="flex justify-between items-center text-[11px] bg-[hsl(var(--bg-tertiary)/0.3)] p-2 rounded border border-[hsl(var(--border))]">
                    <span>{match.teamA} vs {match.teamB}</span>
                    <strong className="font-mono text-[hsl(var(--accent))]">{match.score}</strong>
                  </div>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] text-right">Winner declared: <strong className="text-emerald-400">{match.winner}</strong></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graduation Planner */}
        {activeTab === 'graduation' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Graduation Ceremony Planner</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Verify robe distribution status, seating configurations, and certificates lists.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))] space-y-2">
                <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5"><Award className="w-4 h-4 text-[hsl(var(--accent))]" /> Robes Status</p>
                <div className="space-y-1 text-[10px] text-[hsl(var(--text-secondary))]">
                  <p>&bull; 145 / 150 Distributed</p>
                  <p>&bull; 5 Awaiting size adjustment</p>
                </div>
              </div>
              <div className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))] space-y-2">
                <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5"><Users className="w-4 h-4 text-[hsl(var(--accent))]" /> Seating Layout</p>
                <div className="space-y-1 text-[10px] text-[hsl(var(--text-secondary))]">
                  <p>&bull; Blocks A &amp; B: Graduands</p>
                  <p>&bull; Block C: VIPs &amp; Parents</p>
                </div>
              </div>
              <div className="p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--bg-secondary))] space-y-2">
                <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5"><Camera className="w-4 h-4 text-[hsl(var(--accent))]" /> Photography checklist</p>
                <div className="space-y-1 text-[10px] text-[hsl(var(--text-secondary))]">
                  <p>&bull; Official Stage Photography</p>
                  <p>&bull; Session Hall Video records</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budgets Worksheets */}
        {activeTab === 'budgets' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Budgets Planned vs Actual expenses</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Finance tracking maps expenditures against allocations automatically.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Event Title</th>
                    <th className="py-2.5 px-2">Planned allocation</th>
                    <th className="py-2.5 px-2">Actual Expensed</th>
                    <th className="py-2.5 px-2">Catering cost</th>
                    <th className="py-2.5 px-2">Decor / security</th>
                    <th className="py-2.5 px-2 text-right">Remaining Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3.5 px-2 font-bold text-[hsl(var(--text-primary))]">{b.eventName}</td>
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-secondary))]">{b.planned}</td>
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-secondary))]">{b.actual}</td>
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-tertiary))]">{b.catering}</td>
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-tertiary))]">{b.decor}</td>
                      <td className="py-3.5 px-2 text-right font-bold text-emerald-400 font-mono">{b.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
