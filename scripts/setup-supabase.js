const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: 'aws-1-eu-west-3.pooler.supabase.com',
    port: 5432,
    user: 'postgres.qyyipcbzualacxwfvsih',
    password: 'LeadershipCovenant#321',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to PostgreSQL database on aws-1-eu-west-3.pooler.supabase.com');

  const sql = `
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
  -- 2. ACTIVITY & SUMMIT REGISTRATIONS CRM TABLE
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
  -- 3. WEBSITE CMS PAGES TABLE
  -- -----------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS public.cms_pages (
    page_key TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by TEXT DEFAULT 'tleadershipcovenant@gmail.com',
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
  -- 5. ADMIN PROFILES TABLE (Linked with auth.users)
  -- -----------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT DEFAULT 'TLC Administrator',
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- -----------------------------------------------------------------------------
  -- 6. ROW LEVEL SECURITY (RLS) POLICIES
  -- -----------------------------------------------------------------------------
  ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.activity_registrations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Allow public visitors to submit contacts and registrations
  DROP POLICY IF EXISTS "Public insert contact submissions" ON public.contact_submissions;
  CREATE POLICY "Public insert contact submissions"
    ON public.contact_submissions FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Public insert activity registrations" ON public.activity_registrations;
  CREATE POLICY "Public insert activity registrations"
    ON public.activity_registrations FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  -- Allow public read of CMS pages
  DROP POLICY IF EXISTS "Public read published CMS pages" ON public.cms_pages;
  CREATE POLICY "Public read published CMS pages"
    ON public.cms_pages FOR SELECT
    TO anon, authenticated
    USING (true);

  -- Allow authenticated users / admins full access
  DROP POLICY IF EXISTS "Authenticated full contact submissions" ON public.contact_submissions;
  CREATE POLICY "Authenticated full contact submissions"
    ON public.contact_submissions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated full activity registrations" ON public.activity_registrations;
  CREATE POLICY "Authenticated full activity registrations"
    ON public.activity_registrations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated full cms pages" ON public.cms_pages;
  CREATE POLICY "Authenticated full cms pages"
    ON public.cms_pages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated full audit logs" ON public.admin_audit_logs;
  CREATE POLICY "Authenticated full audit logs"
    ON public.admin_audit_logs FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated read profiles" ON public.profiles;
  CREATE POLICY "Authenticated read profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

  -- Grant table permissions to anon and authenticated roles
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
  GRANT SELECT, INSERT ON public.contact_submissions TO anon, authenticated;
  GRANT SELECT, INSERT ON public.activity_registrations TO anon, authenticated;
  GRANT SELECT ON public.cms_pages TO anon, authenticated;
  GRANT ALL ON public.contact_submissions TO authenticated;
  GRANT ALL ON public.activity_registrations TO authenticated;
  GRANT ALL ON public.cms_pages TO authenticated;
  GRANT ALL ON public.admin_audit_logs TO authenticated;
  GRANT ALL ON public.profiles TO authenticated;
  `;

  await client.query(sql);
  console.log('Tables, indexes, triggers, and RLS policies successfully created.');

  const adminEmail = 'tleadershipcovenant@gmail.com';
  const adminPassword = 'TLC@2026';

  const checkUser = await client.query('SELECT id FROM auth.users WHERE email = $1;', [adminEmail]);
  let adminUserId;

  if (checkUser.rows.length === 0) {
    console.log('Creating new admin user in auth.users...');
    const insertRes = await client.query(`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1,
        crypt($2, gen_salt('bf')),
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NOW(),
        '{"provider":"email","providers":["email"],"role":"admin"}',
        '{"full_name":"TLC Administrator","role":"admin"}',
        FALSE,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        FALSE,
        NULL
      ) RETURNING id;
    `, [adminEmail, adminPassword]);
    adminUserId = insertRes.rows[0].id;

    // Also add to auth.identities
    await client.query(`
      INSERT INTO auth.identities (
        id,
        provider_id,
        user_id,
        identity_data,
        provider,
        email,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1::text,
        $1::uuid,
        json_build_object('sub', $1::text, 'email', $2::text),
        'email',
        $2,
        NOW(),
        NOW(),
        NOW()
      );
    `, [adminUserId, adminEmail]);

    console.log('Admin user created with ID:', adminUserId);
  } else {
    adminUserId = checkUser.rows[0].id;
    console.log('Admin user exists. Updating password and email confirmation...');
    await client.query(`
      UPDATE auth.users
      SET encrypted_password = crypt($2, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}',
          raw_user_meta_data = '{"full_name":"TLC Administrator","role":"admin"}',
          updated_at = NOW()
      WHERE id = $1;
    `, [adminUserId, adminPassword]);

    const identityCheck = await client.query('SELECT id FROM auth.identities WHERE user_id = $1;', [adminUserId]);
    if (identityCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO auth.identities (
          id,
          provider_id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          $1::text,
          $1::uuid,
          json_build_object('sub', $1::text, 'email', $2::text),
          'email',
          NOW(),
          NOW(),
          NOW()
        );
      `, [adminUserId, adminEmail]);
    }
    console.log('Admin user updated successfully.');
  }

  // Insert or update profiles
  await client.query(`
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES ($1, $2, 'TLC Administrator', 'admin')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, role = 'admin', updated_at = NOW();
  `, [adminUserId, adminEmail]);

  console.log('Profile configured for admin.');

  // Seed CMS pages if empty
  const localDbPath = path.join(__dirname, '..', '.data', 'tlc-admin-db.json');
  if (fs.existsSync(localDbPath)) {
    try {
      const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      if (localData.cms) {
        for (const [key, page] of Object.entries(localData.cms)) {
          await client.query(`
            INSERT INTO public.cms_pages (page_key, title, content, updated_by, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (page_key) DO UPDATE
            SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();
          `, [key, page.title || key, JSON.stringify(page.content || {}), adminEmail]);
        }
        console.log('Seeded CMS pages from local DB into Supabase.');
      }

      // Also migrate any local contacts
      if (Array.isArray(localData.contacts) && localData.contacts.length > 0) {
        for (const c of localData.contacts) {
          await client.query(`
            INSERT INTO public.contact_submissions (
              id, reference_code, full_name, email, phone, organization, interest, message, crm_status, priority, admin_notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (reference_code) DO NOTHING;
          `, [c.id, c.reference_code, c.full_name, c.email, c.phone, c.organization, c.interest, c.message, c.crm_status || 'new', c.priority || 'normal', c.admin_notes || '', c.created_at || new Date().toISOString(), c.updated_at || new Date().toISOString()]);
        }
        console.log(`Migrated ${localData.contacts.length} local contacts.`);
      }

      // Also migrate any local registrations
      if (Array.isArray(localData.registrations) && localData.registrations.length > 0) {
        const isUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
        for (const r of localData.registrations) {
          const regId = isUuid(r.id) ? r.id : require('crypto').randomUUID();
          await client.query(`
            INSERT INTO public.activity_registrations (
              id, reference_code, submission_type, full_name, email, phone, role, organization, activity_slug, activity_title, activity_category, activity_date, activity_city, booking_mode, payment_method, fee_label, transaction_ref, screenshot_url, screenshot_public_id, screenshot_name, verification_status, admin_notes, message, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            ON CONFLICT (reference_code) DO NOTHING;
          `, [regId, r.reference_code, r.submission_type || 'application', r.full_name, r.email, r.phone, r.role, r.organization || '', r.activity_slug, r.activity_title || '', r.activity_category || '', r.activity_date || '', r.activity_city || '', r.booking_mode || 'reserve_later', r.payment_method || 'ubl', r.fee_label || '', r.transaction_ref || '', r.screenshot_url || '', r.screenshot_public_id || '', r.screenshot_name || '', r.verification_status || 'pending_callback', r.admin_notes || '', r.message || '', r.created_at || new Date().toISOString(), r.updated_at || new Date().toISOString()]);
        }
        console.log(`Migrated ${localData.registrations.length} local registrations.`);
      }
    } catch (e) {
      console.error('Error seeding data from local DB:', e);
    }
  }

  // Notify PostgREST schema cache to reload
  try {
    await client.query('NOTIFY pgrst, \'reload schema\';');
    console.log('Notified PostgREST to reload schema cache.');
  } catch (e) {
    console.log('PostgREST reload notice info:', e.message);
  }

  await client.end();
  console.log('Supabase setup completed successfully!');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
