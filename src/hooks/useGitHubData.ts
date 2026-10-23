"use client";

import { useEffect, useState } from "react";
import { activityDotsGenerator, stats as defaultStats } from "../data/homepageData/HeroData";
import { projects as defaultProjects, type Project } from "../data/projects";

interface GitHubUser {
  public_repos: number;
  updated_at?: string;
  name?: string;
}

interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: {
    commits?: Array<{ message: string; sha: string }>;
    size?: number;
  };
}

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  language: string | null;
}

type GithubSnapshot = {
  user?: GitHubUser | null;
  events?: GitHubEvent[];
  repos?: GitHubRepo[];
};

export function useGitHubData() {
  const [activityDots, setActivityDots] = useState<number[]>(activityDotsGenerator());
  const [stats, setStats] = useState(defaultStats);
  const [statusText, setStatusText] = useState("Services & Network Active");
  const [projects, setProjects] = useState<Project[]>(defaultProjects);

  useEffect(() => {
    let isMounted = true;
    const GITHUB_USERNAME = "osama95uh";

    async function fetchGitHub() {
      try {
        // Try to read from session cache first to prevent refetching every visit
        const cached = typeof window !== "undefined" ? sessionStorage.getItem("gh_cache_" + GITHUB_USERNAME) : null;
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 1000 * 60 * 15) { // 15 mins cache
              if (isMounted) {
                if (parsed.activityDots) setActivityDots(parsed.activityDots);
                if (parsed.stats) setStats(parsed.stats);
                if (parsed.statusText) setStatusText(parsed.statusText);
                if (parsed.projects) setProjects(parsed.projects);
              }
              return;
            }
          } catch {
            // ignore cache parse error
          }
        }

        /**
         * Fetch user data / events / repos via the site's own GitHub proxy
         * (src/app/api/github/route.ts). The server caches the upstream
         * responses for 10 minutes, so visitors never burn GitHub's hourly
         * rate limit and the site keeps working when GitHub is throttling.
         * All the computation below stays exactly the same as before.
         */
        const proxyRes = await fetch("/api/github", { cache: "no-store" });
        if (!proxyRes.ok) {
          // Proxy unreachable/rate-limited and no cached snapshot: use fallbacks.
          if (isMounted) setProjects(defaultProjects);
          return;
        }
        const snapshot = (await proxyRes.json()) as GithubSnapshot;

        const userData: GitHubUser | null = snapshot.user ?? null;
        const eventsData: GitHubEvent[] = snapshot.events ?? [];
        const reposData: GitHubRepo[] = snapshot.repos ?? [];

        const publicRepos =
          typeof userData?.public_repos === "number" ? userData.public_repos : 8;

        // 2. Events for commits and live activity
        let calculatedCommits = 0;
        const dayCounts: Record<string, number> = {};
        let latestPushTime: Date | null = null;

        eventsData.forEach((evt) => {
          if (evt.type === "PushEvent" && evt.created_at) {
            const dateKey = evt.created_at.split("T")[0];
            const commitsCount = evt.payload?.commits?.length || evt.payload?.size || 1;
            dayCounts[dateKey] = (dayCounts[dateKey] || 0) + commitsCount;
            calculatedCommits += commitsCount;

            const evtDate = new Date(evt.created_at);
            if (!latestPushTime || evtDate > latestPushTime) {
              latestPushTime = evtDate;
            }
          }
        });

        // 3. Generate 35-day grid (7 columns x 5 rows) matching user's actual pushes
        const computedDots: number[] = [];
        const now = new Date();
        for (let i = 34; i >= 0; i--) {
          const targetDay = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = targetDay.toISOString().split("T")[0];
          const count = dayCounts[dateStr] || 0;

          let level = 0;
          if (count >= 4) level = 3;
          else if (count >= 2) level = 2;
          else if (count >= 1) level = 1;
          computedDots.push(level);
        }

        // 4. Update Stats
        const newStats = [
          { label: "Projects", value: `${publicRepos}+` },
          { label: "Commits", value: `${calculatedCommits > 0 ? calculatedCommits : "14"}+` },
          { label: "YoE", value: "1yr" },
        ];

        // 5. Update Status Text based on GitHub activity
        let newStatus = "Services & Network Active";
        if (latestPushTime) {
          const diffHours = Math.floor((now.getTime() - (latestPushTime as Date).getTime()) / (1000 * 60 * 60));
          if (diffHours < 24) {
            newStatus = "GitHub: Active Today • Operational";
          } else if (diffHours < 48) {
            newStatus = "GitHub: Active Yesterday • Operational";
          } else {
            const daysAgo = Math.floor(diffHours / 24);
            newStatus = `GitHub: Active (${daysAgo}d ago) • Operational`;
          }
        }

        // 6. Projects: CMS (Supabase) first, GitHub repo enrichment as fallback
        let updatedProjects = [...defaultProjects];

        try {
          const projectsRes = await fetch("/api/projects", { cache: "no-store" });
          if (projectsRes.ok) {
            const projectsData = (await projectsRes.json()) as {
              source: "database" | "static";
              projects: Project[];
            };
            if (projectsData.source === "database" && Array.isArray(projectsData.projects)) {
              // Admin-managed projects are the single source of truth.
              updatedProjects = projectsData.projects.map((p) => ({
                ...p,
                // Fall back to the local illustration while the CMS image is not set
                image: p.image || (defaultProjects.find((d) => d.id === p.id)?.image ?? ""),
              }));
            }
          }
        } catch {
          // keep static list on failure
        }

        // Only enrich with GitHub repo data when using the static list (CMS
        // projects carry their own github link managed from the admin panel).
        const branchRepo = reposData.find((r) =>
          r.name.toLowerCase().includes("branch-office") ||
          r.name.toLowerCase().includes("cisco")
        );

        if (branchRepo) {
          updatedProjects = updatedProjects.map((proj) => {
            if (proj.id === "branch-office-network" && !proj.github) {
              return {
                ...proj,
                github: branchRepo.html_url,
              };
            }
            return proj;
          });
        }

        if (isMounted) {
          setActivityDots(computedDots);
          setStats(newStats);
          setStatusText(newStatus);
          setProjects(updatedProjects);

          // Save to sessionStorage cache
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "gh_cache_" + GITHUB_USERNAME,
              JSON.stringify({
                timestamp: Date.now(),
                activityDots: computedDots,
                stats: newStats,
                statusText: newStatus,
                projects: updatedProjects,
              })
            );
          }
        }
      } catch (err) {
        console.warn("GitHub live sync fallback:", err);
      }
    }

    fetchGitHub();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    activityDots,
    stats,
    statusText,
    projects,
  };
}
