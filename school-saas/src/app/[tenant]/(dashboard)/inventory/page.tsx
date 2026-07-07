'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Package, Plus, Search, AlertTriangle, TrendingDown, Wrench, Truck, Shield,
  Layers, Brain, Zap, Link2, Download, History, Settings, Save, Sparkles, Check,
  Play, Upload, QrCode, ShieldCheck, UserCheck, Trash2, Key, Clock, Landmark, Laptop, Video,
  Trophy, CheckCircle2, ChevronRight, Menu, HelpCircle, Eye, FileText
} from 'lucide-react';

type ResourceTab =
  | 'overview'
  | 'buildings'
  | 'classrooms'
  | 'laboratories'
  | 'libraries'
  | 'sports'
  | 'equipment'
  | 'computers'
  | 'projectors'
  | 'furniture'
  | 'bookings'
  | 'maintenance'
  | 'inventory'
  | 'reports'
  | 'settings';

export default function ResourceManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<ResourceTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Facility / Asset Mock data states
  const [campuses, setCampuses] = useState([
    {
      name: 'Main Campus',
      buildings: [
        {
          name: 'Science Block',
          floors: [
            {
              floor: 'First Floor',
              rooms: ['Chemistry Lab A', 'Physics Lab B', 'Robotics Suite']
            }
          ]
        },
        {
          name: 'Academic Block A',
          floors: [
            {
              floor: 'Ground Floor',
              rooms: ['Classroom A-101 (Smart)', 'Classroom A-102', 'Lecture Hall 1']
            }
          ]
        }
      ]
    }
  ]);

  // Computers Inventory mock logs
  const [computers, setComputers] = useState([
    { name: 'ICT-LAB-PC01', tag: 'AST-C9024', os: 'Windows 11 Education', cpu: 'Intel Core i5 12th Gen', ram: '16 GB DDR4', storage: '512 GB SSD', status: 'Online', room: 'Computer Lab 1', warranty: '2027-09-12' },
    { name: 'ICT-LAB-PC02', tag: 'AST-C9025', os: 'Windows 11 Education', cpu: 'Intel Core i5 12th Gen', ram: '16 GB DDR4', storage: '512 GB SSD', status: 'Offline', room: 'Computer Lab 1', warranty: '2027-09-12' },
    { name: 'ADMIN-OFFICE-LPT', tag: 'AST-C8201', os: 'macOS Sonoma', cpu: 'Apple M2 Pro', ram: '16 GB Unified', storage: '512 GB SSD', status: 'Online', room: 'Principal Office', warranty: '2026-11-20' },
  ]);

  // Room bookings mock calendar with conflict prevention
  const [bookings, setBookings] = useState([
    { room: 'Chemistry Lab A', date: '2026-07-08', time: '10:00 AM - 12:00 PM', purpose: 'SS3 Chemistry Practical Assessment', host: 'Mr. Kofi Owusu', status: 'Approved' },
    { room: 'Lecture Hall 1', date: '2026-07-08', time: '02:00 PM - 04:00 PM', purpose: 'SS2 Termly General Assembly', host: 'Mrs. Patricia Osei', status: 'Approved' },
  ]);

  // Maintenance lifecycle workflow mock
  const [maintenanceTickets, setMaintenanceTickets] = useState([
    { id: 'MNT-4201', asset: 'Dell Projector XG450 (Room A-204)', type: 'Bulb Replacement', cost: '₦45,000', reporter: 'Mr. Kofi Owusu', status: 'Inspection', time: 'Today, 08:30 AM' },
    { id: 'MNT-4200', asset: 'Computer Suite AC Unit 2', type: 'Freon Gas Refill', cost: '₦32,000', reporter: 'ICT Admin', status: 'Verified', time: 'Yesterday' },
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
    { id: 'overview', label: 'Resource Dashboard', icon: Package },
    { id: 'buildings', label: 'Campus Buildings', icon: Landmark },
    { id: 'classrooms', label: 'Classrooms Hub', icon: Landmark },
    { id: 'laboratories', label: 'Laboratories safety', icon: Sparkles },
    { id: 'libraries', label: 'Libraries Catalog', icon: FileText },
    { id: 'sports', label: 'Sports Facilities', icon: Trophy },
    { id: 'equipment', label: 'Assets & Equipment', icon: Truck },
    { id: 'computers', label: 'Computers Inventory', icon: Laptop },
    { id: 'projectors', label: 'Projectors details', icon: Video },
    { id: 'furniture', label: 'Furniture assets', icon: Landmark },
    { id: 'bookings', label: 'Room Bookings Engine', icon: Clock },
    { id: 'maintenance', label: 'Maintenance timelines', icon: Wrench },
    { id: 'inventory', label: 'Consumables Stock', icon: Package },
    { id: 'reports', label: 'Utilization Reports', icon: TrendingDown },
    { id: 'settings', label: 'Resource Settings', icon: Save }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <Landmark className="w-8 h-8 text-[hsl(var(--accent))]" />
            Asset &amp; Facility Management
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Complete lifecycle tracking of campuses physical spaces, computing devices hardware logs, and rooms booking schedules conflict indicators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            Active Assets Valued: ₦142,400,000
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
              setActiveTab(item.id as ResourceTab);
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
              setActiveTab(item.id as ResourceTab);
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
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Resource Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ResourceTab);
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
                { label: 'Total Assets', value: '1,842 Items', sub: '92% Active', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Active Assets', value: '1,692 In-use', sub: 'Assigned to floors', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Under Maintenance', value: '4 Active', sub: 'Average delay 1.4 days', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Available Classrooms', value: '12 Rooms', sub: 'Free for custom slot bookings', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { label: 'Room Bookings Today', value: '8 Sessions', sub: 'Conflict checked pass', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Lab Utilization', value: '88% Capacity', sub: 'Robotics lab at 97%', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Equipment Used', value: '94% Allocated', sub: 'Projectors & Laptops', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { label: 'Overdue Maintenance', value: '0 Tickets', sub: 'SLA compliant maintenance', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Asset Value Est.', value: '₦142.4M', sub: 'Depreciated calculations', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                { label: 'Damaged Assets', value: '2 Reported', sub: 'Awaiting repair inspection', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => handleQuickAction('Add Asset')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">+ Add Asset</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Register new hardware serial tag</p>
                </button>
                <button onClick={() => handleQuickAction('Book Room')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Book Room Slot</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Check timetable availability and reserve</p>
                </button>
                <button onClick={() => handleQuickAction('Schedule Maintenance')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Schedule Repair</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Log defect ticket to facilities technicians</p>
                </button>
                <button onClick={() => handleQuickAction('Print Labels')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Print QR Labels</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Export PDF barcodes for inventory audits</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campus Buildings List */}
        {activeTab === 'buildings' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Campus Buildings Tree Layout</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Model the school campus nesting locations: Campus &rarr; Building &rarr; Floor &rarr; Room.</p>
            </div>

            <div className="space-y-4">
              {campuses.map((campus, cIdx) => (
                <div key={cIdx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                  <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{campus.name}</p>
                  <div className="relative pl-6 space-y-4 border-l-2 border-[hsl(var(--border))] text-xs">
                    {campus.buildings.map((b, bIdx) => (
                      <div key={bIdx} className="space-y-2">
                        <p className="font-bold text-[hsl(var(--text-primary))]">&bull; {b.name}</p>
                        <div className="pl-4 space-y-2">
                          {b.floors.map((f, fIdx) => (
                            <div key={fIdx} className="space-y-1">
                              <p className="text-[hsl(var(--text-secondary))] font-medium underline">{f.floor}:</p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {f.rooms.map((r, rIdx) => (
                                  <span key={rIdx} className="px-2.5 py-1 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] font-mono text-[10px] text-[hsl(var(--text-primary))]">{r}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classrooms Hub */}
        {activeTab === 'classrooms' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Classrooms Allocations &amp; Features</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Verify smart equipment presence (projector, air conditioning, internet) and seating capacities.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { number: 'Room A-101', capacity: 40, ac: 'Available', projector: 'Smart Board Installed', status: 'SS2 Mathematics Session', type: 'Smart Classroom' },
                { number: 'Room A-102', capacity: 35, ac: 'Available', projector: 'Standard Wall Mounted', status: 'Available', type: 'Standard Classroom' },
                { number: 'Room B-204', capacity: 40, ac: 'Not Installed', projector: 'Available', status: 'SS3 Physics session', type: 'Standard Classroom' }
              ].map((room, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--border))]">
                    <div>
                      <p className="font-bold text-[hsl(var(--text-primary))]">{room.number}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{room.type}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{room.status}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[hsl(var(--text-secondary))]">Desk Capacity: <strong className="text-[hsl(var(--text-primary))]">{room.capacity} students</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Projector Status: <strong className="text-[hsl(var(--text-primary))]">{room.projector}</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Air Conditioning: <strong className="text-[hsl(var(--text-primary))]">{room.ac}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Computers Inventory */}
        {activeTab === 'computers' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Computing Hardware Devices logs</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Detailed hardware registers including operating system version, processor (CPU), memory (RAM), and storage capacities.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Device Name</th>
                    <th className="py-2.5 px-2">Asset Tag ID</th>
                    <th className="py-2.5 px-2">OS &amp; Processor CPU</th>
                    <th className="py-2.5 px-2">RAM / Storage</th>
                    <th className="py-2.5 px-2">Location Room</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {computers.map((comp, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5"><Laptop className="w-4 h-4 text-[hsl(var(--accent))]" /> {comp.name}</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{comp.tag}</td>
                      <td className="py-3 px-2">
                        <p className="text-[hsl(var(--text-primary))]">{comp.os}</p>
                        <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">{comp.cpu}</p>
                      </td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))] font-mono">{comp.ram} / {comp.storage}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{comp.room}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${comp.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>{comp.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Room Bookings Engine */}
        {activeTab === 'bookings' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Centralized Booking Engine</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Prevents double room bookings by checking automatic conflict validators against active school timetables.</p>
            </div>

            <div className="space-y-3">
              {bookings.map((booking, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center flex-wrap gap-4 text-xs">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{booking.room}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-2">
                      <span>Date: {booking.date}</span>
                      <span>•</span>
                      <span>Time: {booking.time}</span>
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[hsl(var(--text-secondary))] font-medium">{booking.purpose}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))]">Hosted by: {booking.host}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold uppercase">{booking.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Timelines */}
        {activeTab === 'maintenance' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Maintenance Lifecycle Timelines</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Track reported faults from inspection to repair verification and closure.</p>
              </div>
              <button onClick={() => alert('Add defect ticket form triggered.')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" /> Report Fault Ticket
              </button>
            </div>

            <div className="space-y-4">
              {maintenanceTickets.map((ticket, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[hsl(var(--text-primary))]">{ticket.asset}</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Issue: {ticket.type} | Repair Cost: <strong className="text-[hsl(var(--text-secondary))]">{ticket.cost}</strong></p>
                    </div>
                    <span className="font-mono text-[9px] text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-1.5 py-0.5 rounded">{ticket.id}</span>
                  </div>

                  <div className="relative pl-6 space-y-4 border-l-2 border-[hsl(var(--border))] text-[11px]">
                    <div className="relative">
                      <span className="absolute -left-[30px] top-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[hsl(var(--bg-secondary))]" />
                      <p className="font-bold text-[hsl(var(--text-primary))]">Fault Reported</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Reporter: {ticket.reporter} | {ticket.time}</p>
                    </div>
                    <div className="relative">
                      <span className={`absolute -left-[30px] top-0 w-3 h-3 rounded-full border-2 border-[hsl(var(--bg-secondary))] ${ticket.status === 'Inspection' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                      <p className="font-bold text-[hsl(var(--text-primary))]">Inspection &amp; Assessment</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Assigned to: Lead Campus Technician</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
