import { Client } from 'pg';
import { ALL_CMS_KEYS, getDefaultCmsContent } from '../src/lib/supabase-store';

const CMS_PAGE_TITLES: Record<string, string> = {
  site: 'Global Site Settings & Ticker Announcements',
  home: 'Home Page Content & Impact Metrics',
  events: 'Activities, Workshops & Cohorts Catalog',
  pricing: 'Activity Pricing & Early Bird Discount Rules',
  summit: 'The School Impact Summit 2026 Page',
  services: 'Services & Flagship Programs Page',
  about: 'Our Story, Covenant & CEO Message Page',
  payment: 'Official Bank & QR Payment Settings',
  forms: 'Application & Contact Forms Copy',
};

async function seed() {
  const client = new Client({
    host: 'aws-1-eu-west-3.pooler.supabase.com',
    port: 5432,
    user: 'postgres.qyyipcbzualacxwfvsih',
    password: 'LeadershipCovenant#321',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to PostgreSQL database for CMS seeding.');

  for (const key of ALL_CMS_KEYS) {
    const title = CMS_PAGE_TITLES[key] || key;
    const content = getDefaultCmsContent(key);

    await client.query(`
      INSERT INTO public.cms_pages (page_key, title, content, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (page_key) DO UPDATE
      SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();
    `, [key, title, JSON.stringify(content), 'tleadershipcovenant@gmail.com']);

    console.log(`Seeded CMS page: ${key} (${title})`);
  }

  await client.query('NOTIFY pgrst, \'reload schema\';');
  const countRes = await client.query('SELECT count(*) FROM public.cms_pages;');
  console.log('Total CMS pages now in database:', countRes.rows[0].count);

  await client.end();
  console.log('CMS Seeding completed successfully!');
}

seed().catch(console.error);

