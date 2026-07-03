import { UserPlus, Clock, CheckCircle2, XCircle, FileText, Search, Filter, ArrowRight, MoreHorizontal, Eye, Edit2, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

const demoAdmissions = [
  { id: '1', name: 'Amara Johnson', grade: 'Grade 9', parentName: 'Mrs. Rachel Johnson', parentPhone: '+1 555-0101', appliedDate: 'Jun 28, 2026', status: 'pending', documents: 4, dob: 'Mar 12, 2012' },
  { id: '2', name: 'David Okafor', grade: 'Grade 11', parentName: 'Mr. Emeka Okafor', parentPhone: '+1 555-0102', appliedDate: 'Jun 25, 2026', status: 'under_review', documents: 3, dob: 'Aug 5, 2010' },
  { id: '3', name: 'Sarah Williams', grade: 'Grade 7', parentName: 'Ms. Linda Williams', parentPhone: '+1 555-0103', appliedDate: 'Jun 20, 2026', status: 'approved', documents: 5, dob: 'Nov 22, 2013' },
  { id: '4', name: 'Michael Chen', grade: 'Grade 10', parentName: 'Mr. Wei Chen', parentPhone: '+1 555-0104', appliedDate: 'Jun 18, 2026', status: 'approved', documents: 5, dob: 'Jan 30, 2011' },
  { id: '5', name: 'Fatima Hassan', grade: 'Grade 8', parentName: 'Mr. Ahmed Hassan', parentPhone: '+1 555-0105', appliedDate: 'Jun 15, 2026', status: 'rejected', documents: 2, dob: 'Jul 4, 2012' },
  { id: '6', name: 'James Nguyen', grade: 'Grade 12', parentName: 'Mrs. Linh Nguyen', parentPhone: '+1 555-0106', appliedDate: 'Jun 10, 2026', status: 'enrolled', documents: 5, dob: 'Feb 14, 2009' },
  { id: '7', name: 'Priya Sharma', grade: 'Grade 9', parentName: 'Dr. Raj Sharma', parentPhone: '+1 555-0107', appliedDate: 'Jul 1, 2026', status: 'pending', documents: 1, dob: 'Sep 18, 2012' },
  { id: '8', name: 'Emmanuel Adeyemi', grade: 'Grade 6', parentName: 'Pastor Samuel Adeyemi', parentPhone: '+1 555-0108', appliedDate: 'Jun 30, 2026', status: 'under_review', documents: 3, dob: 'Dec 2, 2014' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Eye },
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
  enrolled: { label: 'Enrolled', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Users },
};

const stageCounts = {
  pending: demoAdmissions.filter(a => a.status === 'pending').length,
  under_review: demoAdmissions.filter(a => a.status === 'under_review').length,
  approved: demoAdmissions.filter(a => a.status === 'approved').length,
  rejected: demoAdmissions.filter(a => a.status === 'rejected').length,
  enrolled: demoAdmissions.filter(a => a.status === 'enrolled').length,
};

export default function AdmissionsPage({ params }: { params: Promise<{ tenant: string }> }) {
  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Admissions</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Manage student applications and enrollment pipeline
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <UserPlus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {/* Pipeline Stage Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(stageCounts).map(([status, count]) => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <div key={status} className={`rounded-xl border p-4 text-center ${cfg.bg}`}>
              <Icon className={`w-5 h-5 mx-auto mb-2 ${cfg.color}`} />
              <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search applicants..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="enrolled">Enrolled</option>
          </select>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option value="">All Grades</option>
            {['Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Applicant', 'Grade', 'Parent/Guardian', 'Applied', 'Documents', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demoAdmissions.map((admission, i) => {
                const cfg = statusConfig[admission.status];
                const Icon = cfg.icon;
                return (
                  <tr key={admission.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                          {admission.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[hsl(var(--text-primary))] whitespace-nowrap">{admission.name}</p>
                          <p className="text-xs text-[hsl(var(--text-tertiary))]">DOB: {admission.dob}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-[hsl(var(--text-secondary))] whitespace-nowrap">{admission.grade}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-[hsl(var(--text-primary))] whitespace-nowrap">{admission.parentName}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{admission.parentPhone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {admission.appliedDate}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                        <span className="text-sm text-[hsl(var(--text-secondary))]">{admission.documents}/5</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors" title="Review">
                          <Eye className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                        </button>
                        {admission.status === 'pending' || admission.status === 'under_review' ? (
                          <>
                            <button className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors" title="Approve">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Reject">
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </>
                        ) : null}
                      </div>
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
