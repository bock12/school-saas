'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, School, Users, CreditCard, BarChart3, ArrowRight, ChevronRight, ChevronLeft,
  Check, Zap, Lock, Globe, X, LogIn, Menu, Building2, Search, GraduationCap,
  MapPin, Star, Phone, Mail, Sparkles, BookOpen, Trophy, Heart, Calendar,
  CheckCircle2, Clock, Layers, Award, HelpCircle, Send, ExternalLink, Activity,
  Sliders, UserCheck, CheckCheck, RefreshCw, Filter, ChevronDown, Database,
  Smartphone, FileText, CheckSquare, MessageSquare, PieChart, ShieldAlert,
  Server, Cpu, WifiOff, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
  city: string | null;
  country: string | null;
  contact_email: string | null;
  contact_phone?: string | null;
  address?: string | null;
  region?: string | null;
  school_type?: string | null;
  primary_color?: string | null;
};

// Curated photography collection for school image carousels
const SCHOOL_GALLERIES = [
  [
    { src: '/hero/classroom.jpg', caption: 'Interactive STEM Classroom' },
    { src: '/hero/campus.jpg', caption: 'Main Academic Campus' },
    { src: '/hero/science.jpg', caption: 'Science & Biology Laboratory' },
  ],
  [
    { src: '/hero/campus.jpg', caption: 'Central Quad & Assembly Grounds' },
    { src: '/template/hero-library.jpg', caption: 'Digital Library & Research Suite' },
    { src: '/hero/classroom.jpg', caption: 'Senior Secondary Seminar Rooms' },
  ],
  [
    { src: '/hero/science.jpg', caption: 'Advanced Chemistry Lab' },
    { src: '/template/hero-sports.jpg', caption: 'Athletics & Sports Complex' },
    { src: '/hero/campus.jpg', caption: 'College Gardens & Walkway' },
  ],
];

// Interactive School Card Component with Auto-Sliding Image Carousel
function SchoolCard({
  tenant,
  index,
  tenantUrl,
}: {
  tenant: Tenant;
  index: number;
  tenantUrl: string;
}) {
  const isOrg = tenant.type === 'organization';
  const accent = tenant.primary_color || '#6366f1';
  
  const gallery = SCHOOL_GALLERIES[index % SCHOOL_GALLERIES.length];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide image timer (staggered slightly per card for organic feel)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gallery.length);
    }, 3200 + (index % 3) * 600);

    return () => clearInterval(timer);
  }, [gallery.length, index]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % gallery.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const description = isOrg
    ? `${tenant.name} is an educational governing body managing member school campuses, academic quality control, and shared institutional services.`
    : `${tenant.name} is a premier educational institution committed to academic excellence, 6-3-3-4 national curriculum standards, and holistic student development.`;

  const displayAddress = tenant.address || (tenant.city ? `${tenant.city}, Sierra Leone` : 'Main Campus Road, Freetown');
  const displayEmail = tenant.contact_email || `admissions@${tenant.slug}.edu.sl`;
  const displayPhone = tenant.contact_phone || '+232 76 000 000';

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.45)] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group bg-[hsl(var(--bg-secondary)/0.6)] h-full">
      
      {/* ── TOP SECTION: Auto-Sliding Images Carousel ─────────────── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 select-none">
        
        {gallery.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === currentSlide
                ? 'opacity-100 scale-100 translate-x-0'
                : i < currentSlide
                ? 'opacity-0 scale-105 -translate-x-3 pointer-events-none'
                : 'opacity-0 scale-105 translate-x-3 pointer-events-none'
            }`}
          >
            <img
              src={img.src}
              alt={img.caption}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/35" />
          </div>
        ))}

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
            isOrg
              ? 'bg-purple-900/80 text-purple-200 border border-purple-400/30'
              : 'bg-blue-900/80 text-blue-200 border border-blue-400/30'
          }`}>
            {isOrg ? <Building2 className="w-3 h-3 text-purple-300" /> : <School className="w-3 h-3 text-blue-300" />}
            {isOrg ? 'Group Board' : 'Campus / School'}
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Portal
          </span>
        </div>

        {/* Manual Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/20"
          aria-label="Next image"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Bottom Caption & Pagination Dots */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span className="text-[11px] font-bold text-white/90 drop-shadow truncate">
            {gallery[currentSlide].caption}
          </span>
          <div className="flex gap-1.5">
            {gallery.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(dotIdx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  dotIdx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ── CARD BODY: Detail & Contact Info ──────────────────────── */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-3.5">
          <div className="flex items-start gap-3.5">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-12 h-12 rounded-2xl object-cover border border-[hsl(var(--border))] flex-shrink-0 shadow-sm"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base flex-shrink-0 shadow-md"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
              >
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] transition-colors leading-tight">
                {tenant.name}
              </h3>
              <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] block mt-0.5 truncate">
                {tenant.slug}.localhost:3000
              </span>
            </div>
          </div>

          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-2">
            {description}
          </p>

          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-2 text-xs text-[hsl(var(--text-secondary))]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0 mt-0.5" />
              <span className="truncate">{displayAddress}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0" />
              <a href={`mailto:${displayEmail}`} className="truncate hover:text-[hsl(var(--accent))] transition-colors">
                {displayEmail}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0" />
              <a href={`tel:${displayPhone}`} className="truncate hover:text-[hsl(var(--accent))] transition-colors font-medium">
                {displayPhone}
              </a>
            </div>
          </div>
        </div>

        {/* ── CARD FOOTER: "Visit School" Action Button ────────────── */}
        <div className="pt-2">
          <a
            href={tenantUrl}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-xs shadow-lg shadow-[hsl(var(--accent)/0.25)] hover:opacity-95 hover:shadow-xl hover:shadow-[hsl(var(--accent)/0.35)] transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
          >
            <span>Visit School</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

    </div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'school' | 'organization'>('all');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<'all' | 'western' | 'eastern' | 'southern' | 'northern'>('all');
  const [cardSlideIndex, setCardSlideIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUrl, setAdminUrl] = useState('/super-admin');
  
  // Interactive persona state
  const [activePersona, setActivePersona] = useState<'student' | 'parent' | 'teacher' | 'admin' | 'board'>('teacher');
  
  // Pricing state
  const [billingPeriod, setBillingPeriod] = useState<'term' | 'annual'>('term');
  const [pricingCurrency, setPricingCurrency] = useState<'NLe' | 'USD'>('NLe');

  // Capability tabs state
  const [activeCapabilityTab, setActiveCapabilityTab] = useState<'academic' | 'students' | 'faculty' | 'finance'>('academic');

  // Demo form state
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoSuccessData, setDemoSuccessData] = useState<any>(null);
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    phone: '',
    institutionName: '',
    type: 'school',
    region: 'Western Area (Freetown)',
    estimatedStudents: '',
    message: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const cleanHost = hostname.replace(/^(www\.|admin\.)/, '');
      const port = window.location.port ? `:${window.location.port}` : '';
      setAdminUrl(`${window.location.protocol}//admin.${cleanHost}${port}`);
    }
  }, []);

  // Handle responsive items per page for card slider
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setItemsPerPage(1);
        } else if (window.innerWidth < 1024) {
          setItemsPerPage(2);
        } else {
          setItemsPerPage(3);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all publicly visible tenants via API
  useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await fetch('/api/public/tenants');
        if (res.ok) {
          const data = await res.json();
          setTenants(data.tenants || []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchTenants();
  }, []);

  // Filter tenants
  const filtered = tenants.filter(t => {
    const matchesType =
      selectedTypeFilter === 'all' ||
      (selectedTypeFilter === 'school' && t.type !== 'organization') ||
      (selectedTypeFilter === 'organization' && t.type === 'organization');

    const locationStr = `${t.city || ''} ${t.region || ''} ${t.address || ''}`.toLowerCase();
    const matchesRegion =
      selectedRegionFilter === 'all' ||
      (selectedRegionFilter === 'western' && (locationStr.includes('freetown') || locationStr.includes('western'))) ||
      (selectedRegionFilter === 'eastern' && (locationStr.includes('kenema') || locationStr.includes('koidu') || locationStr.includes('eastern'))) ||
      (selectedRegionFilter === 'southern' && (locationStr.includes('bo') || locationStr.includes('moyamba') || locationStr.includes('southern'))) ||
      (selectedRegionFilter === 'northern' && (locationStr.includes('makeni') || locationStr.includes('port loko') || locationStr.includes('northern')));

    return matchesType && matchesRegion;
  });

  useEffect(() => {
    setCardSlideIndex(0);
  }, [selectedTypeFilter, selectedRegionFilter]);

  const maxSlideIndex = Math.max(0, filtered.length - itemsPerPage);
  const canSlidePrev = cardSlideIndex > 0;
  const canSlideNext = cardSlideIndex < maxSlideIndex;

  const handlePrevCards = () => {
    setCardSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextCards = () => {
    setCardSlideIndex((prev) => Math.min(maxSlideIndex, prev + 1));
  };

  const getTenantUrl = (slug: string) => {
    if (typeof window === 'undefined') return `/${slug}`;
    const hostname = window.location.hostname;
    const cleanHost = hostname.replace(/^(www\.|admin\.)/, '');
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${slug}.${cleanHost}${port}`;
  };

  const schoolCount = tenants.filter(t => t.type !== 'organization').length;
  const orgCount = tenants.filter(t => t.type === 'organization').length;

  const stats = [
    { value: schoolCount > 0 ? `${schoolCount}` : '50+', label: 'Schools Onboarded', desc: 'Active standalone campuses' },
    { value: orgCount > 0 ? `${orgCount}` : '12+', label: 'Educational Groups', desc: 'Diocesan & multi-school networks' },
    { value: '99.9%', label: 'Uptime SLA', desc: 'High-availability infrastructure' },
    { value: '100%', label: 'Data Isolation', desc: 'PostgreSQL Row-Level Security' },
  ];

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDemo(true);
    setDemoError(null);

    try {
      const res = await fetch('/api/public/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: demoForm.name,
          email: demoForm.email,
          phone: demoForm.phone,
          institutionName: demoForm.institutionName,
          institutionType: demoForm.type,
          region: demoForm.region,
          estimatedStudents: demoForm.estimatedStudents,
          requirements: demoForm.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit demonstration request.');
      }

      setDemoSubmitted(true);
      setDemoSuccessData(data.request);
    } catch (err: any) {
      setDemoError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmittingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans antialiased overflow-x-hidden selection:bg-[hsl(var(--accent)/0.25)] selection:text-[hsl(var(--accent))]">

      {/* ── 1. Top Academic Utility Bar ─────────────────────────────── */}
      <div className="bg-[hsl(var(--bg-secondary))] border-b border-[hsl(var(--border))] py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-[hsl(var(--text-secondary))] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-[hsl(var(--text-primary))]">{APP_NAME} Enterprise</span>
            <span className="hidden sm:inline">&middot; Supporting Sierra Leone 6-3-3-4 &amp; International Academies</span>
          </div>
          <div className="flex items-center gap-4 text-[hsl(var(--text-secondary))] font-semibold">
            <a href="#institutions" className="hover:text-[hsl(var(--accent))] transition-colors">School Directory</a>
            <span className="text-[hsl(var(--border))]">|</span>
            <a href={adminUrl} className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Super Admin
            </a>
            <span className="text-[hsl(var(--border))]">|</span>
            <a href="#contact" className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" /> +232 76 000 000
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. Site Header & Navbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.92)] backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3.5 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent)/0.3)] text-white font-black text-2xl group-hover:scale-105 transition-all">
              N
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[hsl(var(--text-primary))] block leading-none">{APP_NAME}</span>
              <span className="text-[10px] font-extrabold text-[hsl(var(--accent))] uppercase tracking-widest mt-1 block">Unified School OS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-[hsl(var(--text-secondary))]">
            <a href="#institutions" className="hover:text-[hsl(var(--text-primary))] transition-colors">Institutions</a>
            <a href="#stakeholders" className="hover:text-[hsl(var(--text-primary))] transition-colors">Stakeholders</a>
            <a href="#curriculum" className="hover:text-[hsl(var(--text-primary))] transition-colors">WAEC &amp; AI</a>
            <a href="#security" className="hover:text-[hsl(var(--text-primary))] transition-colors">Security</a>
            <a href="#pricing" className="hover:text-[hsl(var(--text-primary))] transition-colors">Pricing</a>
            <a href="#impact" className="hover:text-[hsl(var(--text-primary))] transition-colors">Impact</a>
            <a href="#contact" className="hover:text-[hsl(var(--text-primary))] transition-colors">Contact</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-xs shadow-md shadow-[hsl(var(--accent)/0.25)] hover:opacity-95 hover:shadow-lg hover:shadow-[hsl(var(--accent)/0.35)] transition-all"
            >
              <Zap className="w-4 h-4" /> Register School
            </Link>

            <a
              href="#institutions"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] font-bold text-xs hover:bg-[hsl(var(--bg-tertiary))] transition-all"
            >
              <School className="w-4 h-4 text-[hsl(var(--accent))]" /> Portals Directory
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] px-5 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-3 duration-200">
            <nav className="flex flex-col gap-3 text-sm font-bold text-[hsl(var(--text-secondary))]">
              <a onClick={() => setMobileMenuOpen(false)} href="#institutions" className="hover:text-[hsl(var(--text-primary))] py-1.5 flex items-center justify-between">
                <span>Registered Institutions</span> <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#stakeholders" className="hover:text-[hsl(var(--text-primary))] py-1.5 flex items-center justify-between">
                <span>Role Experiences</span> <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#curriculum" className="hover:text-[hsl(var(--text-primary))] py-1.5 flex items-center justify-between">
                <span>WAEC &amp; AI Engine</span> <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#security" className="hover:text-[hsl(var(--text-primary))] py-1.5 flex items-center justify-between">
                <span>Security &amp; Privacy</span> <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#pricing" className="hover:text-[hsl(var(--text-primary))] py-1.5 flex items-center justify-between">
                <span>Subscription Plans</span> <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#impact" className="hover:text-[hsl(var(--text-primary))] py-1.5 flex items-center justify-between">
                <span>Impact &amp; Reviews</span> <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#contact" className="hover:text-[hsl(var(--text-primary))] py-1.5 flex items-center justify-between">
                <span>Book a Demo</span> <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </a>
            </nav>
            
            <div className="pt-4 border-t border-[hsl(var(--border))] flex flex-col gap-2.5">
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/register"
                className="w-full text-center py-3 rounded-xl bg-[hsl(var(--accent))] text-white font-black text-xs shadow-md"
              >
                Register Your School Free
              </Link>
              <a
                onClick={() => setMobileMenuOpen(false)}
                href="#institutions"
                className="w-full text-center py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-bold text-xs hover:bg-[hsl(var(--bg-tertiary))]"
              >
                Browse Schools Directory
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── 3. High-Impact Hero Section ───────────────────────────── */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
          
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[hsl(var(--accent)/0.15)] to-violet-500/10 blur-[130px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-6 space-y-7">
                
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.25)] text-[hsl(var(--accent))] text-xs font-black shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                  <span>Next-Generation Academic Administration</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[hsl(var(--text-primary))] leading-[1.06]">
                  An education platform that fits <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--accent))] via-indigo-400 to-violet-400">every institution</span>
                </h1>

                <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] leading-relaxed max-w-xl">
                  {APP_NAME} is the unified multi-tenant operating system for schools, colleges, and educational boards. Deliver isolated student portals, 6-3-3-4 curriculum trees, AI lesson plans, faculty matrices, and financial audits from one resilient cloud platform.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-sm shadow-xl shadow-[hsl(var(--accent)/0.25)] hover:opacity-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5"
                  >
                    <Zap className="w-4 h-4" /> Register Your School Free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#institutions"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] font-black text-sm hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--accent)/0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <School className="w-4 h-4" /> Browse Portals
                  </a>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 text-xs text-[hsl(var(--text-primary))]">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-black text-amber-400">AI Curriculum Engine 2026/2027 Active:</strong> Real-time lesson plans constrained to approved school syllabuses with zero hallucinations.{' '}
                    <a href="#curriculum" className="text-[hsl(var(--accent))] font-bold hover:underline inline-flex items-center gap-0.5">
                      Explore WAEC Suite &rarr;
                    </a>
                  </div>
                </div>

              </div>

              {/* Right Column: 3-Image Photographic Mosaic */}
              <div className="lg:col-span-6 relative">
                
                <div className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/10 shadow-2xl bg-[hsl(var(--bg-secondary)/0.9)] backdrop-blur-xl">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[hsl(var(--text-primary))]">Live Attendance Sync</p>
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 98.4% Present Today
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3.5 relative z-10">
                  <div className="col-span-7">
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 group relative">
                      <img
                        src="/hero/classroom.jpg"
                        alt="High school students engaged in collaborative classroom learning"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-xs font-bold">Interactive STEM &amp; Digital Classrooms</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-5 space-y-3.5">
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border-2 border-white/10 group relative">
                      <img
                        src="/hero/campus.jpg"
                        alt="Secondary school students walking on campus grounds"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-white text-[11px] font-bold">Modern Campus Life</span>
                      </div>
                    </div>

                    <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border-2 border-white/10 group relative">
                      <img
                        src="/hero/science.jpg"
                        alt="Students conducting experiments in science laboratory"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-white text-[11px] font-bold">Science &amp; Lab Practical Work</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/10 shadow-2xl bg-[hsl(var(--bg-secondary)/0.9)] backdrop-blur-xl">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[hsl(var(--text-primary))]">MBSSE &amp; WAEC Aligned</p>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))] font-medium">
                      BECE / WASSCE Gradebooks
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── 4. Key Facts & Live Statistics Band ───────────────────── */}
        <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[hsl(var(--accent))] tracking-tight">{s.value}</p>
                  <p className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider">{s.label}</p>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Registered Institutions & Portals (3-Card Slider & Filter Dropdowns) ── */}
        <section id="institutions" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                  <School className="w-3.5 h-3.5" /> Institutional Network Directory
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                  Registered Institutions &amp; Portals
                </h2>
                <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                  Browse accredited schools, colleges, and educational groups. Slide through campus galleries, explore curriculum details, and enter your institution's portal.
                </p>
              </div>

              {/* Filter Dropdowns + Slide Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-2.5 bg-[hsl(var(--bg-secondary))] p-2 rounded-2xl border border-[hsl(var(--border))] shadow-md">
                  
                  <div className="relative">
                    <select
                      value={selectedTypeFilter}
                      onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
                      className="appearance-none h-10 pl-3.5 pr-8 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
                    >
                      <option value="all">All Types ({tenants.length})</option>
                      <option value="school">🏫 Standalone Schools ({schoolCount})</option>
                      <option value="organization">🏢 Educational Groups ({orgCount})</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedRegionFilter}
                      onChange={(e) => setSelectedRegionFilter(e.target.value as any)}
                      className="appearance-none h-10 pl-3.5 pr-8 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
                    >
                      <option value="all">All Jurisdictions</option>
                      <option value="western">📍 Western Area (Freetown)</option>
                      <option value="eastern">📍 Eastern Province</option>
                      <option value="southern">📍 Southern Province</option>
                      <option value="northern">📍 Northern Province</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {(selectedTypeFilter !== 'all' || selectedRegionFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedTypeFilter('all');
                        setSelectedRegionFilter('all');
                      }}
                      className="h-10 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Reset all filters"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>

                {filtered.length > itemsPerPage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevCards}
                      disabled={!canSlidePrev}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                        canSlidePrev
                          ? 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--accent))] hover:text-white hover:border-[hsl(var(--accent))] shadow-md'
                          : 'bg-[hsl(var(--bg-secondary)/0.5)] border-[hsl(var(--border)/0.4)] text-[hsl(var(--text-tertiary))] opacity-40 cursor-not-allowed'
                      }`}
                      aria-label="Slide previous schools"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleNextCards}
                      disabled={!canSlideNext}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                        canSlideNext
                          ? 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--accent))] hover:text-white hover:border-[hsl(var(--accent))] shadow-md'
                          : 'bg-[hsl(var(--bg-secondary)/0.5)] border-[hsl(var(--border)/0.4)] text-[hsl(var(--text-tertiary))] opacity-40 cursor-not-allowed'
                      }`}
                      aria-label="Slide next schools"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* 3-Card Sliding Track */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-card rounded-3xl overflow-hidden border border-[hsl(var(--border))] animate-pulse">
                    <div className="aspect-[16/10] bg-[hsl(var(--bg-tertiary))]" />
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--bg-tertiary))]" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-[hsl(var(--bg-tertiary))] rounded w-3/4" />
                          <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-14 bg-[hsl(var(--bg-tertiary))] rounded-2xl" />
                      <div className="h-12 bg-[hsl(var(--bg-tertiary))] rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-3xl border border-[hsl(var(--border))] space-y-3">
                <School className="w-14 h-14 text-[hsl(var(--text-tertiary))] mx-auto opacity-50" />
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">
                  No institutions match the selected filters
                </h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] max-w-md mx-auto">
                  Try adjusting the type or regional jurisdiction filter in the dropdown above to view registered campuses.
                </p>
                <button
                  onClick={() => {
                    setSelectedTypeFilter('all');
                    setSelectedRegionFilter('all');
                  }}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-md"
                >
                  Show All Institutions
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-hidden -mx-3 px-3 py-2">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${cardSlideIndex * (100 / itemsPerPage)}%)`,
                    }}
                  >
                    {filtered.map((t, idx) => (
                      <div
                        key={t.id}
                        className="flex-shrink-0 px-3"
                        style={{ width: `${100 / itemsPerPage}%` }}
                      >
                        <SchoolCard
                          tenant={t}
                          index={idx}
                          tenantUrl={getTenantUrl(t.slug)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[hsl(var(--text-tertiary))]">
                  <p className="font-semibold">
                    Showing {Math.min(filtered.length, cardSlideIndex + 1)}–{Math.min(filtered.length, cardSlideIndex + itemsPerPage)} of {filtered.length} institutions
                  </p>

                  {filtered.length > itemsPerPage && (
                    <div className="flex items-center gap-1.5">
                      {[...Array(maxSlideIndex + 1)].map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setCardSlideIndex(dotIdx)}
                          className={`h-2 rounded-full transition-all ${
                            dotIdx === cardSlideIndex
                              ? 'w-6 bg-[hsl(var(--accent))]'
                              : 'w-2 bg-[hsl(var(--border))] hover:bg-[hsl(var(--text-secondary))]'
                          }`}
                          aria-label={`Go to card page ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </section>

        {/* ── 6. [NEW SECTION] Role-Based Stakeholder Experience Showcase ── */}
        <section id="stakeholders" className="py-20 sm:py-28 bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">Tailored Personas</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                Designed for Every Educational Stakeholder
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Dedicated, role-isolated portals engineered for the distinct workflows of students, parents, educators, and institutional leadership.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="flex justify-center mb-10">
              <div className="flex p-1.5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] max-w-full overflow-x-auto gap-1 shadow-md">
                {[
                  { id: 'teacher', label: 'Teachers & Faculty', icon: Users },
                  { id: 'student', label: 'Students & Scholars', icon: GraduationCap },
                  { id: 'parent', label: 'Parents & Guardians', icon: Heart },
                  { id: 'admin', label: 'Principals & Bursars', icon: School },
                  { id: 'board', label: 'Diocesan Boards', icon: Building2 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePersona(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                      activePersona === tab.id
                        ? 'bg-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--accent)/0.25)]'
                        : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Content Display */}
            <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[hsl(var(--border))] shadow-xl">
              {activePersona === 'teacher' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Faculty &amp; Instructional Suite
                    </span>
                    <h3 className="text-2xl font-black text-[hsl(var(--text-primary))]">
                      Empower Educators with 1-Tap Attendance &amp; AI Lesson Planning
                    </h3>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Teachers save up to 12 hours every week on repetitive administrative logging. Everything from instant roll-call to Continuous Assessment (CASS) grade computations is automated.
                    </p>
                    <div className="space-y-3">
                      {[
                        'AI lesson plan generator strictly aligned with WAEC topic learning outcomes.',
                        'Visual allocation matrix preventing teacher overload beyond 30 periods/week.',
                        'Continuous assessment entry (30% CASS / 70% Exams) with instant variance checks.',
                        'Mobile check-in and automated student behavior commendation logging.',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[hsl(var(--text-primary))]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-4">
                    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-primary))]">
                        <Sparkles className="w-4 h-4 text-[hsl(var(--accent))]" /> AI Lesson Plan Preview (SSS 2 Chemistry)
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">WAEC Approved</span>
                    </div>
                    <div className="space-y-2 text-xs text-[hsl(var(--text-secondary))] font-mono">
                      <p className="text-indigo-400 font-bold">Topic: Chemical Energetics &amp; Enthalpy Changes</p>
                      <p>&gt; Phase 1: Hook &amp; Prior Knowledge Recall (5 mins)</p>
                      <p>&gt; Phase 2: Exothermic vs Endothermic Demonstration (15 mins)</p>
                      <p>&gt; Phase 3: Collaborative Energy Profile Graphing (15 mins)</p>
                      <p>&gt; Phase 4: Formative WAEC Past Question Check (5 mins)</p>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <a href="#curriculum" className="text-xs font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1">
                        Explore Curriculum Engine &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'student' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold inline-flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Student Learning Portal
                    </span>
                    <h3 className="text-2xl font-black text-[hsl(var(--text-primary))]">
                      Personalized Academic Transcripts, Homework &amp; Past Questions
                    </h3>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Students access an engaging digital campus where they review daily class schedules, submit assignments, and practice WAEC BECE/WASSCE past exam question banks.
                    </p>
                    <div className="space-y-3">
                      {[
                        'Live daily timetable and classroom venue indicators.',
                        'Digital student ID card and verified lifelong academic portfolio.',
                        'WAEC question drill simulator with explanatory steps.',
                        'Instant access to published termly report cards and GPA analytics.',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[hsl(var(--text-primary))]">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-4">
                    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-primary))]">
                        <Trophy className="w-4 h-4 text-amber-400" /> Student Term Report Card
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400">Position: 2nd / 45</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                        <span className="text-[hsl(var(--text-secondary))]">Further Mathematics</span>
                        <span className="font-bold text-emerald-400">88% (A1)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                        <span className="text-[hsl(var(--text-secondary))]">Physics</span>
                        <span className="font-bold text-emerald-400">82% (B2)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                        <span className="text-[hsl(var(--text-secondary))]">Chemistry</span>
                        <span className="font-bold text-emerald-400">85% (A1)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[hsl(var(--text-secondary))]">English Language</span>
                        <span className="font-bold text-blue-400">79% (B3)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'parent' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold inline-flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" /> Guardian &amp; Parent Ecosystem
                    </span>
                    <h3 className="text-2xl font-black text-[hsl(var(--text-primary))]">
                      Zero Distance Between Home and the Classroom
                    </h3>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Parents stay informed in real time. Receive instant absence SMS notifications, monitor homework completion, and pay school fees via mobile money securely.
                    </p>
                    <div className="space-y-3">
                      {[
                        'Immediate morning attendance SMS & WhatsApp alerts for peace of mind.',
                        '1-tap fee payments with Orange Money, AfriMoney, and Visa/Mastercard.',
                        'Direct, structured messaging with subject teachers and school counselors.',
                        'Downloadable official bursary receipts with QR verification codes.',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[hsl(var(--text-primary))]">
                          <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-4">
                    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-primary))]">
                        <CreditCard className="w-4 h-4 text-emerald-400" /> Instant Mobile Tuition Payment
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">Verified Receipt</span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <p className="text-xs font-bold text-emerald-400">Payment Status: Term 1 Tuition Settled</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">Amount: NLe 2,500 &middot; Method: Orange Money &middot; Ref: #OR-88291</p>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'admin' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold inline-flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5" /> Institutional Administration
                    </span>
                    <h3 className="text-2xl font-black text-[hsl(var(--text-primary))]">
                      Total 360° Operational Governance for Principals &amp; Bursars
                    </h3>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Transform school administration with comprehensive audit logs, conflict-free timetable scheduling, automated Ministry census exports, and tamper-proof gradebooks.
                    </p>
                    <div className="space-y-3">
                      {[
                        'Automated WAEC CASS 30%/70% computation with variance alerts.',
                        'Real-time tuition cash-flow ledger and outstanding fee aging reports.',
                        'Automated teacher cover requests and timetable conflict resolver.',
                        'One-click Ministry of Education (MBSSE) annual census export.',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[hsl(var(--text-primary))]">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-4">
                    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-primary))]">
                        <BarChart3 className="w-4 h-4 text-[hsl(var(--accent))]" /> Principal Executive Radar
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">All Metrics Healthy</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                        <p className="text-lg font-black text-[hsl(var(--accent))]">1,420</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase">Enrolled Students</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                        <p className="text-lg font-black text-emerald-400">96.8%</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase">Fee Collection Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'board' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Multi-School Diocesan Boards
                    </span>
                    <h3 className="text-2xl font-black text-[hsl(var(--text-primary))]">
                      Unified Oversight Across Diocesan &amp; Multi-School Networks
                    </h3>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      Oversee dozens of child schools from a single central executive dashboard. Benchmark academic performances, reassign faculty across campuses, and manage group bursaries.
                    </p>
                    <div className="space-y-3">
                      {[
                        'Cross-campus academic benchmarking and WAEC pass rate comparisons.',
                        'Centralized curriculum distribution with uniform scheme of work standards.',
                        'Consolidated group bursary and inter-school donor scholarship allocation.',
                        'Seamless branch creation with isolated cryptographic data boundaries.',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[hsl(var(--text-primary))]">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-4">
                    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-primary))]">
                        <Building2 className="w-4 h-4 text-purple-400" /> Multi-Campus Performance Matrix
                      </div>
                      <span className="text-[10px] font-mono text-purple-400">12 Member Schools</span>
                    </div>
                    <div className="space-y-2 text-xs text-[hsl(var(--text-secondary))]">
                      <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                        <span>Albert Academy (Senior Secondary)</span>
                        <span className="font-bold text-emerald-400">94% WAEC Pass</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                        <span>St. Edwards Secondary School</span>
                        <span className="font-bold text-emerald-400">91% WAEC Pass</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Methodist Boys High School</span>
                        <span className="font-bold text-emerald-400">89% WAEC Pass</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ── 7. [NEW SECTION] National Curriculum & WAEC Compliance Matrix ── */}
        <section id="curriculum" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">National Standards</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                Sierra Leone 6-3-3-4 &amp; WAEC Compliance
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Engineered from the ground up for the West African Examinations Council (WAEC) and Ministry of Basic and Senior Secondary Education (MBSSE) standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-card p-7 rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                  6-3-3-4
                </div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Pre-Seeded National Streams</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Turnkey syllabus structures for Junior Secondary (JSS) and Senior Secondary (SSS) streams: Pure Sciences, Arts &amp; Humanities, Commercial, and Technical/Vocational (TVET).
                </p>
              </div>

              <div className="glass-card p-7 rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                  30/70
                </div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Automated CASS Computation</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Strict 30% Continuous Assessment Score (CASS) + 70% Terminal Examination formula with automatic standard deviation normalization and tamper-proof grading records.
                </p>
              </div>

              <div className="glass-card p-7 rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-black">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Zero-Hallucination AI Plans</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Gemini 2.0 Flash engine strictly bounded by your school's published syllabus topics, Bloom's cognitive taxonomy outcomes, and teacher lesson phase templates.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── 8. [NEW SECTION] Enterprise Security & Data Sovereignty ── */}
        <section id="security" className="py-20 sm:py-28 bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">Enterprise Trust</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                Institutional Data Sovereignty &amp; Security
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Your institution’s records, student transcripts, and financial ledgers are protected by cryptographic multi-tenant separation and high-availability African cloud nodes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Row-Level Security (RLS)</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  PostgreSQL database isolation prevents cross-tenant data leakage. Every query is scoped to the tenant UUID.
                </p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <WifiOff className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Offline-First Resilience</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  PWA caching allows teachers to take attendance and record grades even during campus internet dropouts.
                </p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Daily Encrypted Backups</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Automated cloud snapshots with Point-in-Time Recovery (PITR) guaranteeing zero academic records loss.
                </p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Immutable Audit Logs</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Every grade modification, fee waiver, and student record change is indelibly timestamped with staff identity.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── 9. [NEW SECTION] Institutional Pricing & Subscription Tiers ── */}
        <section id="pricing" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">Subscription Tiers</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                Transparent Institutional Pricing
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Simple per-term or annual pricing scaled for standalone campuses and multi-school networks. No hidden setup fees.
              </p>

              {/* Billing Toggle & Currency Switcher */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <div className="flex p-1 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                  <button
                    onClick={() => setBillingPeriod('term')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      billingPeriod === 'term' ? 'bg-[hsl(var(--accent))] text-white shadow' : 'text-[hsl(var(--text-secondary))]'
                    }`}
                  >
                    Per Term (3 / Year)
                  </button>
                  <button
                    onClick={() => setBillingPeriod('annual')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      billingPeriod === 'annual' ? 'bg-[hsl(var(--accent))] text-white shadow' : 'text-[hsl(var(--text-secondary))]'
                    }`}
                  >
                    Annual Billing <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Save 15%</span>
                  </button>
                </div>

                <div className="flex p-1 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                  <button
                    onClick={() => setPricingCurrency('NLe')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pricingCurrency === 'NLe' ? 'bg-[hsl(var(--accent))] text-white shadow' : 'text-[hsl(var(--text-secondary))]'
                    }`}
                  >
                    Leone (NLe)
                  </button>
                  <button
                    onClick={() => setPricingCurrency('USD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pricingCurrency === 'USD' ? 'bg-[hsl(var(--accent))] text-white shadow' : 'text-[hsl(var(--text-secondary))]'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              
              {/* Plan 1: Starter Campus */}
              <div className="glass-card p-8 rounded-3xl border border-[hsl(var(--border))] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Starter Campus</span>
                  <h3 className="text-xl font-black text-[hsl(var(--text-primary))]">Single School / College</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Essential student attendance, grading, and parent communications for standalone primary or junior schools.
                  </p>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-[hsl(var(--text-primary))]">
                      {pricingCurrency === 'NLe' ? (billingPeriod === 'term' ? 'NLe 3,500' : 'NLe 8,900') : (billingPeriod === 'term' ? '$150' : '$380')}
                    </span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]"> /{billingPeriod === 'term' ? 'term' : 'year'}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[hsl(var(--text-secondary))] pt-4 border-t border-[hsl(var(--border))]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 500 enrolled students</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Student &amp; parent web portals</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Standard report card generation</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated subdomain address</li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] text-xs font-bold text-[hsl(var(--text-primary))] text-center hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Start 30-Day Free Trial
                </Link>
              </div>

              {/* Plan 2: Enterprise Academy (Featured) */}
              <div className="glass-card p-8 rounded-3xl border-2 border-[hsl(var(--accent))] flex flex-col justify-between space-y-6 relative shadow-2xl bg-[hsl(var(--bg-secondary))]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[hsl(var(--accent))] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">Enterprise Academy</span>
                  <h3 className="text-xl font-black text-[hsl(var(--text-primary))]">JSS + SSS Secondary Hub</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Full WAEC Continuous Assessment engine, AI lesson planning, teacher workload matrix, and bursary billing.
                  </p>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-[hsl(var(--accent))]">
                      {pricingCurrency === 'NLe' ? (billingPeriod === 'term' ? 'NLe 7,500' : 'NLe 19,000') : (billingPeriod === 'term' ? '$320' : '$810')}
                    </span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]"> /{billingPeriod === 'term' ? 'term' : 'year'}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[hsl(var(--text-primary))] pt-4 border-t border-[hsl(var(--border))]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[hsl(var(--accent))]" /> Up to 2,500 enrolled students</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[hsl(var(--accent))]" /> WAEC CASS 30%/70% score computation</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[hsl(var(--accent))]" /> Gemini 2.0 AI Lesson Plan generator</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[hsl(var(--accent))]" /> Teacher allocation matrix &amp; timetabling</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[hsl(var(--accent))]" /> Mobile Money tuition integration</li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black text-center shadow-lg shadow-[hsl(var(--accent)/0.3)] hover:opacity-95 transition-all"
                >
                  Register Academy Free
                </Link>
              </div>

              {/* Plan 3: Diocesan / Multi-School Group */}
              <div className="glass-card p-8 rounded-3xl border border-[hsl(var(--border))] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Diocesan &amp; Group</span>
                  <h3 className="text-xl font-black text-[hsl(var(--text-primary))]">Multi-Campus Network</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Centralized governance for school boards, dioceses, and educational foundations managing multiple branches.
                  </p>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-[hsl(var(--text-primary))]">Custom</span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]"> / institutional contract</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[hsl(var(--text-secondary))] pt-4 border-t border-[hsl(var(--border))]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Unlimited campuses &amp; branches</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Central governing executive radar</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Cross-school academic benchmarking</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Dedicated SLA &amp; on-site data migration</li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] text-xs font-bold text-[hsl(var(--text-primary))] text-center hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Register Group / Board
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ── 10. [NEW SECTION] Institutional Impact Metrics & Endorsements ── */}
        <section id="impact" className="py-20 sm:py-28 bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">Measured Outcomes</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                Proven Impact on Academic Administration
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Transforming educational management across Sierra Leone with quantified time savings and enhanced compliance.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
              <div className="glass-card p-8 rounded-3xl border border-[hsl(var(--border))] text-center space-y-2">
                <p className="text-4xl sm:text-5xl font-black text-emerald-400">-85%</p>
                <p className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase">Report Card Compilation Time</p>
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">From 2 weeks to 48 hours per term</p>
              </div>

              <div className="glass-card p-8 rounded-3xl border border-[hsl(var(--border))] text-center space-y-2">
                <p className="text-4xl sm:text-5xl font-black text-[hsl(var(--accent))]">100%</p>
                <p className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase">On-Time WAEC CASS Delivery</p>
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Zero candidate clearance disqualifications</p>
              </div>

              <div className="glass-card p-8 rounded-3xl border border-[hsl(var(--border))] text-center space-y-2">
                <p className="text-4xl sm:text-5xl font-black text-purple-400">+42%</p>
                <p className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase">Timely Fee Collection</p>
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Through automated SMS payment reminders</p>
              </div>
            </div>

            {/* Testimonial Quote Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-3xl border border-[hsl(var(--border))] space-y-4">
                <div className="flex text-amber-400 gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" />
                </div>
                <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed italic">
                  "{APP_NAME} eliminated grade calculation errors across our 1,200 Senior Secondary students. The automated WAEC CASS computation gave our examination officers total confidence."
                </p>
                <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-xs">
                    AK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">Alhaji Koroma</h4>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Principal &middot; Freetown Secondary Academy</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl border border-[hsl(var(--border))] space-y-4">
                <div className="flex text-amber-400 gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" />
                </div>
                <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed italic">
                  "Managing eight diocesan schools previously required manual physical paper returns. Now our governing board monitors termly fee collections and teacher allocations from one screen."
                </p>
                <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    MT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">Rev. Michael Turay</h4>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Education Secretary &middot; Diocesan Schools Board</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 11. Onboarding Stepper & Academic Dates ─────────────────── */}
        <section id="admissions" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">Implementation Pathway</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                Four Steps, Zero Friction
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                We make provisioning and onboarding seamless for both standalone academies and multi-school networks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-18">
              {[
                { step: '01', title: 'Institution Provisioning', desc: 'Configure school profile, campus branches, and custom branding parameters.' },
                { step: '02', title: 'Curriculum & Streams', desc: 'Select national curriculum standards (6-3-3-4) and structure subject offerings.' },
                { step: '03', title: 'Faculty Allocation', desc: 'Map teachers to class sections with automated workload and qualification guards.' },
                { step: '04', title: 'Live Portal Launch', desc: 'Issue secure student, parent, and teacher credentials with role-based dashboards.' },
              ].map((s, idx) => (
                <div key={idx} className="glass-card p-7 rounded-3xl border border-[hsl(var(--border))] relative overflow-hidden space-y-3 hover:border-[hsl(var(--accent)/0.4)] transition-all">
                  <span className="text-4xl font-black text-[hsl(var(--accent)/0.25)] block leading-none">{s.step}</span>
                  <h3 className="text-base font-black text-[hsl(var(--text-primary))]">{s.title}</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" id="dates">
              
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mb-3">Frequently Asked Questions</h3>
                
                <details className="glass-card rounded-2xl border border-[hsl(var(--border))] p-5 group [&_summary::-webkit-details-marker]:hidden" open>
                  <summary className="font-bold text-sm text-[hsl(var(--text-primary))] cursor-pointer flex justify-between items-center">
                    How does multi-tenant data isolation work?
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-3 leading-relaxed">
                    Each school operates in total isolation using PostgreSQL Row-Level Security (RLS) policies. School administrators and teachers can only query data tagged to their tenant UUID.
                  </p>
                </details>

                <details className="glass-card rounded-2xl border border-[hsl(var(--border))] p-5 group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="font-bold text-sm text-[hsl(var(--text-primary))] cursor-pointer flex justify-between items-center">
                    Can we use our own school custom domain?
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-3 leading-relaxed">
                    Yes. Every school is allocated a subdomain by default (e.g. <code>albert-academy.localhost:3000</code> or <code>albert-academy.yoursaas.com</code>), and can map custom apex domains.
                  </p>
                </details>

                <details className="glass-card rounded-2xl border border-[hsl(var(--border))] p-5 group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="font-bold text-sm text-[hsl(var(--text-primary))] cursor-pointer flex justify-between items-center">
                    Is the AI lesson plan generator constrained to our syllabus?
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-3 leading-relaxed">
                    Yes. Our Gemini-powered AI engine is strictly instructed to only operationalize published learning outcomes and approved topic structures created by your academic board.
                  </p>
                </details>
              </div>

              <div className="lg:col-span-5 glass-card rounded-3xl border border-[hsl(var(--border))] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                  <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Academic Cycle Highlights</h3>
                  <Calendar className="w-4 h-4 text-[hsl(var(--accent))]" />
                </div>

                <div className="space-y-3">
                  {[
                    { day: '01', month: 'Sep', title: 'First Term Commencement', desc: 'Session opening & timetable activation' },
                    { day: '15', month: 'Oct', title: 'WAEC CASS Submission', desc: 'Continuous Assessment scores deadline' },
                    { day: '12', month: 'Jan', title: 'Second Term Intake', desc: 'Mid-year admissions & exam clearance' },
                    { day: '24', month: 'May', title: 'National Exam Sittings', desc: 'BECE and WASSCE examination period' },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-4 py-2.5 border-b border-[hsl(var(--border))] last:border-0">
                      <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex flex-col items-center justify-center flex-shrink-0 font-black border border-[hsl(var(--accent)/0.25)]">
                        <span className="text-sm leading-none">{d.day}</span>
                        <span className="text-[9px] uppercase tracking-wider">{d.month}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">{d.title}</h4>
                        <p className="text-[11px] text-[hsl(var(--text-secondary))]">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ── 12. Request a Demonstration & Contact Form ─────────────── */}
        <section id="contact" className="py-20 sm:py-28 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              <div className="lg:col-span-5 space-y-6">
                <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">Connect With Us</p>
                <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                  Experience {APP_NAME} in Action
                </h2>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                  Request a guided walkthrough tailored to your institution’s size, national curriculum requirements, and administrative goals.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3.5 text-sm text-[hsl(var(--text-secondary))]">
                    <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Freetown, Sierra Leone &middot; Global Cloud Deployments</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-sm text-[hsl(var(--text-secondary))]">
                    <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>contact@schoolsaas.com</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-sm text-[hsl(var(--text-secondary))]">
                    <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>+232 76 000 000 / +232 78 000 000</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-card rounded-3xl p-7 sm:p-9 border border-[hsl(var(--border))] shadow-2xl">
                  {demoSubmitted ? (
                    <div className="text-center py-10 space-y-4 animate-in fade-in">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black text-[hsl(var(--text-primary))]">Demonstration Request Received!</h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out. We have logged your institutional onboarding request for <strong className="text-[hsl(var(--text-primary))]">{demoForm.institutionName}</strong>. One of our academic implementation consultants will contact you at <strong className="text-[hsl(var(--text-primary))]">{demoForm.email}</strong> within 24 hours.
                      </p>
                      <div className="p-4 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] max-w-md mx-auto text-left text-xs space-y-1.5 text-[hsl(var(--text-secondary))]">
                        <p><strong className="text-[hsl(var(--text-primary))]">Contact:</strong> {demoForm.name} {demoForm.phone && `(${demoForm.phone})`}</p>
                        <p><strong className="text-[hsl(var(--text-primary))]">Institution:</strong> {demoForm.institutionName} ({demoForm.type === 'organization' ? 'Group / Diocesan Board' : 'Standalone School'})</p>
                        <p><strong className="text-[hsl(var(--text-primary))]">Jurisdiction:</strong> {demoForm.region}</p>
                        {demoForm.estimatedStudents && <p><strong className="text-[hsl(var(--text-primary))]">Est. Students:</strong> {demoForm.estimatedStudents}</p>}
                      </div>
                      <button
                        onClick={() => {
                          setDemoSubmitted(false);
                          setDemoForm({
                            name: '',
                            email: '',
                            phone: '',
                            institutionName: '',
                            type: 'school',
                            region: 'Western Area (Freetown)',
                            estimatedStudents: '',
                            message: '',
                          });
                        }}
                        className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDemoSubmit} className="space-y-4">
                      {demoError && (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{demoError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Contact Name *</label>
                          <input
                            type="text"
                            required
                            value={demoForm.name}
                            onChange={e => setDemoForm({ ...demoForm, name: e.target.value })}
                            placeholder="Dr. Samuel Koroma"
                            className="w-full h-12 px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={demoForm.email}
                            onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                            placeholder="samuel@institution.edu.sl"
                            className="w-full h-12 px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Institution Name *</label>
                          <input
                            type="text"
                            required
                            value={demoForm.institutionName}
                            onChange={e => setDemoForm({ ...demoForm, institutionName: e.target.value })}
                            placeholder="e.g. St. Edwards Secondary School"
                            className="w-full h-12 px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Phone Number</label>
                          <input
                            type="tel"
                            value={demoForm.phone}
                            onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                            placeholder="+232 76 000 000"
                            className="w-full h-12 px-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Institution Type</label>
                          <select
                            value={demoForm.type}
                            onChange={e => setDemoForm({ ...demoForm, type: e.target.value })}
                            className="w-full h-12 px-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                          >
                            <option value="school">Standalone School / College</option>
                            <option value="organization">Multi-School Group / Diocesan Board</option>
                            <option value="vocational">Vocational / Technical Institute</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Region / Jurisdiction</label>
                          <select
                            value={demoForm.region}
                            onChange={e => setDemoForm({ ...demoForm, region: e.target.value })}
                            className="w-full h-12 px-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors font-medium"
                          >
                            <option value="Western Area (Freetown)">Western Area (Freetown)</option>
                            <option value="Eastern Province (Kenema/Kono)">Eastern Province</option>
                            <option value="Southern Province (Bo/Moyamba)">Southern Province</option>
                            <option value="Northern Province (Makeni)">Northern Province</option>
                            <option value="North West Province (Port Loko)">North West Province</option>
                            <option value="International / Other">International / Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Est. Students</label>
                          <input
                            type="number"
                            value={demoForm.estimatedStudents}
                            onChange={e => setDemoForm({ ...demoForm, estimatedStudents: e.target.value })}
                            placeholder="e.g. 1200"
                            className="w-full h-12 px-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Requirements / Message</label>
                        <textarea
                          rows={3}
                          value={demoForm.message}
                          onChange={e => setDemoForm({ ...demoForm, message: e.target.value })}
                          placeholder="Tell us about your student enrollment size, grading requirements, or data migration needs..."
                          className="w-full p-4 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingDemo}
                        className="w-full h-13 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-sm shadow-xl shadow-[hsl(var(--accent)/0.25)] hover:opacity-95 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submittingDemo ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Request...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Submit Demo &amp; Onboarding Request
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* ── 13. Academic Platform Footer ────────────────────────────── */}
      <footer className="bg-[hsl(var(--bg-primary))] border-t border-[hsl(var(--border))] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            <div className="col-span-2 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent))] flex items-center justify-center text-white font-black text-base shadow-md">
                  N
                </div>
                <span className="text-lg font-black text-[hsl(var(--text-primary))]">{APP_NAME}</span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))] max-w-sm leading-relaxed">
                The unified multi-tenant school operating engine. Built for absolute academic integrity, data isolation, and operational efficiency across Sierra Leone and West Africa.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider">Directory</h4>
              <ul className="space-y-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
                <li><a href="#institutions" className="hover:text-[hsl(var(--accent))] transition-colors">All Schools</a></li>
                <li><a href="#institutions" className="hover:text-[hsl(var(--accent))] transition-colors">Organizations</a></li>
                <li><a href="#pricing" className="hover:text-[hsl(var(--accent))] transition-colors">Subscription Plans</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider">Academic Engine</h4>
              <ul className="space-y-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
                <li><a href="#curriculum" className="hover:text-[hsl(var(--accent))] transition-colors">WAEC 6-3-3-4 Syllabuses</a></li>
                <li><a href="#curriculum" className="hover:text-[hsl(var(--accent))] transition-colors">AI Lesson Plans</a></li>
                <li><a href="#security" className="hover:text-[hsl(var(--accent))] transition-colors">Data Sovereignty</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider">Access</h4>
              <ul className="space-y-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
                <li><a href={adminUrl} className="hover:text-[hsl(var(--accent))] transition-colors text-[hsl(var(--accent))] font-bold">Super Admin</a></li>
                <li><a href="#institutions" className="hover:text-[hsl(var(--accent))] transition-colors">Portal Search</a></li>
                <li><a href="#contact" className="hover:text-[hsl(var(--accent))] transition-colors">Support</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[hsl(var(--text-tertiary))] font-medium">
            <p>&copy; {new Date().getFullYear()} {APP_NAME} Technologies. All rights reserved.</p>
            <p>Empowering 6-3-3-4 &amp; International Academies</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
