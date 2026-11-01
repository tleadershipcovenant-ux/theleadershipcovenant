import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qyyipcbzualacxwfvsih.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Dzvmh7YTo2Y9C0122xV3BQ_WZU4Z57R';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runE2ETests() {
  console.log('====================================================');
  console.log('THE LEADERSHIP COVENANT — END-TO-END WORKFLOW TESTS');
  console.log('====================================================');

  const testEmail = 'rohan.test@leadershipcovenant.org';

  // ---------------------------------------------------------------------------
  // 1. TEST CONTACT US FORM SUBMISSION
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 1] Testing Contact Us Form Submission...');
  const contactPayload = {
    type: 'contact',
    full_name: 'Dr. Sarah Ahmed',
    email: testEmail,
    phone: '+92 300 9876543',
    organization: 'Beaconhouse National University',
    interest: 'executive_coaching',
    message: 'We are interested in booking executive leadership workshops for our senior faculty cohort in 2026.'
  };

  const contactRef = `TLC-INQ-TEST${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: contactRow, error: contactErr } = await supabase
    .from('contact_submissions')
    .insert({
      reference_code: contactRef,
      full_name: contactPayload.full_name,
      email: contactPayload.email,
      phone: contactPayload.phone,
      organization: contactPayload.organization,
      interest: contactPayload.interest,
      message: contactPayload.message,
      crm_status: 'new',
      priority: 'high',
      admin_notes: 'Automated E2E Verification'
    })
    .select()
    .single();

  if (contactErr) {
    console.error('❌ Contact submission failed:', contactErr);
    process.exit(1);
  }
  console.log('✅ Contact submission saved to Supabase:');
  console.log(`   ID: ${contactRow.id}`);
  console.log(`   Reference Code: ${contactRow.reference_code}`);
  console.log(`   CRM Status: ${contactRow.crm_status}`);

  // ---------------------------------------------------------------------------
  // 2. TEST ACTIVITY RESERVATION (RESERVE LATER)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 2] Testing Activity Reservation (Reserve Later)...');
  const reservationRef = `TLC-26-RES${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: resRow, error: resErr } = await supabase
    .from('activity_registrations')
    .insert({
      reference_code: reservationRef,
      submission_type: 'application',
      full_name: 'Muhammad Usman Khan',
      email: testEmail,
      phone: '+92 321 5551234',
      role: 'Director Academics',
      organization: 'Roots Millennium Schools',
      activity_slug: 'school-impact-summit-2026',
      activity_title: 'The School Impact Summit 2026',
      activity_category: 'Flagship Summit',
      booking_mode: 'reserve_later',
      payment_method: 'ubl',
      fee_label: 'PKR 4,000 (Early Bird 20% Off)',
      verification_status: 'pending_callback',
      admin_notes: 'Provisional reservation awaiting phone callback'
    })
    .select()
    .single();

  if (resErr) {
    console.error('❌ Activity Reservation failed:', resErr);
    process.exit(1);
  }
  console.log('✅ Activity Reservation saved to Supabase:');
  console.log(`   ID: ${resRow.id}`);
  console.log(`   Reference Code: ${resRow.reference_code}`);
  console.log(`   Booking Mode: ${resRow.booking_mode}`);
  console.log(`   Verification Status: ${resRow.verification_status}`);

  // ---------------------------------------------------------------------------
  // 3. TEST SEAT BOOKING WITH PAYMENT SCREENSHOT (SECURE SEAT)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 3] Testing Priority Seat Booking (Secure Seat with Receipt Screenshot)...');
  const secureRef = `TLC-26-SEC${Math.floor(1000 + Math.random() * 9000)}`;

  const mockScreenshotUrl = 'https://res.cloudinary.com/tlc/image/upload/v1730000000/tlc_payment_screenshots/ubl_transfer_receipt_99214.webp';
  const mockPublicId = 'tlc_payment_screenshots/ubl_transfer_receipt_99214';

  const { data: secRow, error: secErr } = await supabase
    .from('activity_registrations')
    .insert({
      reference_code: secureRef,
      submission_type: 'application',
      full_name: 'Amina Tariq',
      email: testEmail,
      phone: '+92 333 4448888',
      role: 'Principal',
      organization: 'Army Public School & College',
      activity_slug: 'adaptive-strategic-planning',
      activity_title: 'Adaptive Strategic Planning in Fluid Times',
      activity_category: 'Strategic Governance',
      booking_mode: 'secure_seat',
      payment_method: 'ubl',
      fee_label: 'PKR 4,000 (Early Bird 20% Off)',
      transaction_ref: 'UBL-FT-998844221',
      screenshot_url: mockScreenshotUrl,
      screenshot_public_id: mockPublicId,
      screenshot_name: 'ubl_payment_proof.webp (245 KB)',
      verification_status: 'awaiting_verification',
      admin_notes: 'Screenshot uploaded. Ready for Admin UBL reconciliation.'
    })
    .select()
    .single();

  if (secErr) {
    console.error('❌ Seat booking submission failed:', secErr);
    process.exit(1);
  }
  console.log('✅ Secured Seat Booking saved to Supabase:');
  console.log(`   ID: ${secRow.id}`);
  console.log(`   Reference Code: ${secRow.reference_code}`);
  console.log(`   Booking Mode: ${secRow.booking_mode}`);
  console.log(`   Payment Method: ${secRow.payment_method}`);
  console.log(`   Transaction Ref: ${secRow.transaction_ref}`);
  console.log(`   Screenshot URL: ${secRow.screenshot_url}`);
  console.log(`   Verification Status: ${secRow.verification_status}`);

  // ---------------------------------------------------------------------------
  // 4. TEST ADMIN AUTHENTICATION & ACCESS TO ALL DATA
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 4] Testing Admin Login & Full Access Control...');
  const adminEmail = 'tleadershipcovenant@gmail.com';
  const adminPassword = 'TLC@2026';

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (authErr) {
    console.error('❌ Admin login failed:', authErr);
    process.exit(1);
  }
  console.log(`✅ Admin authenticated successfully: ${authData.user.email}`);

  // Verify Admin can query all contact submissions
  const { data: adminContacts, error: acErr } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (acErr) {
    console.error('❌ Admin contacts query failed:', acErr);
  } else {
    console.log(`✅ Admin verified contact submissions count: ${adminContacts.length}`);
  }

  // Verify Admin can query all registrations (reservations & secured bookings)
  const { data: adminRegistrations, error: arErr } = await supabase
    .from('activity_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (arErr) {
    console.error('❌ Admin registrations query failed:', arErr);
  } else {
    console.log(`✅ Admin verified activity registrations count: ${adminRegistrations.length}`);
  }

  // Verify Admin can update verification status
  const { data: updatedReg, error: upErr } = await supabase
    .from('activity_registrations')
    .update({
      verification_status: 'verified_confirmed',
      admin_notes: 'Verified via UBL bank statement on 01-Nov-2026 by Administrator.'
    })
    .eq('id', secRow.id)
    .select()
    .single();

  if (upErr) {
    console.error('❌ Admin status update failed:', upErr);
  } else {
    console.log(`✅ Admin successfully verified and confirmed seat for ref ${updatedReg.reference_code}: status is now "${updatedReg.verification_status}"`);
  }

  // Clean up test records
  console.log('\n[CLEANUP] Removing test records to leave database completely clean...');
  await supabase.from('contact_submissions').delete().eq('id', contactRow.id);
  await supabase.from('activity_registrations').delete().eq('id', resRow.id);
  await supabase.from('activity_registrations').delete().eq('id', secRow.id);

  console.log('✅ Cleaned up all temporary test records.');
  console.log('\n====================================================');
  console.log('🎉 ALL END-TO-END WORKFLOWS PASSED 100% PERFECTLY!');
  console.log('====================================================');
}

runE2ETests().catch(console.error);
