# PROJECT_STATUS

> Single source of truth for "where the project is right now".
> Last updated: **2026-10-23** · Local branch state: single working directory, **not yet a git repo**

---

## ✅ What the project is

The personal portfolio of **Siam Khan** (IT Support / Junior Network Engineer / TSE):

- **Public site (Next.js 16)** — animated terminal-style single-page portfolio
  (Hero terminal, About, Projects with GSAP pinned card stack, Timeline,
  Tech-logos marquee, Contact) + dynamic detail pages at `/projects/:id`
- **Backend (Supabase)** — projects CMS + invisible server-side visitor tracking
- **Admin panel (`/admin`)** — password login; manage projects, upload images,
  view visitor analytics with live data

Everything below is **done and verified locally** (production build green,
all routes smoke-tested).

## 🟢 Current state (verified)

| Area | Status | Notes |
|---|---|---|
| Public site (PC) | ✅ Stable | Pixel-diff verified after every change batch |
| Public site (mobile) | ✅ Optimized | Scroll FPS **4.7 → ~25-36** at 4× CPU throttle; pin/scrub off ≤1023px |
| Supabase CMS | ✅ Live | 3 projects seeded; `/api/projects` serves `source:"database"` |
| Visitor tracking | ✅ Live | Proxy → `/api/track`, GEO/UA/bot enrichment, 265+ rows logged |
| Admin panel | ✅ v2 UX | Clean shell, modal editor, styled confirms, CSV export, auto-refresh |
| SEO basics | ✅ Done | favicon + apple-icon, robots.txt, sitemap.xml, OG/Twitter meta, per-project metadata |
| Resilience | ✅ Done | Branded 404, crash-safe error boundary, graceful Supabase degradation |
| Build | ✅ Clean | `npm run build` passes; zero console errors on `/`, project page, `/admin` |

## 📌 Immediate tasks (before first publish)

1. **Create a git repo + first commit** — the project is still not under git.
   `.env*` is already ignored by `.gitignore` (safe to commit).
2. **Push to GitHub** (repo URL needed from the owner) — prerequisite for Vercel.
3. **Import into Vercel** + set environment variables (see `.env.example`):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL=https://<final-domain>` (makes sitemap/OG URLs absolute)
4. **Connect the domain** (DNS → Vercel → Domains).
5. **Real-device mobile test** after deploy (emulation is done; hardware feel differs).

## 🟡 Known minor items (non-blocking)

- `daisyui` + `@next/bundle-analyzer` are installed but not referenced in code —
  candidates for removal (small deploy-size win).
- `staticProjects` import in `Projects.tsx` is unused (pre-existing lint nit).
- README.md still says "no environment variables required" — outdated since the
  backend landed; update on the next docs pass.
- OG share image (1200×630) is text-only metadata — a composed image is optional polish.

## ⛔ Explicitly out of scope (owner decision)

- Education/qualifications content enrichment (Phase 3 of the perf plan) — cancelled.
- No deployment action is taken without the owner's go-ahead.

## how to run locally

```bash
npm ci            # installs deps
npm run build     # must pass
npm start         # http://localhost:3000 (prod build)
# /admin login password lives in .env.local (ADMIN_PASSWORD)
```
