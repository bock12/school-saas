'use client';

import { useState, useRef, useEffect } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import {
  Brain, Send, Sparkles, BookOpen, FileText, BarChart3, Lightbulb, Zap,
  Copy, Check, MessageSquare, Plus, RefreshCw, Layers, Award, UserCheck,
  CheckCircle2, X
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  category?: 'quiz' | 'plan' | 'remark' | 'general';
  actionable?: boolean;
};

const toolModes = [
  { id: 'chat', label: 'AI Teaching Chat', icon: Brain },
  { id: 'quiz', label: 'Quiz & Test Generator', icon: Award },
  { id: 'plan', label: 'Lesson Plan Generator', icon: BookOpen },
  { id: 'remark', label: 'Report Card Remarks', icon: FileText },
];

const suggestions = [
  { icon: Award, text: 'Generate 10 quiz questions on Quadratic Equations for SS2A' },
  { icon: BookOpen, text: 'Create a 45-min lesson plan on Trigonometric Ratios (SS3)' },
  { icon: FileText, text: 'Write 3 constructive term-end report comments for high and struggling students' },
  { icon: Lightbulb, text: 'Suggest engaging hands-on activities for teaching probability to Grade 10' },
  { icon: Zap, text: 'Draft a polite parent notice for student consecutive tardiness' },
];

const mockResponses: Record<string, string> = {
  default: `I'm your **AI Teaching Assistant**, designed to empower your daily classroom workflow:

• **Quiz & Test Generator** — Create multiple choice, theory questions & answer rubrics in seconds
• **Curriculum Lesson Planner** — Draft Blooms-aligned lesson objectives, timing, & homework
• **Report Card Remark Generator** — Compose constructive, individualized terminal remarks
• **Parent Communications** — Draft professional notices, praise letters, and meeting requests

Select a tool above or type a request below to get started!`,
};

export function AIAssistantTab({ teacher }: { teacher: TeacherData }) {
  const [activeTool, setActiveTool] = useState<'chat' | 'quiz' | 'plan' | 'remark'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: mockResponses.default, category: 'general' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('SS2A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generator form states
  const [quizTopic, setQuizTopic] = useState('Coordinate Geometry & Straight Lines');
  const [quizCount, setQuizCount] = useState('5');
  const [planTopic, setPlanTopic] = useState('Simultaneous Linear Equations');
  const [planGrade, setPlanGrade] = useState('SS2');
  const [remarkStudent, setRemarkStudent] = useState('Adewale Okonkwo');
  const [remarkGrade, setRemarkGrade] = useState('A (88%)');

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  async function sendMessage(text: string, category: 'quiz' | 'plan' | 'remark' | 'general' = 'general') {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text, category };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI generation response
    await new Promise((r) => setTimeout(r, 1000));

    let response = '';

    if (category === 'quiz' || text.toLowerCase().includes('quiz')) {
      response = `### 📝 Generated Quiz: ${quizTopic || 'Mathematics'} (${selectedClass})
**Total Marks: 20 Marks** • **Time: 25 Minutes**

#### Section A: Multiple Choice (1 Mark each)
1. What is the gradient of the line passing through $(2, 4)$ and $(6, 12)$?
   - A) $1$
   - B) $2$ *(Correct Answer)*
   - C) $3$
   - D) $4$

2. Which equation represents a line parallel to $y = 3x - 5$?
   - A) $y = -3x + 2$
   - B) $y = 3x + 7$ *(Correct Answer)*
   - C) $y = \frac{1}{3}x - 5$
   - D) $y = -\frac{1}{3}x + 1$

3. Find the midpoint of the segment joining $(-2, 6)$ and $(4, 10)$:
   - A) $(1, 8)$ *(Correct Answer)*
   - B) $(2, 16)$
   - C) $(3, 8)$
   - D) $(6, 4)$

#### Section B: Structured Theory (5 Marks each)
4. A straight line has equation $2y - 6x = 10$.
   - a) Express the equation in slope-intercept form ($y = mx + c$). *(2 Marks)*
   - b) Find the coordinates of the x-intercept and y-intercept. *(3 Marks)*

**Teacher Marking Key & Notes:**
• Full working required for Question 4. Award 1 mark for rearranging $2y = 6x + 10 \implies y = 3x + 5$.`;
    } else if (category === 'plan' || text.toLowerCase().includes('lesson plan')) {
      response = `### 📘 Lesson Plan: ${planTopic || 'Pure Mathematics'} (${selectedClass})
**Duration:** 45 Minutes • **Subject:** ${selectedSubject}

#### 🎯 Measurable Learning Objectives (Blooms Taxonomy):
By the end of the lesson, students will be able to:
1. Identify the coefficients and variables in simultaneous systems.
2. Select and execute the **Elimination Method** to find exact coordinates $(x, y)$.
3. Verify calculated solutions by substituting back into original equations.

#### ⏱️ Lesson Timeline:
- **00 – 05 mins (Starter):** Quick review on solving single-variable linear equations $3x + 4 = 19$.
- **05 – 20 mins (Direct Teaching):** Teacher demonstrates the elimination strategy with worked example $2x + 3y = 12$ and $4x - 3y = 6$.
- **20 – 35 mins (Guided Practice):** Students work in pairs on problem sheet (4 paired questions). Teacher circulates.
- **35 – 45 mins (Exit Ticket & Homework):** Individual 3-min exit problem to assess mastery. Assign Textbook Chapter 3 Pg 38 Q1–8.`;
    } else if (category === 'remark' || text.toLowerCase().includes('report')) {
      response = `### 🎓 Generated Terminal Report Comments for ${remarkStudent}:

**Option 1 (Academic Excellence & Leadership):**
> "${remarkStudent} has demonstrated exceptional diligence and mastery in ${selectedSubject} this term, securing a well-deserved ${remarkGrade}. Their analytical thinking and constructive participation in classroom discussions set an admirable example for peers. Highly recommended to pursue advanced mathematics electives next session."

**Option 2 (Balanced & Forward-Looking):**
> "${remarkStudent} shows strong competence and conceptual grasp in ${selectedSubject}. With continued focus on precision in multistep proofs and time management during exam settings, they are well-positioned for top-tier distinctions in national examinations."

**Option 3 (Encouraging Growth Mindset):**
> "A commendable performance by ${remarkStudent}. They have shown steady improvement throughout the term and consistently submitted thorough homework assignments. Keep up the high level of curiosity and effort!"`;
    } else {
      response = `Here is my recommendation for **${teacher.name}** regarding your request:

Based on the curriculum for **${selectedClass} ${selectedSubject}**, here is a structured recommendation:

• **Key Focus Area:** Ensure real-world relevance by relating mathematical concepts to everyday commerce, technology, and science.
• **Differentiation:** Provide scaffolded challenge questions for gifted learners while offering peer-assisted worksheets for students needing additional reinforcement.
• **Assessment:** Use short formative check-ins at the end of each topic before introducing new theoretical units.

Would you like me to generate specific quiz questions, lesson outlines, or worksheets for this topic?`;
    }

    setMessages((prev) => [...prev, { role: 'assistant', text: response, category, actionable: true }]);
    setLoading(false);
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
              AI Teaching Assistant &amp; Generator
            </h1>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Intelligent lesson plan drafting, instant quiz question generation, and report card comment writing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] cursor-pointer"
          >
            <option value="SS2A">Class SS2A</option>
            <option value="SS2B">Class SS2B</option>
            <option value="SS3A">Class SS3A</option>
            <option value="JS3A">Class JS3A</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] cursor-pointer"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Further Mathematics">Further Mathematics</option>
            <option value="Calculus">Calculus</option>
          </select>
        </div>
      </div>

      {/* Tool Navigation Switcher */}
      <div className="flex items-center gap-2 p-1 bg-[hsl(var(--bg-secondary))] rounded-2xl border border-[hsl(var(--border))] overflow-x-auto scrollbar-none">
        {toolModes.map(t => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTool(t.id as any)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Generator Workbenches */}
      {activeTool === 'quiz' && (
        <div className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Instant Quiz &amp; Test Question Generator
            </h3>
            <span className="text-xs text-[hsl(var(--text-tertiary))]">{selectedClass} • {selectedSubject}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Curriculum Topic</label>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g. Quadratic Equations & Factoring"
                className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Number of Questions</label>
              <select
                value={quizCount}
                onChange={(e) => setQuizCount(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option value="5">5 Questions (Quick Quiz)</option>
                <option value="10">10 Questions (Standard Test)</option>
                <option value="20">20 Questions (Mock Exam)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => sendMessage(`Generate a ${quizCount}-question quiz on ${quizTopic} with answer marking key for ${selectedClass}`, 'quiz')}
            className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Quiz Questions</span>
          </button>
        </div>
      )}

      {activeTool === 'plan' && (
        <div className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Lesson Plan Outline Generator
            </h3>
            <span className="text-xs text-[hsl(var(--text-tertiary))]">{selectedClass} • {selectedSubject}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Lesson Topic</label>
              <input
                type="text"
                value={planTopic}
                onChange={(e) => setPlanTopic(e.target.value)}
                placeholder="e.g. Straight Lines & Coordinate Geometry"
                className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Grade Level</label>
              <select
                value={planGrade}
                onChange={(e) => setPlanGrade(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option value="JS3">JS3 (Junior Secondary)</option>
                <option value="SS1">SS1 (Senior Secondary 1)</option>
                <option value="SS2">SS2 (Senior Secondary 2)</option>
                <option value="SS3">SS3 (WASSCE Prep)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => sendMessage(`Generate a 45-minute lesson plan for ${planTopic} for ${planGrade}`, 'plan')}
            className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Lesson Plan</span>
          </button>
        </div>
      )}

      {activeTool === 'remark' && (
        <div className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Report Card Remark Generator
            </h3>
            <span className="text-xs text-[hsl(var(--text-tertiary))]">Personalized Terminal Feedback</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Student Name</label>
              <input
                type="text"
                value={remarkStudent}
                onChange={(e) => setRemarkStudent(e.target.value)}
                placeholder="e.g. Adewale Okonkwo"
                className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Term Performance / Grade</label>
              <select
                value={remarkGrade}
                onChange={(e) => setRemarkGrade(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option value="A1 (85%+ - Outstanding)">A1 (85%+ - Outstanding)</option>
                <option value="B2/B3 (70-84% - Good)">B2/B3 (70-84% - Good)</option>
                <option value="C4-C6 (50-69% - Credit)">C4-C6 (50-69% - Credit)</option>
                <option value="D7/E8 (40-49% - Needs Improvement)">D7/E8 (40-49% - Needs Improvement)</option>
                <option value="F9 (Below 40% - Critical Support)">F9 (Below 40% - Critical Support)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => sendMessage(`Write 3 constructive report card comments for student ${remarkStudent} with grade ${remarkGrade}`, 'remark')}
            className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Comments</span>
          </button>
        </div>
      )}

      {/* Suggested Prompts Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
          Quick AI Prompts
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {suggestions.map((s, idx) => {
            const Icon = s.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(s.text)}
                className="p-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                <span>{s.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Conversational Chat Log */}
      <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] p-4 sm:p-6 space-y-4 min-h-[350px] max-h-[600px] overflow-y-auto shadow-inner">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                  : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] shadow-sm'
              }`}
            >
              <div className="prose prose-invert max-w-none text-xs whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.role === 'assistant' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(msg.text, i)}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copy response to clipboard"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
              AI Assistant is thinking &amp; drafting your content...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Interactive Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="relative"
      >
        <input
          type="text"
          placeholder="Ask AI for lesson ideas, quiz questions, or report card remarks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-14 pl-5 pr-28 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] text-sm text-[hsl(var(--text-primary))] focus:outline-none shadow-lg transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
