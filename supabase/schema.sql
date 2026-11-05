-- =============================================================================
-- THE LEADERSHIP COVENANT — SUPABASE POSTGRESQL SCHEMA (CRM + CMS)
-- Run this script inside: Supabase Dashboard -> SQL Editor -> New Query
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. CONTACT US SUBMISSIONS CRM TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT NOT NULL,
  address_with_city TEXT DEFAULT '',
  interest TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  crm_status TEXT NOT NULL DEFAULT 'new'
    CHECK (crm_status IN ('new', 'in_progress', 'responded', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_notes TEXT DEFAULT '',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON public.contact_submissions (crm_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email
  ON public.contact_submissions (email);

DROP TRIGGER IF EXISTS trg_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER trg_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. ACTIVITY & SUMMIT REGISTRATIONS CRM TABLE (WITH CLOUDINARY SCREENSHOTS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  submission_type TEXT NOT NULL DEFAULT 'application'
    CHECK (submission_type IN ('application', 'summit')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT DEFAULT '',
  school_name TEXT DEFAULT '',
  address_with_city TEXT DEFAULT '',
  activity_slug TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  activity_category TEXT DEFAULT 'Leadership Activity',
  activity_date TEXT DEFAULT '',
  activity_city TEXT DEFAULT '',
  booking_mode TEXT NOT NULL DEFAULT 'reserve_later'
    CHECK (booking_mode IN ('reserve_later', 'secure_seat')),
  payment_method TEXT DEFAULT 'ubl',
  fee_label TEXT DEFAULT '',
  transaction_ref TEXT DEFAULT '',
  screenshot_url TEXT DEFAULT '',
  screenshot_public_id TEXT DEFAULT '',
  screenshot_name TEXT DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending_callback'
    CHECK (verification_status IN (
      'pending_callback',
      'awaiting_verification',
      'verified_confirmed',
      'waitlisted',
      'cancelled'
    )),
  admin_notes TEXT DEFAULT '',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity
  ON public.activity_registrations (activity_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_booking
  ON public.activity_registrations (booking_mode, verification_status);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_ref
  ON public.activity_registrations (reference_code);

DROP TRIGGER IF EXISTS trg_activity_registrations_updated_at ON public.activity_registrations;
CREATE TRIGGER trg_activity_registrations_updated_at
  BEFORE UPDATE ON public.activity_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. WEBSITE CMS PAGES TABLE (ALL PAGES CONTENT MANAGEMENT)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_pages (
  page_key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT DEFAULT 'admin@gamail.com',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_cms_pages_updated_at ON public.cms_pages;
CREATE TRIGGER trg_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. ADMIN AUDIT LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT DEFAULT '',
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created
  ON public.admin_audit_logs (created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Service Role Key bypasses RLS for server-side Admin CRM/CMS mutations.
-- Public Anon Key can read published CMS pages only.
-- -----------------------------------------------------------------------------
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published CMS pages" ON public.cms_pages;
CREATE POLICY "Public read published CMS pages"
  ON public.cms_pages
  FOR SELECT
  TO anon, authenticated
  USING (true);

