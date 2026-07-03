import { Brain, Zap, Send, Sparkles, TrendingUp, FileText, Users, BarChart3, MessageSquare, Star, Clock } from 'lucide-react';

const suggestions = [
  { icon: TrendingUp, label: 'Attendance Trends', prompt: 'Analyze attendance trends for the past 30 days and identify at-risk students', color: 'text-blue-400 bg-blue-500/10' },
  { icon: Users, label: 'At-Risk Students', prompt: 'List students with attendance below 75% this term', color: 'text-red-400 bg-red-500/10' },
  { icon: FileText, label: 'Generate Report', prompt: 'Generate a monthly academic performance summary for Grade 10', color: 'text-emerald-400 bg-emerald-500/10' },
  { icon: BarChart3, label: 'Fee Analytics', prompt: 'Show me fee collection trends and flag defaulters this term', color: 'text-amber-400 bg-amber-500/10' },
  { icon: MessageSquare, label: 'Draft Announcement', prompt: 'Draft a professional announcement for parents about the upcoming Sports Day', color: 'text-purple-400 bg-purple-500/10' },
  { icon: Sparkles, label: 'School Insights', prompt: 'Give me an executive summary of the school\'s performance this term', color: 'text-teal-400 bg-teal-500/10' },
];

const recentChats = [
  { title: 'Fee defaulter report for June', time: '2 hrs ago' },
  { title: 'Draft parent newsletter for Sports Day', time: 'Yesterday' },
  { title: 'Grade 10 attendance analysis', time: '2 days ago' },
  { title: 'Staff leave summary Q2', time: '3 days ago' },
];

const exampleConversation = [
  { role: 'user', content: 'Which students have attendance below 75% this term?' },
  { role: 'assistant', content: 'Based on the current term data, I\'ve identified **4 students** with attendance below 75%:\n\n1. **Kevin Asante** (Grade 10) — 68% attendance\n2. **Sandra Osei** (Grade 9) — 71% attendance\n3. **Brian Mensah** (Grade 12) — 72% attendance\n4. **Fatima Hassan** (Grade 8) — 74% attendance\n\nWould you like me to:\n- **Draft a letter** to their parents?\n- **Generate a detailed report** with absence patterns?\n- **Flag them** for counselor follow-up?' },
];

export default function AIAssistantPage() {
  return (
    <div className="max-w-[1600px] h-[calc(100vh-8rem)] flex flex-col gap-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Brain className="w-6 h-6 text-[hsl(var(--accent))]" />
            AI Administration Assistant
            <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-[10px] font-bold uppercase tracking-wider">Beta</span>
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Powered by Google Gemini — your intelligent school management copilot
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
          {/* New Chat */}
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--info))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Zap className="w-4 h-4" />New Chat
          </button>

          {/* Recent Chats */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Recent Chats</p>
            <div className="space-y-1">
              {recentChats.map((chat, i) => (
                <button key={i} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors group">
                  <p className="text-xs font-medium text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] leading-snug line-clamp-2">{chat.title}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{chat.time}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Capabilities</p>
            <div className="space-y-2">
              {[
                'Attendance & enrollment analytics',
                'Fee defaulter identification',
                'Automated report generation',
                'Parent communication drafting',
                'Exam performance analysis',
                'At-risk student detection',
                'Staff leave summaries',
              ].map((cap, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Star className="w-3 h-3 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{cap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Welcome */}
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-[hsl(var(--accent))]" />
              </div>
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-1">How can I help you today?</h2>
              <p className="text-sm text-[hsl(var(--text-tertiary))] max-w-md">
                Ask me about student performance, generate reports, draft communications, or get insights from your school data.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--bg-tertiary))] transition-all text-left group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] mb-0.5">{s.label}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] leading-relaxed line-clamp-2">{s.prompt}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Example Conversation */}
            <div className="border-t border-[hsl(var(--border))] pt-4 space-y-4">
              <p className="text-[10px] text-center text-[hsl(var(--text-tertiary))] uppercase tracking-widest">Example conversation</p>
              {exampleConversation.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--info))] text-white rounded-br-sm'
                      : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] rounded-bl-sm border border-[hsl(var(--border))]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[hsl(var(--border))]">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  rows={1}
                  placeholder="Ask anything about your school data..."
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors resize-none"
                />
              </div>
              <button className="w-11 h-11 flex-shrink-0 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--info))] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] text-center mt-2">
              AI responses are generated based on your school data. Always verify before taking action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
