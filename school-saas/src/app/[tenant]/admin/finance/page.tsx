import { DollarSign, TrendingUp, TrendingDown, Wallet, FileText, Plus, ArrowRight, CreditCard, Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react';

const feeStructures = [
  { name: 'Tuition Fee — Grade 9-12', amount: 2400, frequency: 'Per Term', paid: 85, pending: 15 },
  { name: 'Tuition Fee — Grade 6-8', amount: 1800, frequency: 'Per Term', paid: 91, pending: 9 },
  { name: 'Boarding Fee', amount: 3200, frequency: 'Per Term', paid: 72, pending: 28 },
  { name: 'Development Levy', amount: 400, frequency: 'Annual', paid: 78, pending: 22 },
  { name: 'ICT Fees', amount: 120, frequency: 'Annual', paid: 95, pending: 5 },
  { name: 'Sports Fees', amount: 80, frequency: 'Per Term', paid: 88, pending: 12 },
];

const recentTransactions = [
  { id: 'TXN-001', student: 'David Okafor', amount: 2400, date: 'Jul 2, 2026', method: 'Bank Transfer', status: 'completed', type: 'Tuition Fee' },
  { id: 'TXN-002', student: 'Priya Sharma', amount: 1800, date: 'Jul 1, 2026', method: 'Mobile Money', status: 'completed', type: 'Tuition Fee' },
  { id: 'TXN-003', student: 'Michael Chen', amount: 3200, date: 'Jun 30, 2026', method: 'Bank Transfer', status: 'completed', type: 'Boarding Fee' },
  { id: 'TXN-004', student: 'Amara Johnson', amount: 400, date: 'Jun 28, 2026', method: 'Cash', status: 'pending', type: 'Development Levy' },
  { id: 'TXN-005', student: 'Fatima Hassan', amount: 2400, date: 'Jun 25, 2026', method: 'Cheque', status: 'failed', type: 'Tuition Fee' },
];

const txStatusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  completed: { label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

export default function FinancePage() {
  const totalCollected = 324800;
  const totalOutstanding = 28400;
  const totalExpenses = 198500;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Finance</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Fee management, invoices, payments and financial reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
            <FileText className="w-4 h-4" />
            Reports
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 stat-card-gradient">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">+12% this term</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">${totalCollected.toLocaleString()}</p>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">Total Collected</p>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">This academic term</p>
        </div>
        <div className="glass-card p-5 stat-card-gradient">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">48 students</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">${totalOutstanding.toLocaleString()}</p>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">Outstanding Balance</p>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Pending collections</p>
        </div>
        <div className="glass-card p-5 stat-card-gradient">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">Monthly avg</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">${totalExpenses.toLocaleString()}</p>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">Total Expenses</p>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">This academic term</p>
        </div>
      </div>

      {/* Fee Structures */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Fee Structures</h2>
          <button className="flex items-center gap-1.5 text-xs text-[hsl(var(--accent))] hover:underline">
            <Plus className="w-3.5 h-3.5" />
            Add Fee Type
          </button>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {feeStructures.map((fee, i) => (
            <div key={i} className="px-5 py-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{fee.name}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{fee.frequency}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">${fee.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Per Student</p>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-emerald-400">{fee.paid}% paid</span>
                      <span className="text-[10px] text-red-400">{fee.pending}% due</span>
                    </div>
                    <div className="h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fee.paid}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recent Transactions</h2>
          <button className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Transaction ID', 'Student', 'Type', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => {
                const cfg = txStatusConfig[tx.status];
                const Icon = cfg.icon;
                return (
                  <tr key={tx.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{tx.id}</code>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-primary))] whitespace-nowrap">{tx.student}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{tx.type}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-emerald-400">${tx.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                        <span className="text-xs text-[hsl(var(--text-secondary))]">{tx.method}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">{tx.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
