const { Client } = require('pg');

async function fixPolicies() {
  const client = new Client({
    host: 'aws-1-eu-west-3.pooler.supabase.com',
    port: 5432,
    user: 'postgres.qyyipcbzualacxwfvsih',
    password: 'LeadershipCovenant#321',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to PostgreSQL.');

  const sql = `
  -- Reset all policies on contact_submissions
  DROP POLICY IF EXISTS "Public insert contact submissions" ON public.contact_submissions;
  DROP POLICY IF EXISTS "Authenticated full contact submissions" ON public.contact_submissions;
  DROP POLICY IF EXISTS "Allow anon insert" ON public.contact_submissions;
  DROP POLICY IF EXISTS "Allow anon select" ON public.contact_submissions;
  DROP POLICY IF EXISTS "Allow authenticated all" ON public.contact_submissions;

  CREATE POLICY "Allow anon insert"
    ON public.contact_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  CREATE POLICY "Allow select contact submissions"
    ON public.contact_submissions
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Allow authenticated full contact submissions"
    ON public.contact_submissions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Reset all policies on activity_registrations
  DROP POLICY IF EXISTS "Public insert activity registrations" ON public.activity_registrations;
  DROP POLICY IF EXISTS "Authenticated full activity registrations" ON public.activity_registrations;
  DROP POLICY IF EXISTS "Allow anon insert" ON public.activity_registrations;
  DROP POLICY IF EXISTS "Allow select activity registrations" ON public.activity_registrations;
  DROP POLICY IF EXISTS "Allow authenticated full activity registrations" ON public.activity_registrations;

  CREATE POLICY "Allow anon insert"
    ON public.activity_registrations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  CREATE POLICY "Allow select activity registrations"
    ON public.activity_registrations
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Allow authenticated full activity registrations"
    ON public.activity_registrations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Reset all policies on cms_pages
  DROP POLICY IF EXISTS "Public read published CMS pages" ON public.cms_pages;
  DROP POLICY IF EXISTS "Authenticated full cms pages" ON public.cms_pages;
  DROP POLICY IF EXISTS "Allow select cms_pages" ON public.cms_pages;
  DROP POLICY IF EXISTS "Allow authenticated full cms_pages" ON public.cms_pages;

  CREATE POLICY "Allow select cms_pages"
    ON public.cms_pages
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Allow authenticated full cms_pages"
    ON public.cms_pages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Reset all policies on admin_audit_logs
  DROP POLICY IF EXISTS "Authenticated full audit logs" ON public.admin_audit_logs;
  DROP POLICY IF EXISTS "Allow authenticated full audit logs" ON public.admin_audit_logs;

  CREATE POLICY "Allow authenticated full audit logs"
    ON public.admin_audit_logs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Reset all policies on profiles
  DROP POLICY IF EXISTS "Authenticated read profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Allow authenticated full profiles" ON public.profiles;

  CREATE POLICY "Allow authenticated full profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Table grants
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

  -- Ensure PostgREST schema cache is refreshed
  NOTIFY pgrst, 'reload schema';
  `;

  await client.query(sql);
  console.log('Policies updated and schema reload notified.');

  const cmsCount = await client.query('SELECT count(*) FROM public.cms_pages;');
  console.log('Current CMS pages count in DB:', cmsCount.rows[0].count);

  const contactCount = await client.query('SELECT count(*) FROM public.contact_submissions;');
  console.log('Current contact submissions count in DB:', contactCount.rows[0].count);

  const regCount = await client.query('SELECT count(*) FROM public.activity_registrations;');
  console.log('Current activity registrations count in DB:', regCount.rows[0].count);

  await client.end();
}

fixPolicies().catch(console.error);

