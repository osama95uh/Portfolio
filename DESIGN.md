# DESIGN

> UI patterns, styling rules, and responsive/perf behavior. Follow these so new
> code matches the existing look. Last updated: **2026-10-23**

---

## Visual identity

| Token | Value |
|---|---|
| Theme | Dark terminal / "network operations" aesthetic — near-black surfaces with emerald accents |
| Accent color | Emerald `#10b981` family (`emerald-300/400/500`), amber for "coming soon"/warnings, red for danger/delete |
| Surfaces | `bg-black`, `black/60-80` translucent panels, `zinc-950` (detail pages, admin) |
| Borders | `border-emerald-500/20 … /50` (hairlines always low-opacity emerald, never gray on green areas) |
| Typography | **Geist** (sans) + **Geist Mono** via `next/font` — mono for all labels, terminal text, buttons |
| Label style | Uppercase, wide tracking: `text-xs uppercase tracking-[2px]` / `tracking-widest` / `tracking-[3px]` |
| Terminal chrome | Window dots (red/yellow/green rounded-full), `$` / `>` prompts, scanlines, blinking cursor |
| Glow language | Emerald radial `blur-[80px]…blur-[200px]` fixed glows; box-glow utilities like `glow-emerald` |
| No-scanline rule | Decorative overlays use repeating-linear-gradient at 0.02–0.08 opacity only |

## Component patterns

- **Cards** — `border border-emerald-500/20` panels, internal padding `p-4 sm:p-5 lg:p-6 xl:p-7`,
  corner accent chips (`NODE_01`, `OPERATIONAL`, `SECURE_SHELL` badges)
- **Buttons** — mono uppercase, emerald hairline, `hover:bg-emerald-500/10`;
  primary CTA = filled `bg-emerald-500/10 border-emerald-500/40` (the site has no solid-fill buttons)
- **Section headers** — small emerald kicker label above a big `SNAKE_CASE` mono heading,
  followed by the `timeline-dot animate-pulse ×3` divider
- **Roundedness** — public site mostly sharp/`rounded-md`…`xl` mix (terminal feel);
  admin panel (2026-10 v2) uses `rounded-2xl` cards/modals consistently
- **Data pills (tech stack)** — hairline emerald chips, ≤2 lines, wrap in flex

## Animation system (what runs where)

| Effect | PC (≥1024px, fine pointer) | Mobile/touch ("lite") |
|---|---|---|
| Lenis smooth scroll | on (`syncTouch` default off → native touch) | same setup; touch is native anyway |
| Projects section | GSAP **pin + scrub** card stack with progress dots | **normal vertical flow** (`isLite`), no pin, dots hidden |
| FallingNumbers canvas | 45 particles, full DPR, 60 fps, delta-time movement | 12 particles, ~30 fps (skip 2nd frames), DPR ≤ 1.5, pauses on `document.hidden` |
| LightRays (ogl WebGL) | continuous rAF loop | first frames render, then loop cancelled (static rays) |
| Blur glows (root layout) | `blur-[200px]` | `blur-[90px]` |
| Scanlines / glitch overlays | animate | **frozen** — `@media (max-width: 768px)` sets `animation: none` (`.animate-scanlines`, `.animate-glitch*`, `.tech-scanlines`, `.tech-glitch-line-*`) |

Lite detection: `matchMedia("(max-width: 1023px), (pointer: coarse)")`.
**Rule: mobile-only changes must be class flips or matchMedia branches — the PC
render path must stay byte-identical (verified by pixel-diff).**

reduced-motion: `@media (prefers-reduced-motion: reduce)` handled in globals.css;
CustomCursor is also gated by `(hover: hover) and (pointer: fine)`.

## Tailwind usage rules

- Tailwind **v4** (CSS-first config via `@import "tailwindcss"` in globals.css) —
  no `tailwind.config.js`
- Arbitrary values allowed (e.g. `w-[500px]`, `opacity-[0.04]`, `bg-[linear-gradient(...)]`)
  but keep a defined accent scale: emerald hairlines + black surfaces
- `h-full antialiased` on `<html>`; background gradient is per-body
  (`bg-linear-to-b from-black via-gray-900 to-black`)
- Keep responsive step order: mobile default → `sm:` → `lg:` → `xl:` (never desktop-first `max-lg:`)

## Admin panel (v2 UX conventions)

- Same emerald-on-dark identity, but **friendlier**: rounded-2xl cards, icon tabs
  (VISITORS / PROJECTS / site↗ / logout), search inputs, pill toggles
- Destructive actions use the styled `ConfirmDialog` (danger red), never
  `window.confirm`
- Editor = full-screen modal with section headers (`— basic info`, `— content`),
  sticky footer with `● unsaved changes` indicator, cancel/discard guard
- Feedback: inline `! error` red boxes and auto-clearing green notices (4 s)
- No site chrome loads on `/admin` (route group separation) — keep it that way.

## Copy style

- Titles/labels in `SNAKE_CASE` mono (`PROJECT_IDENTITIES`, `VISITOR_INTEL`)
- Body copy short and factual; sentences end with the takeaway, not filler
- User-facing English only; admin notice text lowercase terminal style
  (`project updated ✓`)
