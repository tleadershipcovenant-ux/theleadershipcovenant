const { Client } = require('pg');

async function cleanDummyData() {
  const client = new Client({
    host: 'aws-1-eu-west-3.pooler.supabase.com',
    port: 5432,
    user: 'postgres.qyyipcbzualacxwfvsih',
    password: 'LeadershipCovenant#321',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to PostgreSQL database on Supabase.');

  const res1 = await client.query('DELETE FROM public.contact_submissions;');
  console.log(`Cleared contact_submissions: ${res1.rowCount} rows removed.`);

  const res2 = await client.query('DELETE FROM public.activity_registrations;');
  console.log(`Cleared activity_registrations: ${res2.rowCount} rows removed.`);

  const res3 = await client.query('DELETE FROM public.admin_audit_logs;');
  console.log(`Cleared admin_audit_logs: ${res3.rowCount} rows removed.`);

  // Also clean local JSON dummy contacts/registrations so they don't reappear
  const fs = require('fs');
  const path = require('path');
  const localDbPath = path.join(__dirname, '..', '.data', 'tlc-admin-db.json');
  if (fs.existsSync(localDbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      data.contacts = [];
      data.registrations = [];
      fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8');
      console.log('Cleared dummy contacts and registrations from .data/tlc-admin-db.json as well.');
    } catch (e) {
      console.error('Error updating local db:', e.message);
    }
  }

  const cmsCount = await client.query('SELECT count(*) FROM public.cms_pages;');
  console.log(`Preserved real CMS pages: ${cmsCount.rows[0].count} pages in DB.`);

  const userCount = await client.query('SELECT email FROM auth.users;');
  console.log('Preserved Admin Users:', userCount.rows.map(r => r.email));

  await client.end();
  console.log('Dummy data cleanup completed.');
}

cleanDummyData().catch(console.error);

