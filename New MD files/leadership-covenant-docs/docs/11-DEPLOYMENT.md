# Deployment & Operations

## 1. Environments

| Env | Purpose | URL | Data |
|---|---|---|---|
| Local | Development | `localhost:5173` | Supabase local/dev project |
| Preview | Per-PR deploys | auto-generated | Dev project |
| Production | Live | custom domain | Prod project |

Use **separate Supabase projects** and keys per environment.

## 2. Hosting Options

| Host | Notes |
|---|---|
| **Vercel** | Easy previews, headers via `vercel.json` |
| **Netlify** | `_headers`, forms alternative, great DX |
| **Cloudflare Pages** | Free tier strong, Turnstile + CDN in one place |

Pick one; all support SPA fallback + custom headers.

## 3. Build & Deploy Steps

```bash
npm ci
npm run typecheck && npm run lint && npm run test
npm run build            # outputs dist/ (prerendered public routes)
```

1. Push to `main` → CI runs → host deploys.
2. Apply DB migrations: `supabase db push` (prod project) — review SQL first.
3. Deploy Edge Functions: `supabase functions deploy submit-form`.
4. Set function secrets: `supabase secrets set TURNSTILE_SECRET_KEY=… RESEND_API_KEY=… NOTIFY_EMAIL=… ALLOWED_ORIGINS=…`.
5. Seed events (`supabase/seed.sql` from `05-DATA-MODEL-AND-API.md`).
6. Create first admin user (invite) + insert into `admin_profiles` as `owner`; enroll MFA.

## 4. Domain & DNS

- Register/point the custom domain; enable HTTPS (auto certs), force HTTPS, HSTS.
- Choose canonical host (apex vs `www`) and redirect the other.
- Email DNS: SPF, DKIM (from provider), DMARC (`v=DMARC1; p=none; rua=mailto:…` then tighten).
- Enable registrar lock + 2FA.

## 5. Migration From the Lovable Preview URL

1. Export/download all images from the Lovable assets and R2 OG image; optimize and commit to `public/` or `src/assets/`.
2. Replace Lovable asset URLs (`/__l5e/assets-v1/...`) with local paths.
3. Remove the "Edit with Lovable" badge/script.
4. Set the new canonical URL + OG URLs.
5. Optional: keep the old URL redirecting (or leave until DNS cutover) and set `noindex` on it to avoid duplicate content.

## 6. Monitoring & Maintenance

| Task | Frequency |
|---|---|
| Uptime check (`/`, form health) | 1–5 min |
| Review Sentry errors | Weekly |
| Update events (add new, archive old) | As scheduled — monthly review |
| Dependency updates | Weekly (Dependabot), apply monthly |
| Backup restore test | Quarterly |
| Security review (`SECURITY.md` checklist) | Quarterly |
| Submission data retention purge | Monthly job |

## 7. Rollback

- Hosting: redeploy previous successful build (one click).
- Database: migrations must be reversible or backward-compatible; keep a `down` note for each.
- Edge Function: redeploy previous commit.

## 8. Launch Checklist

- [ ] Production env vars set; no dev keys.
- [ ] Domain + HTTPS + redirects verified.
- [ ] Sitemap submitted to Search Console.
- [ ] OG preview verified in WhatsApp / LinkedIn / Facebook.
- [ ] All 3 forms tested live; email received at `theleadershipcovenant@gmail.com`.
- [ ] Analytics receiving events (no PII).
- [ ] Privacy page live.
- [ ] Security + QA gates passed.
- [ ] Client sign-off recorded.
