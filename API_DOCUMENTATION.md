# API_DOCUMENTATION

> All HTTP routes, methods, request/response shapes and status codes.
> Base: same origin. All JSON endpoints are dynamic (`dynamic = "force-dynamic"`).
> Last updated: **2026-10-23**

---

## Auth model (shared by all `/api/admin/*`)

- Login issues the HttpOnly cookie **`sk_admin_session`** (HMAC-signed expiry,
  7-day TTL, `SameSite=Lax`, `Secure` in production).
- Every admin route checks it first → `401 {"error":"unauthorized"}` when absent/expired.
- If Supabase env vars are missing server-side, authed routes return
  `503 {"error":"Supabase is not configured on the server."}`.

---

## Public routes (no auth)

### `GET /api/projects`

Public projects feed (homepage + detail pages consume this pattern).

- `200` `{ source: "database" | "static", projects: Project[] }`
- `Project` shape: `{ id, title, image, description, tech[], features?[], challenges?[],
  improvements?[], github?, live?, comingSoon? }`
- `source:"database"` when Supabase is configured (even if the table is empty),
  otherwise the built-in static dataset.

### `GET /api/github`

Server-side GitHub stats proxy (user + events + latest repos).

- Query env: `GITHUB_USERNAME` (fallback `osama95uh`), optional `GITHUB_TOKEN`.
- **In-memory cache 10 min**; single-flight; serves last-known-good snapshot
  when GitHub is down/rate-limited (stale flag).
- `200` `{ username, user, events[], repos[], cached, stale?, fetchedAt }`
- `502` `{ error: "github_upstream_unavailable", detail }` (only if no cached snapshot)

### `POST /api/track`

Internal beacon — fired by `src/proxy.ts` in the background (`event.waitUntil`),
never called from the browser nor called with delay. Receives:
`{ path, method, ip, userAgent, referer, language, visitorId, countryCode?, city?, latitude?, longitude? }`

- Enriches with ip-api GEO (6 h per-IP cache, private IPs skipped), UA parsing
  (browser/OS/device/bot) → inserts one row into `visitor_logs`.
- Responses are informational only: `200 {ok:true}`, `503` unconfigured, `500` DB error.

---

## Admin auth

### `POST /api/admin/login`

Request: `{ "password": "…" }` (JSON body)

| Status | When |
|---|---|
| `200` | `{ok:true}` + `Set-Cookie: sk_admin_session=…` |
| `400` | invalid JSON |
| `401` | `{error:"Wrong password."}` (constant-time compare) |
| `429` | `{error:"Too many failed attempts. Try again later."}` — in-memory limiter, 8 fails / 10 min / IP |
| `503` | `ADMIN_PASSWORD` not set on the server |

### `POST /api/admin/logout`

`200 {ok:true}` + clearing cookie (`Max-Age=0`). No auth required.

---

## Admin projects CRUD

### `GET /api/admin/projects`

`200 { projects: Row[] }` sorted by `sort_order asc, created_at asc`.

`Row` (raw DB shape, snake_case):
```
{ id: uuid, slug, title, description?, image_url?, tech[], features[],
  challenges[], improvements[], github_url?, live_url?, coming_soon,
  sort_order, created_at, updated_at }
```

### `POST /api/admin/projects`

Body (all fields optional except `title`; arrays of strings; unknown extras ignored):
```
{ slug?, title*, description?, image_url?, tech?, features?, challenges?,
  improvements?, github_url?, live_url?, coming_soon?, sort_order? }
```
Server normalizes: slug → lowercase/kebab; missing slug → `400` (the admin UI
auto-generates from the title before sending).

- `201 {ok:true, project:{id, slug}}`
- `400` `{error:"Title is required."}` / `"Slug is required…"` / invalid body
- `409` duplicate slug (`{error:"Slug \"x\" already exists. Choose another one."}`)
- `401` / `500` / `503` (see Auth model)

### `PUT /api/admin/projects/:id`

`id` = row UUID. Full replacement body (the admin panel always sends the complete
field set — there is no PATCH endpoint).
Responses: `200 {ok:true, project:{id, slug}}` · `400` slug missing ·
`404` `{"error":"Project not found."}` · `409` duplicate on *another* row ·
`401`/`500`/`503`.

### `DELETE /api/admin/projects/:id`

`200 {ok:true}` (idempotent — unknown ids still answer `200`, nothing deleted) ·
`401`/`500`/`503`.

---

## Admin upload & analytics

### `POST /api/admin/upload`

`multipart/form-data`, field **`file`**. Supabase Storage bucket
**`project-images`** (auto-created as public if missing, 5 MB limit).

- Allowed: `png, jpeg, webp, gif, svg+xml, avif`
- Objects stored as `<timestamp>-<sanitized-name>.<ext>` (name slugified, ≤60 chars)
- `201 { url: "https://…supabase.co/storage/v1/object/public/project-images/…", path }`
- `400` no/invalid file · `400` bad MIME (`"Only PNG, JPEG, WEBP…"` from `ALLOWED_TYPES`)
  · `413` file > 5 MB · `401`/`500`/`503`

### `GET /api/admin/visitors`

`200`:
```
{
  stats: {
    totalVisits, humanVisits, totalBots, todayVisits, weekVisits,
    uniqueIps, uniqueVisitors,
    topCountries/cities/paths/browsers/os/devices/referrers/isp:
      [ { key: string, value: number }, … ]   // top 10 each
  },
  rows: VisitorRow[],   // newest first, max 1000 (FETCH_LIMIT)
  limit: 1000
}
```
`VisitorRow`: `{ id, created_at, visitor_id, path, ip, browser, os, device,
is_bot, referer, accept_language, country, country_code, region, city,
latitude, longitude, timezone, isp, org, proxy_host, hosting }`
(`500` on DB error; `401`/`503` as usual.)

---

## Cookies set by the framework (not API)

| Cookie | Set by | Purpose |
|---|---|---|
| `sk_vid` | `src/proxy.ts` | anonymous persistent visitor id (2y, non-HttpOnly so the admin UI can display it) |
| `sk_admin_session` | login/logout routes | admin session (HttpOnly) |

## Server-side components/pages (not HTTP docs, for completeness)

- `/` — home (static shell + client hydration, falls back at build)
- `/projects/:id` — ISR `revalidate: 30`; `notFound()` → styled 404
- `/admin` — client-side session probe fires against `GET /api/admin/visitors`
  (`200` ⇒ authed, `401` ⇒ show login, `503` ⇒ authed + config error banner)
- `/robots.txt`, `/sitemap.xml`, `/icon.png`, `/apple-icon.png` — framework routes
