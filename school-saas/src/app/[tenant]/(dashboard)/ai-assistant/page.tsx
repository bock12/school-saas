'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Brain, Zap, Send, Sparkles, TrendingUp, FileText, Users, BarChart3, MessageSquare, Star, Clock,
  ShieldCheck, AlertTriangle, ArrowRight, ArrowUpRight, Search, CheckCircle2, RefreshCw, Bot
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  confidence?: string;
  time?: string;
  followUps?: string[];
}

export default function AIAssistantPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello Administrator! I am your AI Operations Copilot. I have secure, permission-aware access to your school data. How can I assist you with analysis, forecasting, or workflow automation today?",
      time: '12:00 PM',
      sources: ['Whole-school operational logs', 'Grades DB', 'Attendance Roster'],
      confidence: '100%'
    }
  ]);

  const kpis = [
    { label: 'Students At Risk', value: '4 Students', sub: 'Attendance < 75%', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Attendance Alerts', value: 'SS2 Science', sub: 'Dropping trends', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Fee Collection', value: '94.2% Est', sub: 'Payment trends projection', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Teacher Workload', value: 'Mr. Kamara', sub: '37 periods (High workload)', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Upcoming Deadlines', value: '3 Exams', sub: 'Starting tomorrow', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Curriculum Complete', value: '84.2%', sub: 'Syllabus coverage', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Exam Readiness', value: 'High', sub: '42/46 gradebooks validated', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Enrollment Forecast', value: '+9% next year', sub: '1,247 projected', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Budget Alerts', value: 'Normal', sub: 'Zero cash-flow variance', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'AI Recommendations', value: '12 Active', sub: 'Continuous improvement', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' }
  ];

  const subAgents = [
    { name: 'Academic Analyst', desc: 'Subject & class performance ratios', status: 'Active' },
    { name: 'Attendance Analyst', desc: 'Seasonal Latency & absence indicators', status: 'Active' },
    { name: 'Finance Analyst', desc: 'Fee forecasts & cash flow variances', status: 'Active' },
    { name: 'HR Assistant', desc: 'Workloads & PD hours trackers', status: 'Active' },
    { name: 'Timetable Optimizer', desc: 'Room schedules & slot conflicts', status: 'Active' }
  ];

  const suggestions = [
    { label: 'Show at-risk students', prompt: 'Show me students with attendance below 75%.' },
    { label: 'Check teacher workloads', prompt: 'Which teachers have workloads exceeding school averages?' },
    { label: 'Revenue projection', prompt: 'How much revenue is expected to be collected this term?' },
    { label: 'Exam schedule readiness', prompt: 'Which classes are performing poorly in Mathematics?' }
  ];

  const simulatedResponses: Record<string, ChatMessage> = {
    'Show me students with attendance below 75%.': {
      role: 'assistant',
      content: "Based on attendance rosters for the current term, I have flagged **4 students** falling below the 75% minimum threshold:\n\n1. **Kevin Asante** (Grade 10) — 68% attendance\n2. **Sandra Osei** (Grade 9) — 71% attendance\n3. **Brian Mensah** (Grade 12) — 72% attendance\n4. **Fatima Hassan** (Grade 8) — 74% attendance\n\n*All flagged students are at risk of failing promotion requirements.*",
      sources: ['Attendance database', 'Student enrollment register'],
      confidence: '99.4%',
      followUps: ['Why is SS2 Science dropping?', 'Draft warning letter to parents', 'Flag for counseling review']
    },
    'Which teachers have workloads exceeding school averages?': {
      role: 'assistant',
      content: "The average teaching load is **26 periods per week**. I have detected **1 teacher** exceeding this average by more than 30%:\n\n- **Mr. John Kamara** (Mathematics Department) — **37 periods per week**.\n\n*Recommendation*: Assign an additional math teacher to Grade 10 to balance the department workload.",
      sources: ['Staff timetable matrix', 'Workload allocations'],
      confidence: '100%',
      followUps: ['Recruit mathematics teacher', 'Show math performance logs', 'Rebalance Friday schedules']
    },
    'How much revenue is expected to be collected this term?': {
      role: 'assistant',
      content: "Current fee payments received stand at **$142,400** (84.6% of target). Based on payment behaviors and sibling group invoices, cash collections are forecasted to reach **94.2%** ($158,500) by the end of this term.\n\n*Warning*: 48 families are consistently late with payments.",
      sources: ['Accounts receivable invoices', 'Parent payment histories'],
      confidence: '92.5%',
      followUps: ['Send SMS reminders to late payers', 'Show cash-flow forecast chart', 'PTA installment models']
    },
    'Which classes are performing poorly in Mathematics?': {
      role: 'assistant',
      content: "I have analyzed math assessment papers across all grades. **SS2 Science** average has dropped by **12%** compared to last term, making it the lowest-performing math class.\n\n*Suggested action*: Introduce extra Mathematics tutoring classes for SS2 Science streams.",
      sources: ['Gradebook mark sheets', 'Continuous Assessment records'],
      confidence: '97.8%',
      followUps: ['Why? (Analyze SS2 science math)', 'Compare with last year averages', 'Show teachers responsible']
    },
    'Why? (Analyze SS2 science math)': {
      role: 'assistant',
      content: "SS2 Science has had **3 substitute teacher shifts** in the last month due to leave days. Additionally, homework submission compliance has dropped to **31%** (school average is 82%).",
      sources: ['Staff leave logs', 'LMS homework submission logs'],
      confidence: '95%',
      followUps: ['Show teachers responsible', 'Contact parents of absent students']
    },
    'Show teachers responsible': {
      role: 'assistant',
      content: "The Mathematics courses in SS2 Science are currently allocated to:\n\n- **Mr. John Kamara** (exceeding target workloads at 37 periods/week).",
      sources: ['Course allocations registry', 'Teacher timetable registry'],
      confidence: '100%',
      followUps: ['Rebalance math workload', 'Email HOD Science']
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const userQuery = textToSend || input;
    if (!userQuery.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: userQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate response delay
    setTimeout(() => {
      const responseTemplate = simulatedResponses[userQuery] || {
        role: 'assistant',
        content: `I've analyzed your query: "${userQuery}". As a permission-aware copilot, I am looking up the relevant tables. Currently, there are no flagged anomalies for this search. Let me know if you would like me to compile an executive report.`,
        sources: ['Whole-school operational database'],
        confidence: '85%'
      };
      const assistantMessage: ChatMessage = {
        ...responseTemplate,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <Brain className="w-8 h-8 text-[hsl(var(--accent))]" />
            AI Operations Copilot
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Intelligent school management executive assistant, predictive modeling engines, and permission-aware operational analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Specialist Agents: 5/5 Active
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`glass-card p-4 flex flex-col justify-between border hover:scale-[1.02] transition-all cursor-pointer ${kpi.bg}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider truncate block mb-2">{kpi.label}</span>
            <div className="space-y-0.5">
              <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">{kpi.value}</p>
              <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Daily summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <Bot className="w-5 h-5" /> Today's Operations Summary
          </h3>
          <ul className="text-xs text-[hsl(var(--text-secondary))] space-y-2 leading-relaxed">
            <li>• Attendance Rate: <strong className="text-[hsl(var(--text-primary))]">96.4%</strong> (12 students absent today)</li>
            <li>• Staff leave: <strong className="text-[hsl(var(--text-primary))]">5 teachers on leave</strong> (Mathematics, English slots covered)</li>
            <li>• Upcoming assessments: <strong className="text-[hsl(var(--text-primary))]">3 examinations begin tomorrow</strong> (Grade 10/11)</li>
            <li>• Payments logged: <strong className="text-[hsl(var(--text-primary))]">47 fee payments received</strong> ($4,820 total cash)</li>
            <li>• Capacity Alert: <strong className="text-rose-400 font-semibold">Classroom 12 is over capacity</strong> (Allocated: 34/30 capacity limits)</li>
          </ul>
        </div>

        <div className="glass-card p-5 space-y-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> AI Predictive Alerts
          </h3>
          <ul className="text-xs text-[hsl(var(--text-secondary))] space-y-2 leading-relaxed">
            <li>• <strong className="text-rose-400">Attendance drop</strong> flagged in SS2 Science streams</li>
            <li>• <strong className="text-rose-400">Mathematics department overloaded</strong> (Mr. Kamara at 37 periods/week)</li>
            <li>• <strong className="text-rose-400">18 students</strong> projected to fall below promotion requirements (marks checklist)</li>
            <li>• <strong className="text-rose-400">Fee collection</strong> trailing target trends by 4.2%</li>
          </ul>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar: Specialist sub-agents */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest">School Specialist Agents</h3>
          <div className="space-y-3">
            {subAgents.map(agent => (
              <div key={agent.name} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{agent.name}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 leading-snug">{agent.desc}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Secure Interactive Chat Interface */}
        <div className="lg:col-span-3 flex flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] overflow-hidden h-[600px] shadow-lg">
          {/* Chat Headers */}
          <div className="p-4 border-b border-[hsl(var(--border))] flex justify-between items-center bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[hsl(var(--accent))]" />
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Secured Operations Console</h3>
                <span className="text-[9px] text-[hsl(var(--text-tertiary))]">Principal permission credentials cleared</span>
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`space-y-1.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[85%] text-xs p-4 rounded-2xl leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white rounded-br-sm'
                    : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>

                {/* Follow Ups pills */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 justify-start">
                    {msg.followUps.map(f => (
                      <button
                        key={f}
                        onClick={() => handleSendMessage(f)}
                        className="px-3 py-1.5 rounded-full border border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.05)] text-[10px] font-semibold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all duration-300"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                {/* Explainability Tags */}
                {msg.role === 'assistant' && (msg.sources || msg.confidence) && (
                  <div className="flex items-center gap-3 text-[9px] text-[hsl(var(--text-tertiary))] pt-1 justify-start">
                    {msg.sources && (
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Data sources: {msg.sources.join(', ')}</span>
                    )}
                    {msg.confidence && (
                      <span>Confidence score: <strong className="text-[hsl(var(--text-secondary))]">{msg.confidence}</strong></span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Console input actions */}
          <div className="p-4 border-t border-[hsl(var(--border))] space-y-3 bg-[hsl(var(--bg-secondary))]">
            {/* Quick Prompts Suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map(sug => (
                <button
                  key={sug.label}
                  onClick={() => setInput(sug.prompt)}
                  className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] bg-[hsl(var(--bg-tertiary))] text-[10px] font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-all whitespace-nowrap flex-shrink-0"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Query school metrics (e.g. show unpaid invoices or math department workloads)..."
                className="flex-1 h-10 px-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white flex items-center justify-center hover:opacity-95 transition-all shadow-md flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
