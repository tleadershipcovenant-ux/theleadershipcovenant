# Data Model & API Specification

Backend assumed: Supabase (Postgres + RLS + Edge Functions). Adapt SQL if another database is chosen.

## 1. Entities

| Table | Purpose |
|---|---|
| `events` | Activities shown on Home strip, Activities grid, Summit |
| `submissions` | All form entries (application, summit, contact) |
| `admin_profiles` | Who is allowed into `/admin` |
| `audit_log` | Admin changes (optional but recommended) |

## 2. SQL Schema

```sql
-- ENUMS
create type event_category as enum (
  'professional_development','lim_community','wellness','leaderu',
  'family_session','summit','student_camp','open_session'
);
create type submission_type as enum ('application','summit','contact');
create type submission_status as enum ('new','contacted','confirmed','waitlisted','declined','spam');

-- EVENTS
create table public.events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  category      event_category not null,
  description   text not null,
  city          text not null,
  location_note text,                       -- e.g. 'Swat, KPK • Dec 18–20, 2026'
  start_date    date not null,
  end_date      date not null,
  status_label  text not null,              -- e.g. 'Open enrollment'
  status_tone   text not null default 'open' check (status_tone in ('open','limited','free','closed')),
  has_detail_page boolean not null default false,
  detail_path   text,                       -- '/summit'
  is_featured   boolean not null default false,
  is_published  boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (end_date >= start_date)
);
create index events_published_date_idx on public.events (is_published, end_date);

-- SUBMISSIONS
create table public.submissions (
  id            uuid primary key default gen_random_uuid(),
  type          submission_type not null,
  full_name     text not null check (char_length(full_name) between 2 and 120),
  email         text not null check (char_length(email) <= 254),
  phone         text,
  role          text,
  organization  text,
  activity_slug text references public.events(slug) on update cascade,
  interest      text,
  message       text check (char_length(message) <= 2000),
  consent       boolean not null default false,
  status        submission_status not null default 'new',
  ip_hash       text,                       -- salted hash, never raw IP
  user_agent    text,
  created_at    timestamptz not null default now()
);
create index submissions_type_created_idx on public.submissions (type, created_at desc);

-- ADMINS
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','editor','viewer'))
);

-- AUDIT
create table public.audit_log (
  id bigserial primary key,
  actor uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id text,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.events enable row level security;
alter table public.submissions enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.audit_log enable row level security;

-- Public can read published events only
create policy "events_public_read" on public.events
  for select using (is_published = true);

-- Admin helper
create or replace function public.is_admin(min_role text default 'viewer')
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_profiles
    where user_id = auth.uid()
      and (min_role = 'viewer'
           or (min_role = 'editor' and role in ('editor','owner'))
           or (min_role = 'owner'  and role = 'owner'))
  );
$$;

create policy "events_admin_write" on public.events
  for all using (public.is_admin('editor')) with check (public.is_admin('editor'));

-- Submissions: NO public insert/select. Inserts happen only via Edge Function (service role).
create policy "submissions_admin_read" on public.submissions
  for select using (public.is_admin('viewer'));
create policy "submissions_admin_update" on public.submissions
  for update using (public.is_admin('editor'));

create policy "admin_profiles_self_read" on public.admin_profiles
  for select using (user_id = auth.uid());
create policy "audit_admin_read" on public.audit_log
  for select using (public.is_admin('owner'));
```

## 3. Seed Data — Events

| slug | title | category | city | start | end | status_label | detail_path |
|---|---|---|---|---|---|---|---|
| `7-habits` | 7 Habits of Highly Effective People | professional_development | Islamabad | 2026-07-19 | 2026-07-19 | Open enrollment | — |
| `4dx-for-educators` | 4 Disciplines of Execution for Educators | professional_development | Islamabad | 2026-08-29 | 2026-08-29 | Early-bird open | — |
| `lim-community-2026` | LiM Community Event 2026 | lim_community | Islamabad | 2026-10-03 | 2026-10-03 | Free • RSVP required | — |
| `neuroscience-wellness` | Neuro Science Backed Wellness | wellness | Peshawar | 2026-10-08 | 2026-10-08 | Seats limited | — |
| `leaderu-find-your-voice` | Find Your Voice — LeaderU Session | leaderu | Islamabad | 2026-10-22 | 2026-10-22 | Open enrollment | — |
| `7-habits-families` | 7 Habits of Highly Effective Families | family_session | Islamabad | 2026-11-07 | 2026-11-07 | Family passes available | — |
| `teacher-believed-in-me` | Teacher Believed in Me | professional_development | Islamabad | 2026-11-14 | 2026-11-14 | Open enrollment | — |
| `school-impact-summit-2026` | The School Impact Summit | summit | Islamabad | 2026-11-28 | 2026-11-28 | Open enrollment | `/summit` |
| `leadership-camp-swat-2026` | Leadership Camp | student_camp | Swat | 2026-12-18 | 2026-12-20 | Applications open | — |

> The live site shows month/day only for most events. The **year 2026** is inferred from the Summit (28 Nov 2026) and Camp (Dec 18–20, 2026). **Confirm the years with the client** — see `13-OPEN-QUESTIONS.md`. Descriptions are in `content/04-activities.md`.

Camp: `location_note = 'Swat, KPK • Dec 18–20, 2026'`, `city = 'Swat'`.

## 4. API Contract

### `POST /functions/v1/submit-form`

Single endpoint, discriminated by `type`.

**Request (JSON)**

```ts
type Base = {
  type: "application" | "summit" | "contact";
  full_name: string;          // 2–120
  email: string;              // valid, ≤254
  consent?: true;             // required for application + summit
  turnstileToken: string;     // required
  website?: string;           // HONEYPOT — must be empty
};

type Application = Base & {
  type: "application";
  phone: string;              // E.164-tolerant, 7–20 chars
  role: string;               // 2–80
  activity_slug: string;      // must exist in events
  message?: string;           // ≤ 2000
};

type Summit = Base & {
  type: "summit";
  phone: string;
  role: string;
  organization: string;       // 2–160
  message?: string;
};

type Contact = Base & {
  type: "contact";
  organization: string;
  interest: "general"|"leader-in-me"|"leaderu"|"professional-development"
          |"leadership-camps"|"family-sessions"|"open-sessions"|"podcast"|"partnership";
  message: string;            // 10–2000
};
```

**Responses**

| Status | Body | Meaning |
|---|---|---|
| 201 | `{ "ok": true, "id": "<uuid>" }` | Saved + email queued |
| 400 | `{ "ok": false, "errors": { field: "msg" } }` | Validation failure |
| 403 | `{ "ok": false, "error": "captcha_failed" }` | Turnstile failed or origin not allowed |
| 409 | `{ "ok": false, "error": "duplicate" }` | Same email + type + activity within 10 min |
| 429 | `{ "ok": false, "error": "rate_limited", "retryAfter": 60 }` | Too many requests |
| 500 | `{ "ok": false, "error": "server_error" }` | Generic (no internals leaked) |

**Server steps (in order)**
1. Check `Origin` ∈ `ALLOWED_ORIGINS`.
2. Enforce `Content-Type: application/json`, body ≤ 10 KB.
3. Honeypot: if `website` non-empty → return fake 201, discard.
4. Verify Turnstile token server-side.
5. Rate limit (per IP-hash: 5/10 min; per email: 3/hour).
6. Validate with shared Zod schema; strip/normalize whitespace; reject control chars.
7. Insert via service role (parameterized).
8. Send team notification email (+ optional auto-reply). Escape all values in the email HTML.
9. Return generic JSON.

### Events read

`select * from events where is_published and end_date >= current_date order by start_date` (anon key, RLS-protected).

## 5. Email Templates

**Team notification — Subject:** `[TLC] New {type}: {full_name}`
Body: table of submitted fields (HTML-escaped), timestamp, admin link.

**Auto-reply — Subject:**
- application: `We received your application — The Leadership Covenant`
- summit: `You're on the list — The School Impact Summit 2026`
- contact: `Thanks for reaching out — The Leadership Covenant`

Body (draft, requires client approval): thanks, "We reply within one working day" (contact) / "Applications are reviewed within 24 hours" (application), signature block with contact details from `content/00-global.md`.

## 6. Admin Views (v1.1)

| View | Capabilities |
|---|---|
| Events | List, create, edit, publish/unpublish, reorder |
| Submissions | Filter by type/status/date, change status, export CSV |
| Users | Owner can invite editors/viewers |
