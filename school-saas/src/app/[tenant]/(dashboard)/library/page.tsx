import { Library, BookOpen, Plus, Search, RotateCcw, Clock, User, AlertTriangle, CheckCircle2 } from 'lucide-react';

const books = [
  { id: '1', title: 'Advanced Mathematics for Senior High', author: 'Prof. K. Asante', isbn: '978-1-234567-01-0', category: 'Mathematics', copies: 12, available: 8, status: 'available' },
  { id: '2', title: 'Fundamentals of Physics', author: 'Dr. R. Mensah', isbn: '978-1-234567-02-7', category: 'Science', copies: 10, available: 3, status: 'limited' },
  { id: '3', title: 'A History of West Africa', author: 'J. D. Fage', isbn: '978-1-234567-03-4', category: 'History', copies: 8, available: 0, status: 'unavailable' },
  { id: '4', title: 'English Grammar in Use', author: 'Raymond Murphy', isbn: '978-1-234567-04-1', category: 'English', copies: 20, available: 14, status: 'available' },
  { id: '5', title: 'Chemistry Made Easy', author: 'Mrs. B. Boateng', isbn: '978-1-234567-05-8', category: 'Science', copies: 9, available: 5, status: 'available' },
  { id: '6', title: 'Introduction to Computer Science', author: 'Dr. K. Agyei', isbn: '978-1-234567-06-5', category: 'ICT', copies: 15, available: 9, status: 'available' },
];

const borrowings = [
  { id: '1', student: 'David Okafor', book: 'Advanced Mathematics for Senior High', borrowed: 'Jun 20', due: 'Jul 4', status: 'overdue' },
  { id: '2', student: 'Priya Sharma', book: 'English Grammar in Use', borrowed: 'Jun 25', due: 'Jul 9', status: 'active' },
  { id: '3', student: 'Michael Chen', book: 'Fundamentals of Physics', borrowed: 'Jun 28', due: 'Jul 12', status: 'active' },
  { id: '4', student: 'Amara Johnson', book: 'Chemistry Made Easy', borrowed: 'Jul 1', due: 'Jul 15', status: 'active' },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  available: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Available' },
  limited: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Limited' },
  unavailable: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'All Borrowed' },
  active: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Active' },
  overdue: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Overdue' },
  returned: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Returned' },
};

export default function LibraryPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Library</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Book catalog, borrowing and returns management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />Add Book
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Books', value: books.reduce((a, b) => a + b.copies, 0), color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Available Now', value: books.reduce((a, b) => a + b.available, 0), color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Currently Borrowed', value: borrowings.filter(b => b.status === 'active').length, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Overdue', value: borrowings.filter(b => b.status === 'overdue').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input type="text" placeholder="Search by title, author or ISBN..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
          </div>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>All Categories</option>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>History</option>
            <option>ICT</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Book Catalog */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Book Catalog</h2>
            <span className="text-xs text-[hsl(var(--text-tertiary))]">{books.length} titles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Title', 'Category', 'Copies', 'Available', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {books.map(book => {
                  const cfg = statusConfig[book.status];
                  return (
                    <tr key={book.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight">{book.title}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{book.author}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">{book.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{book.copies}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-[hsl(var(--text-primary))]">{book.available}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Borrowings */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Active Borrowings</h2>
            <button className="text-xs text-[hsl(var(--accent))] hover:underline">View all</button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {borrowings.map(b => {
              const cfg = statusConfig[b.status];
              return (
                <div key={b.id} className="p-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{b.student}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2 leading-relaxed">{b.book}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Clock className="w-3 h-3" />Due: {b.due}</p>
                    <button className="flex items-center gap-1 text-[10px] text-[hsl(var(--accent))] hover:underline"><RotateCcw className="w-3 h-3" />Return</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
