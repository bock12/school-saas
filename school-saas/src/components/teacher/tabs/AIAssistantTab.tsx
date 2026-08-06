'use client';

import { useState, useRef, useEffect } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Brain, Send, Sparkles, BookOpen, FileText, BarChart3, Lightbulb, Zap } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; text: string };

const suggestions = [
  { icon: FileText, text: 'Create a lesson plan for quadratic equations (SS2, 45 mins)' },
  { icon: BookOpen, text: 'Generate 10 quiz questions on trigonometry for SS3A' },
  { icon: BarChart3, text: 'Suggest activities to improve poor attendance in SS2B' },
  { icon: Lightbulb, text: 'What are effective strategies for teaching algebraic fractions?' },
  { icon: Zap, text: 'Draft a parent notification for low academic performance' },
  { icon: Brain, text: 'Create a differentiated learning plan for mixed-ability class' },
];

const mockResponses: Record<string, string> = {
  default: `I'm your AI Teaching Assistant, powered by advanced AI. I can help you with:

• **Lesson Planning** — Generate structured lesson plans aligned to curriculum
• **Quiz & Assessment Creation** — Create tests, MCQs, and rubrics
• **Student Communication** — Draft letters, notifications, and parent messages
• **Teaching Strategies** — Suggest methods for diverse learning needs
• **Classroom Management** — Tips for engagement and discipline
• **Report Writing** — Generate term-end comments and progress reports

What would you like help with today?`,
};

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <p key={i} className="pl-2">• {line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
        }
        if (line.startsWith('# ')) return <p key={i} className="font-black text-sm">{line.slice(2)}</p>;
        if (line.startsWith('## ')) return <p key={i} className="font-black text-xs">{line.slice(3)}</p>;
        return <p key={i}>{line.replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
      })}
    </div>
  );
}

export function AIAssistantTab({ teacher }: { teacher: TeacherData }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: mockResponses.default },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('SS2A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const response = `Here's my response for **${teacher.name}** regarding "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}":

Based on the context of ${selectedClass} ${selectedSubject}, here's a structured approach:

• **Objective**: Clearly define what students should achieve by the end
• **Introduction** (5 mins): Activate prior knowledge with a quick review question
• **Main Activity** (25 mins): Step-by-step guided instruction with worked examples
• **Practice** (10 mins): Students attempt similar problems independently
• **Wrap-up** (5 mins): Exit ticket to assess understanding

**Key Teaching Points:**
• Use visual aids and real-world examples relevant to students' experience
• Differentiate: provide extension tasks for stronger students
• Provide scaffolded worksheets for students needing support

**Recommended Resources:**
• Khan Academy video: linked to your materials section
• Textbook exercises: pg 45–52

Would you like me to expand on any section or create the actual worksheet?`;

    setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">AI Teaching Assistant</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Your intelligent teaching partner — lesson plans, quizzes, strategies, reports</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none"
          >
            {['SS1A', 'SS2A', 'SS2B', 'SS3A', 'JS3A'].map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none"
          >
            {['Mathematics', 'Further Mathematics'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-xs font-bold text-[hsl(var(--text-tertiary))] mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Quick Prompts</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {suggestions.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={i}
                onClick={() => sendMessage(s.text)}
                className="flex items-start gap-2 p-3 rounded-xl text-left bg-[hsl(var(--bg-tertiary)/0.5)] hover:bg-[hsl(var(--accent)/0.06)] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] transition-all group text-xs"
              >
                <Icon className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                <span className="text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] transition-colors leading-snug">{s.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ height: '55vh', minHeight: 380 }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-tr-none'
                    : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] rounded-tl-none'
                }`}
                style={msg.role === 'user' ? { background: `linear-gradient(135deg, ${teacher.primaryColor}, ${teacher.primaryColor}bb)` } : {}}
              >
                {msg.role === 'assistant' ? <MarkdownText text={msg.text} /> : <p>{msg.text}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex gap-1 px-4 py-3 bg-[hsl(var(--bg-tertiary))] rounded-2xl rounded-tl-none">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[hsl(var(--border))] p-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={`Ask about ${selectedClass} ${selectedSubject}... (Enter to send)`}
            rows={2}
            className="flex-1 px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl text-white flex-shrink-0 disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
