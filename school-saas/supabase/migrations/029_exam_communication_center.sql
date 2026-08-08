-- ============================================================
-- MIGRATION 029: EXAM COMMUNICATION CENTER
-- Tables for Exam Office Communications, Templates, Rules, Deliveries, and Events
-- ============================================================

-- 1. Notification Templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    email_subject_template TEXT,
    default_priority TEXT DEFAULT 'normal' CHECK (default_priority IN ('low', 'normal', 'high', 'urgent')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_mandatory BOOLEAN DEFAULT false NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Notifications (Master records)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    exam_id UUID,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT DEFAULT 'announcement' NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    audience_type TEXT DEFAULT 'custom' NOT NULL,
    deep_link TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'processing', 'sent', 'partially_sent', 'failed', 'cancelled')),
    is_mandatory BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Notification Recipients
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_notification_recipient UNIQUE (notification_id, user_id)
);

-- 4. Notification Deliveries (Multi-channel)
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.notification_recipients(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'push', 'email', 'sms')),
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'delivered', 'failed', 'cancelled')),
    provider_message_id TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    attempts INTEGER DEFAULT 0 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Notification Rules (Automated Event Triggers)
CREATE TABLE IF NOT EXISTS public.notification_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE CASCADE,
    audience_definition JSONB DEFAULT '{}'::jsonb NOT NULL,
    channel_configuration JSONB DEFAULT '["in_app"]'::jsonb NOT NULL,
    conditions JSONB DEFAULT '{}'::jsonb,
    delay_seconds INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Notification Events (Audit/Event Queue Log)
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    payload JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON public.notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_recipients_user ON public.notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_status ON public.notification_recipients(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_channel ON public.notification_deliveries(channel);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.notification_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_rules_tenant_event ON public.notification_rules(tenant_id, event_type);

-- RLS Enablement
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
