'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Bus, MapPin, Users, Plus, Navigation, Wrench, Fuel, Phone, Clock,
  Menu, Sparkles, UserCheck, ShieldCheck, Heart, Landmark, HelpCircle, Save,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  CalendarCheck, AlertTriangle, Eye, ArrowRight, ShieldAlert, CheckCircle2
} from 'lucide-react';

type TransportTab =
  | 'overview'
  | 'vehicles'
  | 'drivers'
  | 'routes'
  | 'stops'
  | 'allocation'
  | 'tracking'
  | 'fuel'
  | 'maintenance'
  | 'incidents'
  | 'reports'
  | 'settings';

export default function TransportPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<TransportTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Fleet list state
  const [vehicles, setVehicles] = useState([
    { id: 'BUS-01', plate: 'KI-2341-24', brand: 'KIA Bus 35-Seater', capacity: 35, driver: 'Mr. Kwame Darko', odometer: '42,150 km', insurance: '2026-12-15', status: 'Active' },
    { id: 'BUS-02', plate: 'TO-1122-23', brand: 'Toyota HiAce 18-Seater', capacity: 18, driver: 'Mr. Kofi Mensah', odometer: '88,900 km', insurance: '2026-11-20', status: 'Active' },
    { id: 'BUS-03', plate: 'MB-5566-22', brand: 'Minibus 15-Seater', capacity: 15, driver: 'Mr. Samuel Adu', odometer: '102,400 km', insurance: '2026-08-01', status: 'Maintenance' }
  ]);

  // Driver profiles list
  const [drivers, setDrivers] = useState([
    { name: 'Mr. Kwame Darko', license: 'Class F - Heavy Duty', expiry: '2028-04-12', medical: 'Compliant (Exp: 2027-01-10)', phone: '+2348035550011', incidents: 0 },
    { name: 'Mr. Kofi Mensah', license: 'Class E - Bus/Van', expiry: '2027-09-02', medical: 'Compliant (Exp: 2026-12-15)', phone: '+2348035550022', incidents: 1 }
  ]);

  // Route stop sequences list
  const [routes, setRoutes] = useState([
    { code: 'R-EAST', name: 'Route A — Eastside', stops: ['Lumley (Dep: 6:45 AM)', 'Aberdeen (6:55 AM)', 'Congo Cross (7:10 AM)', 'Main Campus (Arr: 7:40 AM)'], capacity: '24 / 35', driver: 'Kwame Darko' },
    { code: 'R-NORTH', name: 'Route B — Northgate', stops: ['Northgate (Dep: 7:00 AM)', 'Airport Road (7:15 AM)', 'Main Campus (Arr: 7:35 AM)'], capacity: '18 / 18', driver: 'Kofi Mensah' }
  ]);

  // Student allocation list
  const [allocations, setAllocations] = useState([
    { name: 'Amara Johnson', grade: 'Grade 10A', route: 'Route A — Eastside', stop: 'Congo Cross', status: 'Checked-in' },
    { name: 'David Okafor', grade: 'Grade 9B', route: 'Route B — Northgate', stop: 'Airport Road', status: 'Awaiting Boarding' }
  ]);

  // Fuel log purchase registers
  const [fuelLogs, setFuelLogs] = useState([
    { id: 'FL-9021', date: 'Today, 07:15 AM', vehicle: 'BUS-01 (KI-2341-24)', type: 'Diesel', qty: '45 Litres', cost: '₦40,500', mileage: '9.4 km/L' },
    { id: 'FL-9020', date: 'Yesterday', vehicle: 'BUS-02 (TO-1122-23)', type: 'Petrol', qty: '38 Litres', cost: '₦32,300', mileage: '11.2 km/L' }
  ]);

  // Incident logs registers
  const [incidents, setIncidents] = useState([
    { id: 'INC-402', date: 'Today, 07:30 AM', vehicle: 'BUS-03', driver: 'Samuel Adu', route: 'Route C — Westtown', desc: 'Flat tire breakdown at Congo Cross junction. Replacement minibus deployed.', action: 'Safety replacement deployed within 12 mins. No students harmed.' }
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
    { id: 'overview', label: 'Transport Dashboard', icon: BarChart3 },
    { id: 'vehicles', label: 'School Vehicles', icon: Bus },
    { id: 'drivers', label: 'Driver Profiles', icon: Users },
    { id: 'routes', label: 'Route sequences', icon: MapPin },
    { id: 'stops', label: 'Bus Stops details', icon: Landmark },
    { id: 'allocation', label: 'Student Allocations', icon: UserCheck },
    { id: 'tracking', label: 'Live GPS Tracking', icon: Navigation },
    { id: 'fuel', label: 'Fuel Management', icon: Fuel },
    { id: 'maintenance', label: 'Maintenance logs', icon: Wrench },
    { id: 'incidents', label: 'Transport Incidents', icon: ShieldAlert },
    { id: 'reports', label: 'Operational Reports', icon: Download },
    { id: 'settings', label: 'Transport Settings', icon: Save }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <Bus className="w-8 h-8 text-[hsl(var(--accent))]" />
            Fleet &amp; Student Transportation
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Complete management of school bus fleets, active stops sequence routing, live GPS tracking logs, and incident registers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            GPS Online: 4 Buses Active
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
              setActiveTab(item.id as TransportTab);
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
              setActiveTab(item.id as TransportTab);
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
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Transport Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TransportTab);
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
                { label: 'Active Routes', value: '8 Routes', sub: '4 Main Campuses', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Vehicles in Service', value: '11 Buses', sub: '1 in maintenance', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Vehicles Maintenance', value: '1 Active', sub: 'Odometer limit check', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Students Assigned', value: '342 Students', sub: 'No-overflow capacity limit', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { label: 'Drivers on Duty', value: '10 Drivers', sub: 'License check valid', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'GPS Online Status', value: '100% Connected', sub: 'Parents tracking active', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Fuel Consumption', value: '840 Litres', sub: 'Month total diesel/petrol', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { label: 'Transport Incidents', value: '1 Reported', sub: 'Flat tire, fixed safely', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                { label: 'Route Occupancy', value: '78.4%', sub: 'Seat occupancy utilization', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                { label: 'Maintenance Due', value: '2 Overdue', sub: 'Odometer oil servicing', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
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
                <button onClick={() => handleQuickAction('Add Vehicle')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">+ Add Vehicle</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Register new bus license tag</p>
                </button>
                <button onClick={() => handleQuickAction('Add Route')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">+ Add Route stops</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Configure sequence arrival points</p>
                </button>
                <button onClick={() => handleQuickAction('Assign Driver')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Assign Driver to Bus</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Check license classes matches</p>
                </button>
                <button onClick={() => handleQuickAction('Record Fuel')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Log Fuel Refill</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Input diesel litres and odometer mileage</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Register */}
        {activeTab === 'vehicles' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">School Vehicles Register</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Track roadworthiness inspection records, odometer counters, and safety compliance status.</p>
              </div>
              <button onClick={() => {
                const newV = { id: `BUS-0${vehicles.length + 1}`, plate: 'KI-3011-26', brand: 'KIA Bus 35-Seater', capacity: 35, driver: 'Unassigned', odometer: '1,200 km', insurance: '2027-01-10', status: 'Active' };
                setVehicles([...vehicles, newV]);
              }} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90">
                <Plus className="w-3.5 h-3.5" /> Add Fleet Bus
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Vehicle ID</th>
                    <th className="py-2.5 px-2">Plate Number</th>
                    <th className="py-2.5 px-2">Manufacturer / Brand</th>
                    <th className="py-2.5 px-2">Seating Capacity</th>
                    <th className="py-2.5 px-2">Current Odometer</th>
                    <th className="py-2.5 px-2">Insurance Expiry</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-[hsl(var(--text-primary))]">{v.id}</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{v.plate}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-primary))]">{v.brand}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{v.capacity} seats</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{v.odometer}</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-tertiary))]">{v.insurance}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${v.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drivers Profiles */}
        {activeTab === 'drivers' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Driver Safety Profiles</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Detailed license class types, medical physical compliance check timelines, and incident trackers.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Driver Name</th>
                    <th className="py-2.5 px-2">License Class</th>
                    <th className="py-2.5 px-2">License Expiry</th>
                    <th className="py-2.5 px-2">Medical Fitness Expiry</th>
                    <th className="py-2.5 px-2">Incident Record</th>
                    <th className="py-2.5 px-2 text-right">Contact Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((drv, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{drv.name}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{drv.license}</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-tertiary))]">{drv.expiry}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{drv.medical}</td>
                      <td className="py-3 px-2 font-mono font-semibold text-rose-400">{drv.incidents} Incidents</td>
                      <td className="py-3 px-2 text-right font-mono text-[hsl(var(--text-secondary))]">{drv.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Route Sequences stop list */}
        {activeTab === 'routes' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Route Stop Sequences Timeline</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Model physical bus stop sequences showing estimated departure and campus arrival times.</p>
            </div>

            <div className="space-y-4">
              {routes.map((route, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--border))]">
                    <div>
                      <p className="font-bold text-[hsl(var(--text-primary))]">{route.name}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Driver: {route.driver} | Code: <strong className="font-mono">{route.code}</strong></p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">{route.capacity} seats filled</span>
                  </div>

                  <div className="relative pl-6 space-y-4 border-l-2 border-[hsl(var(--border))] text-[11px] pt-1">
                    {route.stops.map((stop, sIdx) => (
                      <div key={sIdx} className="relative">
                        <span className="absolute -left-[30px] top-0 w-3 h-3 rounded-full bg-[hsl(var(--accent))] border-2 border-[hsl(var(--bg-secondary))]" />
                        <p className="font-bold text-[hsl(var(--text-primary))]">{stop.split(' (')[0]}</p>
                        <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">{stop.includes('(') ? stop.slice(stop.indexOf('(')) : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Allocations */}
        {activeTab === 'allocation' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Student Transport Allocation</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Assigns students to pickup/drop-off stops while validating vehicle capacity limits.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Student Name</th>
                    <th className="py-2.5 px-2">Grade / Class</th>
                    <th className="py-2.5 px-2">Assigned Route</th>
                    <th className="py-2.5 px-2">Pickup / Drop-off Stop</th>
                    <th className="py-2.5 px-2 text-right">Boarding Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{alloc.name}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{alloc.grade}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{alloc.route}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{alloc.stop}</td>
                      <td className="py-3 px-2 text-right font-semibold text-emerald-400">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${alloc.status === 'Checked-in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>{alloc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fuel Management */}
        {activeTab === 'fuel' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Fuel Refill Logs</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Reconciliation of fuel cost expenses per mileage efficiency trackers.</p>
              </div>
              <button onClick={() => alert('Add fuel purchase ticket form.')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" /> Log Refuel Purchase
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Log ID</th>
                    <th className="py-2.5 px-2">Date &amp; Time</th>
                    <th className="py-2.5 px-2">Vehicle Plate</th>
                    <th className="py-2.5 px-2">Fuel Type / Quantity</th>
                    <th className="py-2.5 px-2">Purchase Cost</th>
                    <th className="py-2.5 px-2 text-right">Mileage Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{log.id}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))] font-mono">{log.date}</td>
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{log.vehicle}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{log.type} &bull; {log.qty}</td>
                      <td className="py-3 px-2 font-mono font-bold text-[hsl(var(--text-primary))]">{log.cost}</td>
                      <td className="py-3 px-2 text-right font-mono text-emerald-400">{log.mileage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transport Incidents */}
        {activeTab === 'incidents' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Incident Log Registry</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Detailed incident records of vehicle breakdowns, accidents, mechanical delays, or route cancellations.</p>
              </div>
              <button onClick={() => alert('Log incident form triggered.')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" /> Log Breakdown Incident
              </button>
            </div>

            <div className="space-y-4">
              {incidents.map((inc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <p className="font-bold text-[hsl(var(--text-primary))]">{inc.vehicle} - Breakdown</p>
                    </div>
                    <span className="font-mono text-[9px] text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-1.5 py-0.5 rounded">{inc.id}</span>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Date: {inc.date} | Driver: {inc.driver} | Route: {inc.route}</p>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed bg-[hsl(var(--bg-tertiary)/0.3)] p-3 rounded-lg border border-[hsl(var(--border))]">{inc.desc}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Actions Taken: {inc.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
