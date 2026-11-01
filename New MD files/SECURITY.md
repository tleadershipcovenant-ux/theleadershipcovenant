# SECURITY.md — The Leadership Covenant Website

> Audience: Antigravity agents + human developers.
> Baseline: **OWASP ASVS Level 1** (aim for L2 on admin + submission handling), OWASP Top 10 (2021).
> This site is a public marketing site that **collects personal data** (names, emails, phone numbers, organizations) through three forms. Treat that data as sensitive.

---

## 1. Threat Model (short)

| Asset | Threat | Impact | Primary controls |
|---|---|---|---|
| Form submissions (PII) | Unauthorized read, data leak | Privacy breach, reputational harm | RLS, no public SELECT, service-role-only inserts, encryption, admin auth |
| Form endpoint | Spam / bot flood / DoS | Inbox flooding, cost | Honeypot, Turnstile, rate limit, size limits |
| Email pipeline | Header/HTML injection, phishing relay | Abuse of org's mail | Escape output, fixed recipients, no user-controlled headers |
| Admin panel | Credential stuffing, privilege escalation | Full data exposure | MFA, RBAC, session hardening |
| Frontend | XSS, supply-chain compromise | Account/data compromise | CSP, no `dangerouslySetInnerHTML`, dependency hygiene |
| Secrets | Leaked keys in repo/bundle | Backend takeover | Env separation, secret scanning |
| Domain / DNS | Hijack, spoofed email | Brand impersonation | Registrar lock, SPF/DKIM/DMARC |

---

## 2. Secrets & Configuration

- **Never** commit `.env`, API keys, service-role keys, SMTP passwords. Commit only `.env.example`.
- Only values prefixed `VITE_` (or `NEXT_PUBLIC_`) reach the browser. Treat them as **public**.
- `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` live **only** in Edge Function / server secrets.
- Enable GitHub secret scanning + push protection; add `gitleaks` to CI.
- Rotate any key that was ever pasted into a chat, log, or screenshot.
- Different keys per environment (dev / preview / prod).

## 3. Input Validation & Output Encoding

- Validate **server-side** with the shared Zod schemas (`docs/06-FORMS-SPEC.md`). Client validation is UX only.
- Enforce max lengths, trim, normalize, reject control characters.
- Use parameterized queries / the Supabase client only. **No string-built SQL.**
- Escape all user values in emails (HTML-escape; prefer plain-text parts). Never place user input into email headers (`To`, `Subject` fixed or sanitized of CR/LF).
- React escapes by default: **never use `dangerouslySetInnerHTML`** with user data. If rich text is ever needed, sanitize with DOMPurify.
- Links built from data (e.g., event `detail_path`) must be internal-path allow-listed (`/^\/[a-z0-9\-\/]*$/`) to prevent `javascript:` URLs.

## 4. Form & API Abuse Protection

| Control | Setting |
|---|---|
| Honeypot field | `website` hidden; non-empty → silently discard |
| Cloudflare Turnstile | Required on all 3 forms; verified **server-side** |
| Rate limit | 5 submissions / 10 min per IP-hash; 3 / hour per email |
| Body size | ≤ 10 KB |
| Origin check | `Origin`/`Referer` ∈ `ALLOWED_ORIGINS` |
| CORS | Only the production + preview origins; no `*` |
| Duplicate guard | Same email + type + activity within 10 min → 409 |
| Method/content-type | POST + `application/json` only |
| Error messages | Generic; never leak stack traces, SQL, or keys |

## 5. Database Security (Supabase/Postgres)

- **RLS enabled on every table.** Default deny.
- `submissions`: **no public SELECT/INSERT policies.** Inserts only through the Edge Function using the service role.
- `events`: public SELECT limited to `is_published = true`.
- Admin access via `is_admin()` helper with role levels (owner / editor / viewer).
- Store **IP hashes** (salted, rotating salt) — never raw IPs.
- Backups: daily automated + PITR if available; test restore quarterly.
- Retention: delete/anonymize submissions after **24 months** (or per client policy); provide deletion on request.
- Encryption: TLS in transit; provider-managed encryption at rest.

## 6. Authentication & Admin

- Admin only at `/admin`; `noindex, nofollow`; excluded from sitemap.
- Supabase Auth with **email + password + mandatory MFA (TOTP)** for admins. No self-signup (invite-only).
- Strong password policy; breach-password check enabled.
- Session: short-lived JWT, refresh rotation, secure/httpOnly cookies where the stack allows; logout everywhere on role change.
- RBAC enforced **server-side (RLS)**, not just by hiding UI.
- Audit log for create/update/delete on events and status changes on submissions.
- Admin CSV export: owner/editor only; log every export.

## 7. HTTP Security Headers

Set on the host (Vercel `vercel.json` / Netlify `_headers` / Cloudflare):

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Content-Security-Policy: default-src 'self';
  script-src 'self' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com https://www.google.com/maps/;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests
```

> Tighten `style-src` (remove `'unsafe-inline'`) if the build can emit nonces/hashes. Add analytics hosts only if used. Adjust `frame-src` if a map embed is added.

## 8. External Links & Embeds

- All `target="_blank"` links: `rel="noopener noreferrer"`.
- Social / LinkedIn / WhatsApp URLs are constants in `src/config/site.ts` — do not build them from user input.
- Map embed: click-to-load; `sandbox` + `referrerpolicy="no-referrer"`.
- Self-host fonts and images (no hotlinking the Lovable R2 bucket).

## 9. Dependency & Supply-Chain Security

- Lockfile committed; `npm ci` in CI.
- Dependabot/Renovate weekly; `npm audit --omit=dev` must pass at **high/critical**.
- Minimal dependencies; no unmaintained packages.
- Pin GitHub Actions by commit SHA.
- Enable 2FA for GitHub, hosting, Supabase, registrar, email provider.
- Review any package an AI agent proposes before installing (typosquat check).

## 10. Privacy & Compliance

- Publish `/privacy` before launch: what is collected (name, email, phone, role, organization, message), why, retention, who sees it, how to request deletion, contact email.
- Consent text on application + summit forms (already in the content spec).
- Analytics: cookie-less (Plausible/Umami) preferred; otherwise consent banner.
- Never log or send form field values to analytics/Sentry (scrub PII).
- Data minimization: collect only fields in the spec.
- Align with Pakistan's data-protection requirements as they apply; confirm with counsel.

## 11. Email Security

- Configure **SPF, DKIM, DMARC** on the sending domain (start `p=none`, move to `quarantine/reject`).
- Prefer a transactional provider (Resend/Postmark) over a personal Gmail SMTP; if Gmail is used, use an **App Password**, never the account password.
- Notification recipient is fixed server-side (`NOTIFY_EMAIL`).
- Auto-replies go only to the submitted address and contain no sensitive data; throttle to prevent use as a spam relay.

## 12. Logging & Monitoring

- Sentry for frontend + Edge Function errors (PII scrubbing on).
- Alert on: spike in 4xx/5xx, Turnstile failures, rate-limit hits, new admin login, CSV export.
- Uptime monitor on `/` and the form endpoint health check.
- Keep function logs 30–90 days.

## 13. Secure Development Rules for AI Agents (Antigravity)

1. Never print, log, or hardcode secrets. Use env vars.
2. Never disable RLS, CSP, or validation "to make it work."
3. Never use `dangerouslySetInnerHTML`, `eval`, `new Function`, or `innerHTML` with dynamic data.
4. Never add a dependency without stating why; prefer built-ins.
5. Never put the service-role key in client code.
6. All new endpoints require: schema validation, rate limit, origin check, tests.
7. All new tables require: RLS policies + migration + tests.
8. If unsure about a security trade-off, stop and ask.

## 14. Pre-Launch Security Checklist

- [ ] RLS enabled on all tables; verified with anon-key tests (cannot read `submissions`).
- [ ] No secrets in repo history or client bundle (`gitleaks`, bundle grep).
- [ ] Turnstile + honeypot + rate limit working in production.
- [ ] Security headers verified (securityheaders.com ≥ A).
- [ ] CSP has no console violations on all 6 pages.
- [ ] Admin MFA enforced; no default/test accounts.
- [ ] HTTPS only, HSTS on; HTTP → HTTPS redirect.
- [ ] SPF/DKIM/DMARC pass (mail-tester ≥ 9/10).
- [ ] `/privacy` published and linked in footer + forms.
- [ ] Backups enabled; restore tested.
- [ ] `npm audit` clean at high/critical; Dependabot active.
- [ ] Error pages leak no stack traces.
- [ ] robots.txt blocks `/admin`; admin has `noindex`.
- [ ] 2FA on all service accounts.

## 15. Incident Response (minimal)

1. **Contain:** rotate keys, disable affected endpoint/admin accounts.
2. **Assess:** what data, which records, time window (use audit + function logs).
3. **Notify:** site owner immediately; affected individuals/authorities as required.
4. **Recover:** patch, restore from backup if needed.
5. **Review:** write a post-mortem; add a test/control to prevent recurrence.

## 16. Reporting a Vulnerability

Email **theleadershipcovenant@gmail.com** with subject `Security report`. Include steps to reproduce and impact. Please do not access or modify data that is not yours. We aim to acknowledge within 3 working days.
