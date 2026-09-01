export type BlockType =
  | 'hero'
  | 'stats'
  | 'institutions'
  | 'stakeholders'
  | 'curriculum'
  | 'security'
  | 'pricing'
  | 'impact'
  | 'faq'
  | 'contact'
  | 'bento_grid'
  | 'features_split'
  | 'cta_banner'
  | 'rich_text'
  | 'gallery'
  | 'custom_html';

export interface BlockStyleOptions {
  backgroundTheme?: 'default' | 'secondary' | 'accent-subtle' | 'dark' | 'gradient' | 'glass';
  paddingY?: 'compact' | 'normal' | 'spacious';
  containerWidth?: 'full' | 'standard' | 'narrow';
  textAlign?: 'left' | 'center' | 'right';
  showDividerTop?: boolean;
  showDividerBottom?: boolean;
  customCssClass?: string;
  badgeColor?: string;
}

export interface LandingPageItem {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  tag?: string;
  statValue?: string;
  statLabel?: string;
  href?: string;
  author?: string;
  role?: string;
  school?: string;
  avatar?: string;
  rating?: number;
  question?: string;
  answer?: string;
  category?: string;
  imageUrl?: string;
  badgeText?: string;
}

export interface LandingPageSectionRecord {
  id: string;
  section_key: string;
  page_slug?: string;
  block_type?: BlockType;
  badge: string;
  title: string;
  subtitle: string;
  description?: string;
  primary_cta_text?: string;
  primary_cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  is_published: boolean;
  sort_order: number;
  items: LandingPageItem[];
  style_options?: BlockStyleOptions;
  created_at?: string;
  updated_at?: string;
}

export interface LandingPageSectionPayload {
  badge: string;
  title: string;
  subtitle: string;
  description?: string;
  primary_cta_text?: string;
  primary_cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  is_published?: boolean;
  sort_order?: number;
  block_type?: BlockType;
  page_slug?: string;
  items?: LandingPageItem[];
  style_options?: BlockStyleOptions;
}

// ── CMS Page Schema ──────────────────────────────────────────
export interface CmsPageRecord {
  id: string;
  title: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
  is_published: boolean;
  is_home: boolean;
  nav_order: number;
  show_in_header: boolean;
  show_in_footer: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CmsPagePayload {
  title: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
  is_published?: boolean;
  is_home?: boolean;
  nav_order?: number;
  show_in_header?: boolean;
  show_in_footer?: boolean;
}

// ── CMS Plugin Schema ─────────────────────────────────────────
export type PluginKey =
  | 'top_banner'
  | 'whatsapp_float'
  | 'seo_meta'
  | 'tracking_scripts'
  | 'cookie_consent'
  | 'social_proof_ticker';

export interface CmsPluginRecord {
  id: string;
  plugin_key: PluginKey;
  name: string;
  description: string;
  icon: string;
  category: 'marketing' | 'engagement' | 'analytics' | 'compliance';
  is_enabled: boolean;
  config: Record<string, any>;
  updated_at?: string;
}

// ── CMS Media Item Schema ──────────────────────────────────────
export interface CmsMediaItem {
  id: string;
  filename: string;
  title: string;
  url: string;
  file_type: 'image' | 'video' | 'document' | 'svg';
  category: 'campuses' | 'logos' | 'badges' | 'mockups' | 'general';
  size_bytes?: number;
  alt_text?: string;
  created_at?: string;
}

// ── CMS Global Settings Schema ─────────────────────────────────
export interface CmsGlobalSettings {
  id?: string;
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url?: string;
  primary_color: string;
  accent_color: string;
  font_family: string;
  custom_head_scripts?: string;
  custom_body_scripts?: string;
  custom_css?: string;
  updated_at?: string;
}

// ── Pre-built Template Presets ─────────────────────────────────
export interface CmsTemplatePreset {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  previewColor: string;
  badge: string;
  sectionsCount: number;
  sections: LandingPageSectionRecord[];
}

// ── Default Core Landing Sections ──────────────────────────────
export const DEFAULT_LANDING_SECTIONS: LandingPageSectionRecord[] = [
  {
    id: 'hero',
    section_key: 'hero',
    page_slug: 'home',
    block_type: 'hero',
    badge: 'Next-Generation Academic Administration',
    title: 'An education platform that fits every institution',
    subtitle: 'SchoolSaaS is the unified multi-tenant operating system for schools, colleges, and educational boards. Deliver isolated student portals, 6-3-3-4 curriculum trees, AI lesson plans, faculty matrices, and financial audits from one resilient cloud platform.',
    primary_cta_text: 'Register Your School Free',
    primary_cta_url: '/register',
    secondary_cta_text: 'Browse Portals',
    secondary_cta_url: '#institutions',
    is_published: true,
    sort_order: 1,
    style_options: { backgroundTheme: 'default', paddingY: 'normal', containerWidth: 'full' },
    items: [
      { id: '1', title: 'AI Curriculum Engine 2026/2027 Active', description: 'Real-time lesson plans constrained to approved school syllabuses with zero hallucinations.', href: '#curriculum' },
      { id: '2', title: 'Live Attendance Sync', statValue: '98.4%', statLabel: 'Present Today' },
      { id: '3', title: 'MBSSE & WAEC Aligned', statLabel: 'BECE / WASSCE Gradebooks' },
    ],
  },
  {
    id: 'stats',
    section_key: 'stats',
    page_slug: 'home',
    block_type: 'stats',
    badge: 'Live Statistics',
    title: 'Key Facts & Institutional Reach',
    subtitle: 'Real-time metrics from our accredited multi-tenant school network.',
    is_published: true,
    sort_order: 2,
    style_options: { backgroundTheme: 'secondary', paddingY: 'normal', containerWidth: 'full' },
    items: [
      { id: '1', statValue: '50+', statLabel: 'Schools Onboarded', description: 'Accredited standalone & member campuses' },
      { id: '2', statValue: '12+', statLabel: 'Educational Groups', description: 'Diocesan & multi-school networks' },
      { id: '3', statValue: '99.9%', statLabel: 'Uptime SLA', description: 'High-availability infrastructure' },
      { id: '4', statValue: '100%', statLabel: 'Data Isolation', description: 'PostgreSQL Row-Level Security' },
    ],
  },
  {
    id: 'institutions',
    section_key: 'institutions',
    page_slug: 'home',
    block_type: 'institutions',
    badge: 'Institutional Network Directory',
    title: 'Registered Institutions & Portals',
    subtitle: 'Browse accredited schools, colleges, and educational groups. Slide through campus galleries, explore curriculum details, and enter your institution\'s portal.',
    primary_cta_text: 'Register Your School',
    primary_cta_url: '/register',
    is_published: true,
    sort_order: 3,
    style_options: { backgroundTheme: 'default', paddingY: 'normal', containerWidth: 'full' },
    items: [],
  },
  {
    id: 'stakeholders',
    section_key: 'stakeholders',
    page_slug: 'home',
    block_type: 'stakeholders',
    badge: 'Tailored Personas',
    title: 'Designed for Every Educational Stakeholder',
    subtitle: 'Dedicated, role-isolated portals engineered for the distinct workflows of students, parents, educators, and institutional leadership.',
    is_published: true,
    sort_order: 4,
    style_options: { backgroundTheme: 'secondary', paddingY: 'normal', containerWidth: 'full' },
    items: [
      { id: 'teacher', title: 'Teachers & Faculty', tag: 'Faculty & Instructional Suite', description: 'Empower Educators with 1-Tap Attendance & AI Lesson Planning' },
      { id: 'student', title: 'Students & Scholars', tag: 'Student Learning Portal', description: 'Personalized Academic Transcripts, Homework & Past Questions' },
      { id: 'parent', title: 'Parents & Guardians', tag: 'Parent Portal & Billing', description: 'Real-Time Attendance SMS Alerts & Mobile Money Tuition' },
      { id: 'admin', title: 'Principals & Bursars', tag: 'School Operations Console', description: 'Automated Timetabling & Financial Audit Trails' },
      { id: 'board', title: 'Diocesan Boards', tag: 'Governance & Network Analytics', description: 'Multi-Campus Oversight & Consolidated Financial Reporting' },
    ],
  },
  {
    id: 'curriculum',
    section_key: 'curriculum',
    page_slug: 'home',
    block_type: 'curriculum',
    badge: 'National Curriculum & AI Engine',
    title: 'MBSSE & WAEC Curriculum Engine',
    subtitle: 'Native support for 6-3-3-4 education levels (JSS1–JSS3 & SSS1–SSS3), WAEC Continuous Assessment (CASS 30%/70%), and Gemini 2.0 AI lesson planning.',
    primary_cta_text: 'Explore Curriculum Engine',
    primary_cta_url: '/register',
    is_published: true,
    sort_order: 5,
    style_options: { backgroundTheme: 'default', paddingY: 'normal', containerWidth: 'full' },
    items: [
      { id: '1', title: '6-3-3-4 Structure Trees', description: 'Full support for Junior Secondary and Senior Secondary Commercial, Arts, and Science streams.' },
      { id: '2', title: 'CASS 30%/70% Computation', description: 'Automatic continuous assessment weighting with built-in grade boundary validation.' },
      { id: '3', title: 'AI Lesson Plan Generator', description: 'Generates structured 40-minute lesson plans strictly constrained to WAEC syllabus outcomes.' },
      { id: '4', title: 'BECE & WASSCE Exam Drills', description: 'Past questions drill simulator for student self-testing and mock exam practice.' },
    ],
  },
  {
    id: 'security',
    section_key: 'security',
    page_slug: 'home',
    block_type: 'security',
    badge: 'Enterprise Security & Compliance',
    title: 'Bank-Grade Data Sovereignty & Isolation',
    subtitle: 'Every school operates inside an isolated logical tenant backed by PostgreSQL Row-Level Security, SSL encryption, and automated backups.',
    is_published: true,
    sort_order: 6,
    style_options: { backgroundTheme: 'secondary', paddingY: 'normal', containerWidth: 'full' },
    items: [
      { id: '1', title: 'Row-Level Tenant Isolation', description: 'Database-level tenant boundaries ensure school data is strictly private and isolated.' },
      { id: '2', title: 'Offline-First Resilience', description: 'PWA caching allows teachers to record attendance and grades even during internet outages.' },
      { id: '3', title: 'Daily Encrypted Backups', description: 'Automated cloud snapshots with Point-in-Time Recovery guaranteeing zero data loss.' },
      { id: '4', title: 'Immutable Audit Logs', description: 'Every grade change, fee waiver, and record update is timestamped with user identity.' },
    ],
  },
  {
    id: 'pricing',
    section_key: 'pricing',
    page_slug: 'home',
    block_type: 'pricing',
    badge: 'Subscription Tiers',
    title: 'Transparent Institutional Pricing',
    subtitle: 'Simple per-term or annual pricing scaled for standalone campuses and multi-school networks. No hidden setup fees.',
    is_published: true,
    sort_order: 7,
    style_options: { backgroundTheme: 'default', paddingY: 'normal', containerWidth: 'full' },
    items: [
      { id: 'starter', title: 'Starter Campus', statValue: 'NLe 3,500', description: 'Essential student attendance, grading, and parent portals for standalone schools.' },
      { id: 'pro', title: 'Enterprise Academy', statValue: 'NLe 7,500', description: 'Full WAEC CASS engine, AI lesson planning, teacher matrix, and bursary billing.' },
      { id: 'network', title: 'Diocesan / Mission Board', statValue: 'Custom', description: 'Multi-school governance, network analytics, and dedicated cloud hosting.' },
    ],
  },
  {
    id: 'impact',
    section_key: 'impact',
    page_slug: 'home',
    block_type: 'impact',
    badge: 'Verified Testimonials',
    title: 'Trusted by Educators Across West Africa',
    subtitle: 'See how school leaders, diocesan directors, and teachers transform daily operations with SchoolSaaS.',
    is_published: true,
    sort_order: 8,
    style_options: { backgroundTheme: 'secondary', paddingY: 'normal', containerWidth: 'full' },
    items: [
      {
        id: '1',
        title: 'Transformational Efficiency',
        description: 'SchoolSaaS transformed our report card compilation from 3 exhausting weeks into 1-click publishing. Parents love receiving SMS results instantly.',
        author: 'Dr. Samuel K. Sesay',
        role: 'Principal',
        school: 'Albert Academy, Freetown',
        rating: 5,
      },
      {
        id: '2',
        title: 'Seamless Diocesan Oversight',
        description: 'Managing 14 secondary schools under one central governance dashboard gave our diocesan board real-time visibility into attendance and tuition collections.',
        author: 'Rev. Sister Mary Cole',
        role: 'Education Director',
        school: 'Diocesan Catholic Schools Board',
        rating: 5,
      },
      {
        id: '3',
        title: 'Empowered Teachers',
        description: 'The AI lesson plan generator aligns perfectly with the WAEC Chemistry syllabus. It saves me at least 10 hours of lesson preparation every single week.',
        author: 'Mr. Emmanuel Bangura',
        role: 'Senior Science Master',
        school: 'Regent International College',
        rating: 5,
      },
    ],
  },
  {
    id: 'faq',
    section_key: 'faq',
    page_slug: 'home',
    block_type: 'faq',
    badge: 'Frequently Asked Questions',
    title: 'Everything You Need to Know',
    subtitle: 'Answers to common questions from principals, IT managers, and school owners.',
    is_published: true,
    sort_order: 9,
    style_options: { backgroundTheme: 'default', paddingY: 'normal', containerWidth: 'full' },
    items: [
      {
        id: '1',
        question: 'How long does it take to launch a school portal?',
        answer: 'Portals launch instantly! With our self-service onboarding wizard, you can register your school, claim your custom subdomain, and log into your administrator dashboard in under 2 minutes.',
      },
      {
        id: '2',
        question: 'Is SchoolSaaS aligned with the Sierra Leone / WAEC curriculum?',
        answer: 'Yes! SchoolSaaS natively supports the 6-3-3-4 educational framework, JSS/SSS subject trees, and the official 30% Continuous Assessment (CASS) / 70% Examination score weighting.',
      },
      {
        id: '3',
        question: 'Can teachers record grades when campus internet is down?',
        answer: 'Absolutely. Our Progressive Web App (PWA) architecture automatically saves roll call and assessment entries locally offline and syncs them seamlessly once internet connection is restored.',
      },
      {
        id: '4',
        question: 'How does multi-school / diocesan governance work?',
        answer: 'Educational Groups and Diocesan Boards receive an executive governance dashboard to oversee all member campuses while maintaining individual school autonomy.',
      },
    ],
  },
  {
    id: 'contact',
    section_key: 'contact',
    page_slug: 'home',
    block_type: 'contact',
    badge: 'Request a Live Demonstration',
    title: 'Ready to Modernize Your Institution?',
    subtitle: 'Schedule a personalized walk-through with our academic solutions team or self-register your school portal today.',
    primary_cta_text: 'Send Demo Request',
    primary_cta_url: '#contact',
    secondary_cta_text: 'Register Your School Now',
    secondary_cta_url: '/register',
    is_published: true,
    sort_order: 10,
    style_options: { backgroundTheme: 'secondary', paddingY: 'normal', containerWidth: 'full' },
    items: [],
  },
];

// ── Default Pages ──────────────────────────────────────────────
export const DEFAULT_CMS_PAGES: CmsPageRecord[] = [
  {
    id: 'page_home',
    title: 'Home & Portal Directory',
    slug: 'home',
    description: 'Main public landing page for SchoolSaaS platform.',
    seo_title: 'SchoolSaaS — Unified Multi-Tenant School Management Platform',
    seo_description: 'Operating system for schools, colleges, and diocesan educational boards with isolated student portals and WAEC CASS grading.',
    seo_keywords: 'school saas, sierra leone education, waec cass, school portal, freetown education',
    is_published: true,
    is_home: true,
    nav_order: 1,
    show_in_header: true,
    show_in_footer: true,
  },
  {
    id: 'page_institutions',
    title: 'Institutions Directory',
    slug: 'institutions',
    description: 'Accredited member institutions and portal directory.',
    seo_title: 'Registered Institutions & Portals | SchoolSaaS',
    seo_description: 'Explore accredited schools, colleges, and diocesan groups onboarded onto the SchoolSaaS cloud platform.',
    seo_keywords: 'schools in freetown, albert academy portal, st edwards portal, school directory',
    is_published: true,
    is_home: false,
    nav_order: 2,
    show_in_header: true,
    show_in_footer: true,
  },
  {
    id: 'page_curriculum',
    title: 'Curriculum & AI Engine',
    slug: 'curriculum',
    description: '6-3-3-4 national syllabus engine and Gemini AI lesson planning.',
    seo_title: 'MBSSE & WAEC Curriculum Engine | SchoolSaaS',
    seo_description: 'Native 6-3-3-4 curriculum structure, Continuous Assessment (CASS 30%/70%), and automated AI lesson planning.',
    seo_keywords: 'waec cass 30 70, bece wassce syllabus, ai lesson plan generator',
    is_published: true,
    is_home: false,
    nav_order: 3,
    show_in_header: true,
    show_in_footer: true,
  },
  {
    id: 'page_pricing',
    title: 'Institutional Pricing',
    slug: 'pricing',
    description: 'Transparent subscription tiers for standalone schools and diocesan networks.',
    seo_title: 'Transparent Pricing & Plans | SchoolSaaS',
    seo_description: 'Predictable per-term and annual pricing plans tailored for schools of all sizes across Sierra Leone.',
    seo_keywords: 'school management software pricing, student billing saas',
    is_published: true,
    is_home: false,
    nav_order: 4,
    show_in_header: true,
    show_in_footer: true,
  },
  {
    id: 'page_admissions',
    title: 'Admissions & Onboarding',
    slug: 'admissions',
    description: '4-step onboarding pathway and common academic questions.',
    seo_title: 'Implementation & Admissions FAQ | SchoolSaaS',
    seo_description: 'Learn how quickly your institution can launch a fully branded portal with zero IT headaches.',
    seo_keywords: 'school onboarding, launch student portal, school saas setup',
    is_published: true,
    is_home: false,
    nav_order: 5,
    show_in_header: true,
    show_in_footer: true,
  },
];

// ── Default Built-in Plugins ───────────────────────────────────
export const DEFAULT_CMS_PLUGINS: CmsPluginRecord[] = [
  {
    id: 'plugin_top_banner',
    plugin_key: 'top_banner',
    name: 'Top Announcement Bar',
    description: 'Displays a high-visibility sticky banner at the very top of the page for urgent news, term dates, or admissions alerts.',
    icon: 'Megaphone',
    category: 'marketing',
    is_enabled: true,
    config: {
      badgeText: '2026/2027 Admissions Open',
      message: 'Self-service school registration is active. Launch your institution portal in under 2 minutes.',
      linkText: 'Register School Free →',
      linkUrl: '/register',
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
      isDismissible: true,
    },
  },
  {
    id: 'plugin_whatsapp_float',
    plugin_key: 'whatsapp_float',
    name: 'WhatsApp & Live Help Floating Button',
    description: 'Places a fixed floating support launcher on the bottom-right corner allowing prospective principals and admins to chat directly.',
    icon: 'MessageSquare',
    category: 'engagement',
    is_enabled: true,
    config: {
      phoneNumber: '+23276000000',
      greetingMessage: 'Hello! Need assistance registering your school or scheduling an executive walkthrough?',
      buttonLabel: 'Chat with Admissions',
      popupTitle: 'SchoolSaaS Support Desk',
      onlineStatus: 'Typical reply: Under 5 mins',
      position: 'bottom-right',
    },
  },
  {
    id: 'plugin_seo_meta',
    plugin_key: 'seo_meta',
    name: 'SEO & OpenGraph Social Previews',
    description: 'Generates Twitter Cards, WhatsApp preview thumbnails, and Google Structured Data (JSON-LD) for enhanced search ranking.',
    icon: 'Search',
    category: 'marketing',
    is_enabled: true,
    config: {
      siteTitle: 'SchoolSaaS — Multi-Tenant School Management Engine',
      metaDescription: 'The unified operating system for schools, colleges, and educational boards across Sierra Leone.',
      defaultOgImage: '/campus-hd-1.jpg',
      twitterHandle: '@schoolsaas_sl',
      robotsIndexing: true,
    },
  },
  {
    id: 'plugin_tracking_scripts',
    plugin_key: 'tracking_scripts',
    name: 'Custom Scripts & Analytics Injector',
    description: 'Safely injects Google Tag Manager, Google Analytics 4 (GA4), Meta Pixel, or custom JavaScript tracking tags.',
    icon: 'Activity',
    category: 'analytics',
    is_enabled: false,
    config: {
      googleAnalyticsId: '',
      metaPixelId: '',
      customHeadScript: '',
      customFooterScript: '',
    },
  },
  {
    id: 'plugin_cookie_consent',
    plugin_key: 'cookie_consent',
    name: 'Cookie & Privacy Consent Banner',
    description: 'Compliant GDPR / Data Protection notice informing visitors about session cookies and multi-tenant security safeguards.',
    icon: 'Shield',
    category: 'compliance',
    is_enabled: true,
    config: {
      title: 'Data Sovereignty & Privacy',
      message: 'We use essential cookies to maintain secure tenant isolation and authenticate authorized educators, students, and parents.',
      acceptButtonText: 'Acknowledge & Continue',
      privacyPolicyUrl: '#',
      theme: 'glass',
    },
  },
  {
    id: 'plugin_social_proof_ticker',
    plugin_key: 'social_proof_ticker',
    name: 'Social Proof Live Activity Ticker',
    description: 'Displays subtle, realistic popup notifications of recent platform activities to boost conversion rates.',
    icon: 'Sparkles',
    category: 'engagement',
    is_enabled: true,
    config: {
      intervalSeconds: 14,
      notifications: [
        { text: 'Albert Academy published 840 Continuous Assessment (CASS) scores', timeAgo: '3 minutes ago' },
        { text: 'St. Edward’s Secondary School onboarded 45 new senior teachers', timeAgo: '12 minutes ago' },
        { text: 'Diocesan Catholic Board activated consolidated term fee reporting', timeAgo: '28 minutes ago' },
        { text: 'Regent International College generated 12 AI Physics lesson plans', timeAgo: '45 minutes ago' },
      ],
    },
  },
];

// ── Default Media Assets ───────────────────────────────────────
export const DEFAULT_CMS_MEDIA: CmsMediaItem[] = [
  {
    id: 'media_campus_1',
    filename: 'hero-library.jpg',
    title: 'Modern Library & Learning Center',
    url: '/hero-library.jpg',
    file_type: 'image',
    category: 'campuses',
    alt_text: 'Students studying in modern school library',
  },
  {
    id: 'media_campus_2',
    filename: 'hero-science.jpg',
    title: 'Science & Chemistry Laboratory',
    url: '/hero-science.jpg',
    file_type: 'image',
    category: 'campuses',
    alt_text: 'Students conducting science laboratory experiments',
  },
  {
    id: 'media_campus_3',
    filename: 'hero-sports.jpg',
    title: 'Sports & Athletic Complex',
    url: '/hero-sports.jpg',
    file_type: 'image',
    category: 'campuses',
    alt_text: 'School sports day and football pitch',
  },
  {
    id: 'media_campus_4',
    filename: 'campus-hd-1.jpg',
    title: 'Main Academic Quadrangle',
    url: '/campus-hd-1.jpg',
    file_type: 'image',
    category: 'campuses',
    alt_text: 'Academic quadrangle and colonial style school buildings',
  },
];

// ── Default Global Settings ────────────────────────────────────
export const DEFAULT_CMS_SETTINGS: CmsGlobalSettings = {
  site_name: 'SchoolSaaS',
  site_tagline: 'Multi-Tenant School Operating System',
  logo_url: '',
  primary_color: '#4f46e5',
  accent_color: '#3b82f6',
  font_family: 'Plus Jakarta Sans',
  custom_css: '',
  custom_head_scripts: '',
  custom_body_scripts: '',
};

// ── Full-Page Theme Presets ────────────────────────────────────
export const CMS_THEME_PRESETS: CmsTemplatePreset[] = [
  {
    id: 'modern_edtech',
    name: 'Modern EdTech SaaS',
    category: 'High-Growth Academies',
    tagline: 'Vibrant gradients, dark mode glassmorphism, and bold metric callouts.',
    description: 'Engineered for modern high schools, private colleges, and tech-forward international institutions.',
    previewColor: 'from-indigo-600 to-blue-500',
    badge: 'Recommended',
    sectionsCount: 10,
    sections: DEFAULT_LANDING_SECTIONS,
  },
  {
    id: 'diocesan_network',
    name: 'Diocesan & Group Network',
    category: 'Multi-School Governance',
    tagline: 'Focused on central board oversight, multi-campus drill-downs, and financial audits.',
    description: 'Designed specifically for mission boards, diocesan authorities, and national school networks.',
    previewColor: 'from-purple-600 to-indigo-700',
    badge: 'Enterprise',
    sectionsCount: 8,
    sections: DEFAULT_LANDING_SECTIONS.filter(s => ['hero', 'stats', 'institutions', 'stakeholders', 'security', 'pricing', 'faq', 'contact'].includes(s.section_key)),
  },
  {
    id: 'academic_heritage',
    name: 'Heritage & Grammar Academy',
    category: 'Historic Institutions',
    tagline: 'Refined academic typography, tradition badges, and historic campus showcase.',
    description: 'Tailored for century-old institutions, grammar schools, and prestigious boarding academies.',
    previewColor: 'from-amber-600 to-emerald-700',
    badge: 'Classical',
    sectionsCount: 9,
    sections: DEFAULT_LANDING_SECTIONS.filter(s => s.section_key !== 'pricing'),
  },
];
