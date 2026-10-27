# ROADMAP

> Phased goals. Structure: phases are ordered, but nothing moves to the next
> phase without the owner's explicit approval. Last updated: **2026-10-23**

---

## ✅ Phase 0 — Frontend foundation (done)

Next.js 16 + React 19 + Tailwind 4 dark-terminal portfolio: Hero terminal,
About, pinned Projects stack, Timeline, Tech marquee, Contact.

## ✅ Phase 1 — Backend + CMS + tracking (done)

- Supabase: `projects` CMS table (RLS, service-role only), `visitor_logs`,
  `project-images` storage bucket
- Public feed API + ISR detail pages; graceful static fallback
- Invisible server-side tracking proxy (GEO + UA + bot detection, no client JS)
- `/admin`: password login (HMAC cookie, rate-limited), project CRUD,
  image upload, visitors dashboard

## ✅ Phase 2 — Mobile performance (done)

- Mid-range emulated scroll FPS **4.7 → ~25-36** (4× CPU throttle)
- Lite rendering paths: no GSAP pin ≤1023px, canvas/WebGL/blur/animation budget
  cuts, tab-hidden pause — PC render pixel-verified unchanged
- Copy thinning (projects + about) synced across code, DB and schema seed

## ✅ Phase 3 — Publish-readiness + Admin UX v2 (done today)

- Admin panel cleanup: dedicated shell (no site chrome), modal editor,
  unsaved-changes guard, styled delete dialog, search, live-view links,
  visitors auto-refresh + CSV export
- SEO pack: favicon/apple-icon, robots.txt, sitemap.xml, OG/Twitter metadata,
  per-project metadata, theme-color
- Branded 404 + error boundary; docs set (STATUS/ARCHITECTURE/DESIGN/API/ROADMAP/CHANGELOG)

## 🔜 Phase 4 — Deployment (immediate next)

1. Git + GitHub push (repo creation)
2. Vercel import + env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`)
3. Domain + DNS; HTTPS via Vercel
4. Owner real-device mobile sanity pass
5. Post-deploy smoke: `/`, project detail, `/admin` login, `/api/projects`,
   tracking counters moving in admin

## Phase 5 — Content growth (after go-live)

- Publish the two "coming soon" labs as real case studies
  (`features/challenges/improvements` already modeled in the CMS)
- OG share image (1200×630) + Lighthouse run on production
- Optionally: GitHub repos → projects auto-sync (the `/api/github` proxy and
  `useGitHubData` already exist and can drive it)

## Phase 6 — Nice-to-haves (backlog)

- Morning digest or export email of visitor stats
- Draft/publish flag separate from `coming_soon` in the CMS
- Scheduled/automated DB backups of the `projects` table
- CSP / security headers pass; dependency prune (`daisyui`,
  `@next/bundle-analyzer`, unused `puppeteer` dev tooling on release builds)

### Explicitly parked (owner decision)

- Education/qualifications content enrichment — cancelled by owner (2026-10)
