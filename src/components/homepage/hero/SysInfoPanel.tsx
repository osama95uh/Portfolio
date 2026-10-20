"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { activityDotsGenerator, dotColors, skills } from "@/src/data/homepageData/HeroData";
import { useClock, useUpTime } from "@/src/hooks/homepageHooks/HeroHooks";
import { useLoaderDone } from "../../common/LoaderWrapper";
import gsap from "gsap";

interface TelemetryData {
  maskedIp: string;
  country: string;
  city: string;
  isp: string;
  protocol: string;
  securityStatus: string;
}

interface GitHubData {
  publicRepos: number;
  totalCommits: number;
  activityDots: number[];
}

export function SysInfoPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const loaderDone = useLoaderDone();
  const time = useClock();
  const uptime = useUpTime();
  const defaultDots = useMemo(() => activityDotsGenerator(), []);

  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [gitHubData, setGitHubData] = useState<GitHubData | null>(null);

  // Ingest visitor telemetry and GitHub data
  useEffect(() => {
    // Telemetry fetch
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTelemetry({
            maskedIp: data.maskedIp,
            country: data.country,
            city: data.city,
            isp: data.isp,
            protocol: data.protocol,
            securityStatus: data.securityStatus,
          });
        }
      })
      .catch((e) => console.warn("Telemetry fetch fallback:", e));

    // GitHub live sync
    fetch("/api/github")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGitHubData({
            publicRepos: data.publicRepos,
            totalCommits: data.totalCommits,
            activityDots: data.activityDots,
          });
        }
      })
      .catch((e) => console.warn("GitHub fetch fallback:", e));
  }, []);

  useEffect(() => {
    if (!loaderDone) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.4 }
    );
  }, [loaderDone]);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  return (
    <div ref={panelRef} className="opacity-0 w-full font-mono text-xs">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-gray-900/80 to-black/80 px-4 py-2 border border-emerald-500/30 border-b-0 rounded-t-lg flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="flex-1 text-center text-emerald-400/70">
          system@monitor:~
        </span>
        <div className="w-14" />
      </div>

      {/* Panel Body */}
      <div className="backdrop-blur-md bg-black/50 border border-emerald-500/30 rounded-b-lg p-5 space-y-4">
        {/* System Info Block */}
        <div>
          <p className="text-emerald-400 mb-2">$ neofetch --minimal</p>
          <div className="ml-4 space-y-1 text-gray-300">
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">OS</span>
              <span>Cisco-IOS / pfSense NetCore</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">Kernel</span>
              <span>FreeBSD 14.0-RELEASE-p6</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">Shell</span>
              <span>tmux 3.4</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">Clock</span>
              <span className="text-emerald-300 tabular-nums">
                {time || "00:00:00"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">Uptime</span>
              <span className="text-emerald-300 tabular-nums">
                {formatUptime(uptime)}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">Status</span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Monitoring Traffic</span>
              </span>
            </div>

            {/* Live Visitor Ingested Telemetry */}
            {telemetry && (
              <>
                <div className="flex gap-2 pt-1 border-t border-emerald-500/10">
                  <span className="text-emerald-500 w-16 shrink-0">Node IP</span>
                  <span className="text-emerald-300 font-bold">{telemetry.maskedIp}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-500 w-16 shrink-0">Location</span>
                  <span className="truncate">{telemetry.city ? `${telemetry.city}, ` : ""}{telemetry.country}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-500 w-16 shrink-0">Network</span>
                  <span className="text-emerald-300">{telemetry.securityStatus} • {telemetry.protocol}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-emerald-500/20" />

        {/* Skill Bars */}
        <div>
          <p className="text-emerald-400 mb-3">$ htop --skills</p>
          <div className="ml-4 space-y-2">
            {skills.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-gray-400 w-28 shrink-0">{s.name}</span>
                <div className="flex-1 h-2 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/40">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-emerald-500/20" />

        {/* Activity Grid (Live GitHub Sync) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-emerald-400">$ git log --activity</p>
            {gitHubData && (
              <span className="text-[10px] text-emerald-500/60 font-mono">
                synced with @{gitHubData.publicRepos ? "osama95uh" : ""}
              </span>
            )}
          </div>
          <div className="ml-2 sm:ml-4">
            <div className="overflow-x-auto overflow-y-hidden pb-1">
              <div className="grid grid-cols-[repeat(35,1fr)] gap-[2px] sm:gap-[3px] min-w-[260px]">
                {(gitHubData?.activityDots || defaultDots).map((level, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-[2px] ${dotColors[level]}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-gray-600 text-[10px] sm:text-xs">
              <span>5 weeks ago</span>
              <span>today</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-emerald-500/20" />

        {/* Stats Row (Dynamic GitHub Repos & Commits) */}
        <div>
          <p className="text-emerald-400 mb-3">$ stats --projects</p>
          <div className="ml-4 grid grid-cols-3 gap-3">
            {[
              {
                label: "Projects",
                value: gitHubData ? `${gitHubData.publicRepos}+` : "3+",
              },
              {
                label: "Commits",
                value: gitHubData ? `${gitHubData.totalCommits}+` : "25+",
              },
              { label: "YoE", value: "1yr" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-emerald-500/5 border border-emerald-500/20 rounded-md p-2 text-center"
              >
                <div className="text-emerald-300 text-base font-bold">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-[10px] mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}