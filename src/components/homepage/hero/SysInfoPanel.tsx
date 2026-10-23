"use client";
import { useEffect, useRef } from "react";
import { dotColors, skills } from "@/src/data/homepageData/HeroData";
import { useClock, useUpTime } from "@/src/hooks/homepageHooks/HeroHooks";
import { useLoaderDone } from "../../common/LoaderWrapper";
import { useGitHubData } from "@/src/hooks/useGitHubData";
import gsap from "gsap";

export function SysInfoPanel() {
 
  const panelRef = useRef<HTMLDivElement>(null);
  const loaderDone = useLoaderDone();
  const time=useClock();
  const uptime = useUpTime();
  const { activityDots, stats: liveStats, statusText } = useGitHubData();
  

  useEffect(() => {
    if (!loaderDone) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.4 },
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
              <span>Linux &amp; Windows Server</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">Kernel</span>
              <span>Ubuntu 22.04 LTS</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-500 w-16 shrink-0">Shell</span>
              <span>bash 5.2 / PowerShell</span>
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
                <span className="text-emerald-300">{statusText}</span>
              </span>
            </div>
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

        {/* Activity Grid */}
        <div>
          <p className="text-emerald-400 mb-3">$ git log --activity</p>
          <div className="ml-4">
            <div className="grid grid-cols-[repeat(35,1fr)] gap-[3px]">
              {activityDots.map((level, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-[2px] ${dotColors[level]}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-gray-600">
              <span>5 weeks ago</span>
              <span>today</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-emerald-500/20" />

        {/* Stats Row */}
        <div>
          <p className="text-emerald-400 mb-3">$ stats --projects</p>
          <div className="ml-4 grid grid-cols-3 gap-3">
            {liveStats.map((stat) => (
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