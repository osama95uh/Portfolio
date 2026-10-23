import { NextResponse } from "next/server";

/**
 * GitHub Stats Proxy.
 *
 * The frontend used to call api.github.com directly from the browser, which
 * meant every visitor shared GitHub's 60 requests/hour anonymous quota and
 * stats only appeared after hydration. This server-side proxy:
 *   - fetches user / events / repos ONCE for all visitors
 *   - keeps the snapshot in memory for 10 minutes
 *   - serves the last known good snapshot if GitHub is down or rate-limits
 *
 * The hook useGitHubData() consumes the same three payloads as before, so all
 * activity dots / stats / status text computations stay identical.
 */

export const dynamic = "force-dynamic";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "osama95uh";
const CACHE_TTL_MS = 10 * 60 * 1000;

type GithubUser = {
  public_repos?: number;
};

type GithubEvent = {
  type?: string;
  created_at?: string;
  payload?: {
    commits?: Array<{ message: string; sha: string }>;
    size?: number;
  };
};

type GithubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  language: string | null;
};

type Snapshot = {
  user: GithubUser | null;
  events: GithubEvent[];
  repos: GithubRepo[];
};

let cache: { snapshot: Snapshot | null; fetchedAt: number } = {
  snapshot: null,
  fetchedAt: 0,
};
let inflight: Promise<Snapshot> | null = null;

const GH_HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "siam-khan-portfolio",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function fetchSnapshot(): Promise<Snapshot> {
  const [userRes, eventsRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: GH_HEADERS,
      cache: "no-store",
    }),
    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`,
      { headers: GH_HEADERS, cache: "no-store" },
    ),
    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`,
      { headers: GH_HEADERS, cache: "no-store" },
    ),
  ]);

  if (!userRes.ok && !eventsRes.ok && !reposRes.ok) {
    throw new Error(`GitHub upstream failed (user: ${userRes.status})`);
  }

  const user = userRes.ok ? ((await userRes.json()) as GithubUser) : null;
  const events = eventsRes.ok ? ((await eventsRes.json()) as GithubEvent[]) : [];
  const repos = reposRes.ok ? ((await reposRes.json()) as GithubRepo[]) : [];
  return { user, events, repos };
}

export async function GET() {
  const now = Date.now();

  if (cache.snapshot && now - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      username: GITHUB_USERNAME,
      ...cache.snapshot,
      cached: true,
      fetchedAt: cache.fetchedAt,
    });
  }

  try {
    inflight ??= fetchSnapshot().finally(() => {
      inflight = null;
    });
    const snapshot = await inflight;
    cache = { snapshot, fetchedAt: Date.now() };
    return NextResponse.json({
      username: GITHUB_USERNAME,
      ...snapshot,
      cached: false,
      fetchedAt: cache.fetchedAt,
    });
  } catch (err) {
    // Serve the previous snapshot if we have one, regardless of age.
    if (cache.snapshot) {
      return NextResponse.json({
        username: GITHUB_USERNAME,
        ...cache.snapshot,
        cached: true,
        stale: true,
        fetchedAt: cache.fetchedAt,
      });
    }
    return NextResponse.json(
      { error: "github_upstream_unavailable", detail: String(err) },
      { status: 502 },
    );
  }
}
