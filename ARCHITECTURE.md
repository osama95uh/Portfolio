# ARCHITECTURE

> How the system is designed, the data flow, and the folder hierarchy.
> Last updated: **2026-10-23**

---

## High-level design

```
              ┌───────────────────────────── Browser ─────────────────────────────┐
              │  Visitor                                    Owner                 │
              │  (public site)                              (/admin panel)        │
              └──────────────┬─────────────────────────────────┬─────────────────┘
                             │ HTML/JSON                       │ fetch (session cookie)
   ┌─────────────────────────▼─────────────────────────────────▼─────────────────┐
   │                        Next.js 16 server (Node 20.9+)                       │
   │                                                                             │
   │  proxy.ts ────────────► /api/track ──── visitor_logs ◄── /api/admin/visitors│
   │  (skips /admin, /api,        (background    (Supabase                       │
   │  prefetch, static; waitUntil) POST)           table)                        │
   │                                                                             │
   │  (site) route group          ┌── /api/projects ────── projects ◄───┐        │
   │  ├ /                 │       ├── /api/admin/projects  CRUD  │        │        │
   │   ├ /projects/[id]           ├── /api/admin/upload (storage) ┘        │        │
   │  └ loader/curseur/lenis      ├── /api/github  (10min cache proxy)     │        │
   │                              └── /api/admin/login|logout (HMAC cookie)│        │
   └─────────────┬───────────────────────────────────────────────────────────────┘
                 │ service_role key (server-only)
   ┌─────────────▼───────────────────────────────┐
   │ Supabase                                    │
   │  - table: projects      (RLS, no anon read) │
   │  - table: visitor_logs  (RLS, no anon read) │
   │  - bucket: project-images (public read)     │
   └─────────────────────────────────────────────┘
```

### Core design principles

1. **Server-only secrets.** The service key and admin password live only in
   route handlers / `src/lib`, never in client bundles. `supabase.ts`
   explicitly forbids client imports.
2. **Graceful degradation.** With Supabase unconfigured, the public site
   serves the built-in static dataset (`src/data/projects.ts`) and the UI is
   visually unchanged; `/api/track` no-ops. Nothing crashes.
3. **Zero-change frontend surface.** The same `Project` shape (`slug`, `title`,
   `description`, `image`, `tech[]`, `features[]`, `challenges[]`,
   `improvements[]`, `github`, `live`, `comingSoon`) is used everywhere.
4. **No client JS for tracking.** Page views are observed in `src/proxy.ts`
   (server-side) and posted in the background via `event.waitUntil`, so
   tracking never delays LCP.
5. **Mobile performance is a rendering-path concern.** Heavy effects (GSAP pin,
   WebGL loop, canvas particle count, blur radius, infinite CSS animations)
   are gated by media queries / `matchMedia` instead of code forks that would
   change the PC render.

## Request flows

**Public reading a project:** `(site)/projects/[id]` (ISR, `revalidate: 30`)
→ `getProjectById` in `lib/db-projects.ts` → Supabase by slug → fallback to
static dataset → `notFound()` if neither has it.

**Admin edit:** `/admin` UI → `PUT /api/admin/projects/[id]` (session cookie
verified by `isAdminAuthenticated`) → Supabase upsert (409 on duplicate slug)
→ homepage ISR revalidates within ≤30 s.

**Tracking:** `proxy.ts` matcher matches everything except `/api`, `/_next`, static files
and `/admin` → assigns/reads the `sk_vid` cookie → POST `/api/track`
with path/IP/UA/referer/lang/geo-hints → geo enrichment via **ip-api.com**
(cached 6 h per IP, private IPs skipped) → one row into `visitor_logs`.

**Auth:** `ADMIN_PASSWORD` → HMAC-signed token derived from a SHA-256 of the
password itself (changing the password instantly invalidates all sessions)
→ HttpOnly cookie `sk_admin_session`, 7-day TTL, `SameSite=Lax`, Secure in prod,
brute-force limiter (8 tries / 10 min / IP).

## Route groups (why `/admin` is clean)

- `src/app/layout.tsx` — html/body, fonts, `<metadata>`, **no site chrome**
- `src/app/(site)/…` — the public site: adds Navbar, Loader, CustomCursor,
  Lenis smooth scroll, ScrollProgress, FallingNumbers, background glows
- `src/app/admin` — no chrome at all (fast, distraction-free shell)
- `src/app/api/…` — route handlers (dynamic)
- `src/app/not-found.tsx` + `error.tsx` + `robots.ts` + `sitemap.ts`
- `src/app/icon.png` / `apple-icon.png` — favicon

## Folder hierarchy

```
SIAM V1/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # root: fonts, metadata, html/body only
│  │  ├─ globals.css           # Tailwind 4 + custom animations + mobile-perf block
│  │  ├─ icon.png/apple-icon.png/page conventions (favicon, robots, sitemap, not-found, error)
│  │  ├─ (site)/               # PUBLIC SITE (chrome lives in (site)/layout.tsx)
│  │  │  ├─ layout.tsx         # Navbar, Loader, Cursor, Lenis, ScrollProgress, glows
│  │  │  ├─ page.tsx           # home: Hero → About → Projects → Timeline → Tech → Contact
│  │  │  └─ projects/[id]/page.tsx   # detail page, ISR 30 s, generateMetadata
│  │  ├─ admin/page.tsx        # admin shell -> <AdminApp/> (no global chrome)
│  │  └─ api/                  # route handlers — see API_DOCUMENTATION.md
│  │     ├─ projects/            GET  public feed
│  │     ├─ track/               POST beacon (internal from proxy)
│  │     ├─ github/              GET proxied GitHub snapshot
│  │     └─ admin/               login/logout/upload/visitors/projects CRUD
│  ├─ components/
│  │  ├─ admin/ (AdminApp, AdminLogin, ProjectsPanel, VisitorsPanel, adminTypes)
│  │  ├─ common/ (Navbar, Loader(W), CustomCursor, FallingNumbers, LenisProvider, ScrollProgress, SheenCard)
│  │  ├─ homepage/
│  │  │  ├─ hero/ (Hero, HeroTerminal, HeroDescriptionButtons, SysInfoPanel, LightRays*)
│  │  │  ├─ about/ (About, AboutContent, AboutImage, BioCard, LeftColumn, RightColumn, ExpandableText)
│  │  │  ├─ projects/Projects.tsx      # GSAP pin+scrub on PC; lite flow ≤1023px
│  │  │  ├─ TimeLine/ (Timeline, EduCard, SkillCard, TabSwitcher, TimelineNode)
│  │  │  ├─ tech-logos/ (TechLogos, LogoLoop, TechLogos.css)
│  │  │  └─ contacts/ (Contact, Contact.css)
│  │  └─ homepageAnimation/ + data/homepageData/   # gsap timelines, page copy
│  ├─ data/projects.ts         # static fallback dataset + Project type
│  ├─ hooks/useGitHubData.ts   # consumes /api/github (sessionStorage cached)
│  ├─ lib/ (supabase, admin-auth, db-projects, geo)
│  └─ proxy.ts                 # tracking proxy + sk_vid cookie + matcher
├─ scripts/                    # dev-only tooling (perf-shots, diff-pc, admin-shots)
├─ supabase-schema.sql         # full DB setup (tables + trigger + seed + notes)
├─ BACKEND-SETUP.md, .env.example, PUBLISH-CHECKLIST.md
└─ package.json                # scripts: dev / build / build:webpack / start / lint
```

## Deployment model

Same codebase targets **Vercel** (recommended: zero-config proxy/API) or a
**Node 20.9+ host** (`npm run build && npm start`); the proxy honors
`x-vercel-ip-*` headers when present and falls back to ip-api lookups otherwise.
