# Backend Setup Guide (Supabase CMS + Tracking + Admin Panel)

Portfolio site-এ এখন একটা backend যুক্ত হয়েছে। **Public site-এর design,
structure, animation — কিছুই change হয়নি।** Backend বন্ধ থাকলেও site একদম
আগের মতোই চলবে (fallback সব জায়গায় আছে)।

## কী কী হলো

| Feature | Status |
|---|---|
| GitHub Stats Proxy | ✅ ব্রাউজার আর সরাসরি GitHub call করে না; `/api/github` server-side cache (10 min) থেকে serve করে |
| Project CMS | ✅ সব project এখন Supabase (Postgres) থেকে। Admin panel থেকে Add / Edit / Delete / Coming Soon toggle |
| Admin Panel | ✅ `/admin` — password-protected (HttpOnly signed cookie, 7 days, brute-force protected) |
| Image Upload | ✅ Admin panel থেকে file upload (Supabase Storage) **বা** URL paste |
| Visitor Tracking | ✅ প্রতি real page load, server-side: IP, country/city/**GEO coordinates** (lat, lon), timezone, ISP, browser/OS/device, referer, bot detection, anonymous visitor id |
| Contact section | ✅ **অপরিবর্তিত** (তোমার বলা অনুযায়ী কিছুই লাগবে না) |
| Site structure | ✅ **একটা pixel-ও change হয়নি** — শুধু data-র উৎস বদলেছে |

## Setup Steps (মোট ২টা)

### Step 1 — Supabase project তৈরি করো

1. https://supabase.com এ login → **New project** (free tier)
2. Project Settings → **API** এ যাও, ২টা জিনিস কপি করো:
   - `Project URL` → এটা `SUPABASE_URL`
   - `service_role` secret key → এটা `SUPABASE_SERVICE_ROLE_KEY`
   (⚠️ **anon** key নয় — অবশ্যই **service_role**)

### Step 2 — Schema run করো

1. `.env.local` এ (local) রাখো আর Vercel এ Project Settings → Environment
   Variables এ রাখো। সাথে একটা নতুন password দাও `ADMIN_PASSWORD=`
   এবং (optional) `GITHUB_TOKEN=`
2. Supabase Dashboard → **SQL Editor** → New query → `supabase-schema.sql`
   ফাইলের পুরো content paste করে **Run** করো।
   - এতে `projects`, `visitor_logs` টেবিল, `project-images` storage bucket
     তৈরি হবে, এবং এখনকার ৩টা project seed হবে — তাই site
     সাথে সাথে **হুবহু আগের মতোই** দেখাবে।

ব্যাস। Dev server restart (`npm run dev`) দাও, তারপর:
- Site খুলে দেখো — সব আগের মতো
- `/admin` এ password দিয়ে login করো
- Admin এ VISITORS tab এ live tracking দেখতে পারবে
  (নিজে নিজের site-এ ঢুকে refresh দিলেই row আসবে)

## Admin Panel

- URL: `/admin`
- Login: `ADMIN_PASSWORD` এর value
- **VISITORS tab:** stat cards (total/human/today/week visits, unique IPs,
  unique visitors, bots), top countries, cities, pages, referrers,
  browsers, OS, devices, ISP + searchable recent-visitor log সময়সহ
  (Dhaka timezone)। Geo point গুলো Google Maps link হিসেবে clickable।
- **PROJECTS tab:** list. প্রতি item এ `set_soon/unset_soon` (Coming Soon
  toggle), `edit`, `delete`। `+ new_project` দিয়ে নতুন project — title,
  slug (URL auto-generate হয়), description, image (URL **বা** upload),
  tech (comma separated), features/challenges/improvements (one per line),
  github/live URL, order, coming soon checkbox।
- Edit করলে public site সাথে সাথে update হয় (detail page ~30s এ)।

## Tracking System কীভাবে কাজ করে

- `src/proxy.ts` প্রতিটা আসল page load ধরে (prefetch/bot asset বাদ) আর
  `waitUntil` দিয়ে background-এ 🔕 সাইলেন্টলি `/api/track` এ পাঠায় —
  visitor-এর response কোনোভাবেই slow হয় না।
- `/api/track` → Vercel geo header থাকলে সেটা, নাহলে IP থেকে
  ip-api.com lookup (result server memory-তে cache হয়) → `visitor_logs`
  টেবিলে insert।
- Bot detection আছে (crawler/curl/semrush ইত্যাদি `BOT` badge পাবে)।
- প্রতি visitor একটা anonymous `sk_vid` cookie পায় — কোনো personal data
  collect করা হয় না, শুধু সার্ভার সাইড থেকে available info।
- Privacy note: log-এ real IP/location থাকে — admin panel এ-ই দেখাও, বাইরে
  কোথাও expose হয় না (RLS enabled, সব read শুধু service key দিয়ে)।

## Fullstack Diagram (কোথায় কী)

```
src/
├── proxy.ts                     ← tracking observer (new)
├── lib/
│   ├── supabase.ts              ← service-role client (new)
│   ├── admin-auth.ts            ← admin session/HMAC (new)
│   ├── geo.ts                   ← IP→GEO lookup cache (new)
│   └── db-projects.ts           ← DB ↔ frontend bridge (new)
├── app/api/
│   ├── github/route.ts          ← GitHub proxy (new)
│   ├── projects/route.ts        ← public CMS feed (new)
│   ├── track/route.ts           ← tracking beacon (new)
│   └── admin/                   ← login/logout/projects/upload/visitors (new)
├── admin/page.tsx               ← admin UI (new)
└── hooks/useGitHubData.ts       ← এখন নিজের proxy call করে (edited)

supabase-schema.sql              ← run করার SQL (new)
.env.example / .env.local        ← keys (new)
```

## Notes

- Deploy → Vercel এ env vars দেওয়ার পর redeploy করতে হবে।
- `/api/track` ও tracking সব সময় silent fails করে — Supabase বন্ধ থাকলেও
  কোনো error বা slowdown নেই।
- `failed login` admin login এ rate-limited (৮ চেষ্টা / ১০ মিনিট / IP)।
- `ADMIN_PASSWORD` বদলালে পুরোনো সব admin session সাথে সাথে invalid।
