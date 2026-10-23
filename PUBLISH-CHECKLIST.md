# Publish Checklist — Siam Khan Portfolio

## Done (local)
- [x] Mobile performance optimized (FPS 4.7 → ~25-36 @ 4x CPU throttle, PC pixel-verified unchanged)
- [x] Backend live: Supabase projects CMS + visitor tracking + admin (tested)
- [x] SEO: favicon + apple-icon, robots.txt, sitemap.xml (CMS-driven), OG/Twitter meta,
      per-project metadata, canonical URLs, theme-color
- [x] Branded 404 page + crash-safe error page (retry button)
- [x] Admin panel: clean shell (no site chrome), modal project editor,
      unsaved-changes guard, styled delete confirm, search, live "view" links,
      visitors auto-refresh + CSV export

## TODO before deploy (needs you)
1. **GitHub repo** (project is still not a git repo!)
   - Create repo on github.com → tell me the URL → I will push everything.
   - `.env.local` is git-ignored (it will NOT be pushed).
2. **Vercel import** from that repo + Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL=https://qyaoebhwlnjpdzbcvvhu.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...` (from .env.local)
   - `ADMIN_PASSWORD=kZtfy6aQhKtYro4x`
   - `NEXT_PUBLIC_SITE_URL=https://<your-final-domain>` → makes sitemap/OG URLs absolute
3. **Domain** (e.g. siamkhan.sites.bd or your choice) → Vercel → Domains → add + DNS point.
4. **After deploy**: open the live site on your phone and confirm the smooth scroll
   and projects section feel right on a real device.
5. Optional improvements (say the word and I will do them):
   - 1200x630 OG share image (thumbnail when the link is shared on FB/LinkedIn)
   - Lighthouse audit on the production URL
   - Real GitHub/email links in Contact if any need updating
