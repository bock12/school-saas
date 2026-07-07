'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Library, BookOpen, Plus, Search, RotateCcw, Clock, User, AlertTriangle, CheckCircle2,
  Menu, Sparkles, UserCheck, ShieldCheck, Heart, Landmark, HelpCircle, Save,
  TrendingDown, FileText, Download, History, Zap, Settings, RefreshCw, BarChart3,
  CalendarCheck, Gift, Award, ClipboardList, Camera, Printer, Megaphone, Eye, Trash2, DollarSign
} from 'lucide-react';

type LibraryTab =
  | 'overview'
  | 'catalog'
  | 'books'
  | 'digital-library'
  | 'members'
  | 'borrowing'
  | 'returns'
  | 'reservations'
  | 'fines'
  | 'inventory'
  | 'reports'
  | 'settings';

export default function LibraryPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<LibraryTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Books list state
  const [books, setBooks] = useState([
    { id: '1', title: 'Advanced Mathematics for Senior High', author: 'Prof. K. Asante', isbn: '978-1-234567-01-0', category: 'Mathematics', copies: 12, available: 8, status: 'available' },
    { id: '2', title: 'Fundamentals of Physics', author: 'Dr. R. Mensah', isbn: '978-1-234567-02-7', category: 'Science', copies: 10, available: 3, status: 'limited' },
    { id: '3', title: 'A History of West Africa', author: 'J. D. Fage', isbn: '978-1-234567-03-4', category: 'History', copies: 8, available: 0, status: 'unavailable' }
  ]);

  // Physical copy location mapping list
  const [bookCopies, setBookCopies] = useState([
    { title: 'Introduction to Biology', copyNum: 'Copy 001', branch: 'Main Library', shelf: 'Shelf B-12', condition: 'Excellent', status: 'Available' },
    { title: 'Introduction to Biology', copyNum: 'Copy 002', branch: 'Main Library', shelf: 'Shelf B-12', condition: 'Good', status: 'Issued' },
    { title: 'Fundamentals of Physics', copyNum: 'Copy 001', branch: 'Science Annex', shelf: 'Shelf F-3', condition: 'Fair', status: 'Available' }
  ]);

  // Active circulation borrowing list
  const [borrowings, setBorrowings] = useState([
    { id: 'BRW-901', student: 'David Okafor', book: 'Advanced Mathematics for Senior High', borrowed: 'Jun 20', due: 'Jul 4', status: 'overdue' },
    { id: 'BRW-902', student: 'Priya Sharma', book: 'English Grammar in Use', borrowed: 'Jun 25', due: 'Jul 9', status: 'active' }
  ]);

  // Digital resources database downlinks
  const [digitalResources, setDigitalResources] = useState([
    { title: 'Grade 10 Calculus E-book', format: 'PDF (12.4 MB)', category: 'Mathematics', access: 'Student & Teacher download', downloads: 142 },
    { title: 'Organic Chemistry Lab Walkthrough', format: 'Video MP4', category: 'Science', access: 'Teacher view only', downloads: 88 }
  ]);

  // Reservation hold queues
  const [reservations, setReservations] = useState([
    { book: 'A History of West Africa', member: 'Amara Johnson (Grade 9)', requestDate: '2026-07-01', position: '1st in Queue', status: 'Pending return' }
  ]);

  // Outstanding fines
  const [fines, setFines] = useState([
    { name: 'David Okafor', reason: 'Mathematics Overdue (12 Days)', amount: '₦2,400', date: '2026-07-05', status: 'Unpaid' }
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
    { id: 'overview', label: 'Library Dashboard', icon: BarChart3 },
    { id: 'catalog', label: 'Resource Catalog', icon: BookOpen },
    { id: 'books', label: 'Physical Copies', icon: Landmark },
    { id: 'digital-library', label: 'Digital Library', icon: Download },
    { id: 'members', label: 'Library Members', icon: UserCheck },
    { id: 'borrowing', label: 'Active Borrowing', icon: Clock },
    { id: 'returns', label: 'Circulation Returns', icon: RotateCcw },
    { id: 'reservations', label: 'Holds Queue', icon: Gift },
    { id: 'fines', label: 'Fines Ledger', icon: DollarSign },
    { id: 'inventory', label: 'Library Audits', icon: ShieldCheck },
    { id: 'reports', label: 'Usage Reports', icon: TrendingDown },
    { id: 'settings', label: 'Library Settings', icon: Save }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <Library className="w-8 h-8 text-[hsl(var(--accent))]" />
            Library &amp; Digital Resources
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Centrally manage physical catalog copy shelf mapping, digital learning E-books downloads, holds queues, and automated fine rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            Catalog Value: 24,000 Copies
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
              setActiveTab(item.id as LibraryTab);
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
              setActiveTab(item.id as LibraryTab);
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
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Library Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as LibraryTab);
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
                { label: 'Total Titles', value: '4,842 Titles', sub: 'Books, Journals, audio', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Total Copies', value: '24,150 Copies', sub: 'Assigned to branches', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Borrowed Today', value: '42 Items', sub: 'Loans checkouts checked', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Overdue Items', value: '14 Overdue', sub: 'Fine ledger mapping active', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { label: 'Active Members', value: '1,420 Users', sub: 'Students & Teachers', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { label: 'Reserved Books', value: '3 Holds', sub: 'Holds queue waiting', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Digital Downloads', value: '88 Downloads', sub: 'E-books access', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { label: 'Outstanding Fines', value: '₦18,400', sub: 'Finance billing matches', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Damaged Books', value: '3 Reported', sub: 'Sent for repair inspections', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                { label: 'Lost Books', value: '1 Book', sub: 'Approved for procurement', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
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
                <button onClick={() => handleQuickAction('Add Book')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">+ Add Book / Title</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Lodge new ISBN catalog item</p>
                </button>
                <button onClick={() => handleQuickAction('Issue Book')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Issue Book (Loan)</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Check out book to student/staff</p>
                </button>
                <button onClick={() => handleQuickAction('Record Fine')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Log Overdue Fine</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Impose penalty on overdue checkout</p>
                </button>
                <button onClick={() => handleQuickAction('Audit Shelf')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Audit Book Shelf</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Verify copy shelfs placement status</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Catalog List */}
        {activeTab === 'catalog' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Bibliographic Resource Catalog</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Central search directory matching author, publisher, ISBN, and languages.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Book Title</th>
                    <th className="py-2.5 px-2">Author / Publisher</th>
                    <th className="py-2.5 px-2">ISBN Tag</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Total Copies</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3.5 px-2 font-bold text-[hsl(var(--text-primary))]">{b.title}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-secondary))]">{b.author}</td>
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-tertiary))]">{b.isbn}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-secondary))]">{b.category}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-secondary))]">{b.copies} copies</td>
                      <td className="py-3.5 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${b.status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Copy Management */}
        {activeTab === 'books' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Physical Copy Shelfs &amp; Conditions</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Individual barcodes identity tracking branches location and shelf position.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {bookCopies.map((copy, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3">
                  <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-2">
                    <div>
                      <p className="font-bold text-[hsl(var(--text-primary))]">{copy.title}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono mt-0.5">{copy.copyNum}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${copy.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{copy.status}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[hsl(var(--text-secondary))]">Branch: <strong className="text-[hsl(var(--text-primary))]">{copy.branch}</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Shelf Placement: <strong className="text-[hsl(var(--text-primary))]">{copy.shelf}</strong></p>
                    <p className="text-[hsl(var(--text-secondary))]">Physical Condition: <strong className="text-[hsl(var(--text-primary))]">{copy.condition}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Digital Library */}
        {activeTab === 'digital-library' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Digital Learning Resource E-books</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Secure catalog downloading of syllabus PDFs, lesson notes, and teacher audiobooks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {digitalResources.map((res, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{res.title}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Format: {res.format} | Access limit: {res.access}</p>
                  </div>
                  <button onClick={() => handleQuickAction('Download PDF')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservations Holds Queue */}
        {activeTab === 'reservations' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Reservations &amp; Holds Queue</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Automatic notification alerts trigger when unavailable books are returned.</p>
            </div>

            <div className="space-y-3">
              {reservations.map((res, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center flex-wrap gap-4 text-xs">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{res.book}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Reserved by: {res.member} | Date: {res.requestDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">{res.position}</span>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">{res.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fines Ledger */}
        {activeTab === 'fines' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Library Fines General Ledger</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Audits overdue penalties, lost book charges, and outstanding fee invoices.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Member Name</th>
                    <th className="py-2.5 px-2">Reason Description</th>
                    <th className="py-2.5 px-2">Fine Imposed Date</th>
                    <th className="py-2.5 px-2">Fine Amount</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map((fine, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3.5 px-2 font-bold text-[hsl(var(--text-primary))]">{fine.name}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-secondary))]">{fine.reason}</td>
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-tertiary))]">{fine.date}</td>
                      <td className="py-3.5 px-2 font-mono font-bold text-rose-400">{fine.amount}</td>
                      <td className="py-3.5 px-2 text-right font-semibold text-rose-400">{fine.status}</td>
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
