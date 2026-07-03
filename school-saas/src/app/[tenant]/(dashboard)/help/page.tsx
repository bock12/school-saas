import { HelpCircle, BookOpen, MessageSquare, Video, Mail, Phone, ChevronRight, Search, Star, ExternalLink } from 'lucide-react';

const categories = [
  { icon: BookOpen, label: 'Getting Started', articles: 8, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { icon: MessageSquare, label: 'Communication', articles: 12, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { icon: Star, label: 'Finance & Fees', articles: 10, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { icon: HelpCircle, label: 'Common Issues', articles: 15, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

const faqs = [
  { q: 'How do I admit a new student?', a: 'Go to Admissions → click "New Application" → fill in student and parent details → submit for review. The application moves through Pending → Under Review → Approved → Enrolled stages.' },
  { q: 'How do I record a fee payment?', a: 'Navigate to Finance → click "Record Payment" → search for the student → select the fee type → enter payment details and method → save.' },
  { q: 'How do I generate attendance reports?', a: 'Go to Reports & Analytics → Attendance Analytics → select the date range and class → click "View Full Report" to download or export.' },
  { q: 'How do I send a message to all parents?', a: 'Go to Communication Center → Quick Message → set "To" to "All Parents" → choose your channel (SMS/Email/Push) → write your message → Send.' },
  { q: 'How do I approve a leave request?', a: 'Navigate to Approvals → find the pending leave request → click the green "Approve" button → the requestor is automatically notified.' },
  { q: 'How do I add a new user account?', a: 'Go to Users & Roles → click "Add User" → fill in name, email and select a role → the user receives a password setup email automatically.' },
];

const supportOptions = [
  { icon: MessageSquare, label: 'Live Chat', description: 'Chat with our support team', availability: 'Mon–Fri, 8am–6pm', action: 'Start Chat', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { icon: Mail, label: 'Email Support', description: 'support@schoolsaas.io', availability: '24/7, response in <2hrs', action: 'Send Email', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { icon: Phone, label: 'Phone Support', description: '+1 (800) SCHOOL-1', availability: 'Mon–Fri, 9am–5pm', action: 'Call Now', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { icon: Video, label: 'Training Videos', description: 'Step-by-step video guides', availability: 'Available anytime', action: 'Watch Videos', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
];

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Help & Support</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Documentation, FAQs and contact support</p>
      </div>

      {/* Search */}
      <div className="glass-card p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent)/0.05)] to-[hsl(var(--info)/0.05)] pointer-events-none" />
        <div className="relative">
          <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-1">How can we help?</h2>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mb-4">Search our knowledge base or browse categories below</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search articles, guides and FAQs..."
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <button key={i} className={`glass-card p-5 text-center rounded-xl border hover:scale-105 transition-transform ${cat.color}`}>
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{cat.label}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{cat.articles} articles</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* FAQs */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors list-none">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{faq.q}</p>
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] flex-shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Support Channels */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Contact Support</h2>
          {supportOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div key={i} className={`glass-card p-4 flex items-center gap-4 rounded-xl border ${opt.color} hover:scale-[1.01] transition-transform cursor-pointer animate-fade-in`} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${opt.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{opt.label}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{opt.description}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{opt.availability}</p>
                </div>
                <button className="text-xs font-medium text-[hsl(var(--accent))] hover:underline flex items-center gap-1 flex-shrink-0">
                  {opt.action}<ExternalLink className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Quick Links */}
          <div className="glass-card p-5">
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">Quick Links</p>
            <div className="space-y-2">
              {[
                'Platform Changelog & Updates',
                'API Documentation',
                'Data Privacy Policy',
                'Terms of Service',
                'System Status Page',
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center justify-between py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] transition-colors">
                  {link}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
