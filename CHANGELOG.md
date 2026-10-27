# CHANGELOG

> All notable changes, newest first. Format: Keep a Changelog + SemVer.
> Current version: **0.4.0** (unreleased — deploy pending)

---

## [0.4.0] — 2026-10-23 · Publish-readiness + Admin UX v2

### Added
- **Projects & Research tab** in the homepage Timeline (third tab next to
  Technical Toolkit and Education): owner-supplied record of 4 professional
  achievements — Tier-3 Data Center (NBR), Square Pharmaceuticals HA
  infrastructure, Data Center Protection & Fault Tolerance research, and LAN
  Migration & DR Setup for NBR & Border Checkpoints — rendered as alternating
  timeline cards (`ProjectCard`) with Implementation/Research badges.
- **SEO/pack**: square-padded favicon from the site logo (`icon.png`) +
  `apple-icon.png`; `robots.txt` (allows `/`, disallows `/admin` + `/api`);
  dynamic `sitemap.xml` (entries from the CMS, `coming_soon` excluded);
  root metadata upgrades — metadataBase from `NEXT_PUBLIC_SITE_URL`/`VERCEL_URL`,
  OpenGraph + Twitter cards, canonical URL, keywords, `themeColor` viewport.
- **Per-project metadata** via `generateMetadata` on `/projects/[id]`
  (own title/description/OG image + canonical).
- **Branded 404** (`not-found.tsx`, terminal-style with home/projects links) and
  **error boundary** (`error.tsx`, digest display + retry button).
- **Admin UX v2**: show/hide password toggle on login; **desktop sidebar layout**
  (≥1024px: fixed nav column with VISITORS/PROJECTS + view-site/logout pinned
  bottom, content widens to `max-w-7xl`; <1024px keeps the topbar); project rows
  wrap actions onto their own line on small screens (DELETE no longer clipped);
  projects search, per-row `view ↗` links, styled danger `ConfirmDialog`,
  full-screen editor modal (wider on XL) with unsaved-changes guard;
  visitors dashboard auto-refresh (30 s) and CSV export; rounded cards and
  sticky table header.

### Changed
- **Technical Toolkit replaced** with the owner-supplied 5-category list
  (`src/data/toolkit&edu.ts`): Networking (Cisco Switching & Routing, VLANs,
  OSPF, BGP, Firewall Management, VPN Configuration, Network Security, QoS),
  IT Infrastructure (Data Center, Disaster Recovery, LAN/WAN Architecture,
  Virtualization, Network Compliance), Simulation & Tools (Cisco Packet
  Tracer, GNS3, SolarWinds, Zabbix, MikroTik, Nmap), Programming (C, C++,
  HTML, CSS) and Operating Systems (Windows Server, Linux). The previous
  support-oriented skill items were removed (to be re-added on request).
- **Titles rebranded**: root default `Siam Khan [NOC] | IT Support & Junior
  Network Engineer | TSE`, template `%s | Siam Khan [NOC]`, `/admin` absolute
  `Siam Khan [NOC]`; SEO keywords + JSON-LD `@graph` (WebSite + Person,
  alternateName `SiamKhan` / `SiamKhan NOC` / `SiamKhan Sites`) target the
  owner's brand queries.
- **Route-group refactor**: public chrome (Navbar, Loader, CustomCursor,
  Lenis, ScrollProgress, FallingNumbers, glows) moved from the root layout into
  `src/app/(site)/layout.tsx`; `/admin` renders a clean, chrome-free shell
  (no site loader/navbar; the custom cursor is rendered by its own
  `src/app/admin/layout.tsx` since the native cursor is hidden globally).
- Root layout holds only html/body, fonts and metadata.

### Internal
- Dev tooling: `scripts/admin-shots.js` (admin UI screenshot harness) alongside
  `perf-shots.js` / `diff-pc.js`.
- `PUBLISH-CHECKLIST.md` drafted for the owner (git → Vercel → domain → test).

---

## [0.3.0] — 2026-10 · Mobile performance + copy thinning

### Changed (mobile only — PC render pixel-verified unchanged)
- Projects: GSAP pin+scrub disabled ≤1023px / coarse pointers; cards render in
  natural vertical flow, progress dots hidden, background layers `absolute`;
  pre-hydration GSAP inline styles cleared in lite mode (fixed cards 2/3 invisible).
- FallingNumbers canvas: lite build → 12 particles, ~30 fps, DPR ≤ 1.5,
  delta-time movement, full stop while `document.hidden`.
- LightRays (ogl WebGL): lite → render first frames then cancel the rAF loop.
- Root glows: `blur-[90px]` mobile / `blur-[200px]` desktop.
- globals.css: ≤768px freeze for scanlines/glitch overlays (Contact + TechLogos classes).

### Changed (content)
- Shortened project descriptions and About paragraphs (boxes/styles untouched);
  synced across `src/data/projects.ts`, the live Supabase rows and
  `supabase-schema.sql` seed.

### Internal
- Perf harness (`scripts/perf-shots.js`) + pixel-diff proof (`scripts/diff-pc.js`):
  mid-range emulated scroll FPS **4.7 → ~25-36**; PC full-page diff within
  same-code noise floor, only intended copy lines differ.
- `puppeteer`, `pixelmatch`, `pngjs` added as devDependencies.

---

## [0.2.0] — 2026-10 · Backend: CMS, tracking, admin

### Added
- Supabase integration (server-only `src/lib/supabase.ts`): `projects` CMS
  table + `visitor_logs` (schema in `supabase-schema.sql`, RLS, service-role only,
  seeded with the 3 starter projects).
- `/api/projects` (source-aware public feed), `/api/track` (GEO + UA enrichment),
  `/api/github` (10-min cache proxy with stale-while-down behavior), admin routes:
  login/logout (HMAC cookie, constant-time password, rate limiter 8/10 min),
  visitors analytics, projects CRUD (409 on duplicate slug), 5 MB image upload
  to the public `project-images` bucket.
- `src/proxy.ts`: invisible server-side tracking (`sk_vid` cookie, background
  `waitUntil` POST, skips /admin, /api, prefetch, RSC prefetch, static assets).
- `/admin` panel v1: login screen, visitor intel dashboard (stat cards +
  breakdowns + filterable log), `PROJECT_MANAGER` CRUD editor with image
  upload, coming-soon quick toggle, sort order.
- Homepage + detail pages read from the CMS with the **static dataset as
  fallback** (site stays visually identical when Supabase is off).

---

## [0.1.0] — 2026-10 · Initial frontend

- Next.js 16 + React 19 + Tailwind 4 single-page dark-terminal portfolio:
  Hero terminal (typewriter, live GitHub stats), About bio cards,
  GSAP pinned Projects card stack with progress dots, Tech/Edu Timeline,
  Tech-logo marquee, Contact section, Lenis smooth scroll, custom cursor,
  falling-numbers background, typewriter loader.
- Dynamic project detail pages `/projects/:id`.
