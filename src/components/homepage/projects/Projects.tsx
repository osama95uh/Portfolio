"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { projects as defaultProjects, type Project } from "@/src/data/projects";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineFolder, HiOutlineExternalLink } from "react-icons/hi";

export default function Projects({ initialProjects }: { initialProjects?: Project[] }) {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects || defaultProjects);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync if initialProjects is provided
    if (initialProjects && initialProjects.length > 0) {
      setProjectList(initialProjects);
      return;
    }

    // Otherwise fetch fresh from backend
    fetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjectList(data.projects);
        }
      })
      .catch(() => {});
  }, [initialProjects]);

  // Ensure activeIndex is always within range
  useEffect(() => {
    if (activeIndex >= projectList.length && projectList.length > 0) {
      setActiveIndex(0);
    }
  }, [projectList.length, activeIndex]);

  const handleSelectProject = (index: number) => {
    if (index === activeIndex || isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 250);
  };

  const handlePrev = () => {
    if (isTransitioning || projectList.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === 0 ? projectList.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 250);
  };

  const handleNext = () => {
    if (isTransitioning || projectList.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev === projectList.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 250);
  };

  const activeProject: Project | undefined = projectList[activeIndex] || projectList[0];

  return (
    <section id="projects" className="relative bg-black min-h-screen py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
      {/* MATRIX GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#22c55e_1px,transparent_1px),linear-gradient(to_bottom,#22c55e_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* AMBIENT RADIAL GLOW */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12)_0%,rgba(16,185,129,0.02)_50%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="section-label mb-2 text-xs tracking-widest text-emerald-400 font-mono">
            --- PORTFOLIO_LABS ---
          </p>
          <h2 className="section-title font-mono tracking-tight text-2xl sm:text-3xl lg:text-4xl text-white font-bold">
            NETWORK_LAB_ARCHIVE
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed text-xs sm:text-sm font-mono">
            Collection of enterprise networking labs, infrastructure topologies, and real-world network operational case studies.
          </p>

          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse delay-100" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/30 animate-pulse delay-200" />
          </div>
        </div>

        {/* NODE SELECTOR TABS (Interactive Cyber Station) */}
        {projectList.length > 1 && (
          <div className="mb-6 flex items-center justify-between gap-3 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-w-0 flex-1">
              {projectList.map((project, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={project.id || idx}
                    onClick={() => handleSelectProject(idx)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all flex items-center gap-2 border whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                        : "bg-zinc-950/80 border-zinc-800 text-gray-400 hover:text-gray-200 hover:border-zinc-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-600"}`} />
                    <span className="font-bold">NODE_{String(idx + 1).padStart(2, "0")}</span>
                    <span className="max-w-[120px] truncate text-[11px] opacity-80">
                      {project.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-gray-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
                title="Previous Project (Left Arrow)"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-emerald-500/80 px-1">
                {String(activeIndex + 1).padStart(2, "0")}/{String(projectList.length).padStart(2, "0")}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-gray-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
                title="Next Project (Right Arrow)"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE PROJECT CARD */}
        {activeProject ? (
          <div
            ref={cardContainerRef}
            className={`transition-opacity duration-200 ${
              isTransitioning ? "opacity-75 scale-[0.995]" : "opacity-100 scale-100"
            }`}
          >
            <div className="group relative overflow-hidden bg-zinc-950 border border-emerald-500/30 rounded-2xl shadow-2xl">
              {/* SCANLINES OVERLAY */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(0,255,120,0.08)_3px)]" />

              <div className="relative z-10 grid lg:grid-cols-[400px_1fr] min-h-[440px]">
                {/* LEFT IMAGE / TOPOLOGY PREVIEW */}
                <div className="relative min-h-[260px] sm:min-h-[300px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-emerald-500/20 overflow-hidden bg-black/60">
                  <Image
                    src={activeProject.image}
                    alt={activeProject.title}
                    fill
                    unoptimized={activeProject.image.endsWith(".svg") || activeProject.image.startsWith("http")}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-transparent to-black/30" />

                  {activeProject.comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                      <span className="border border-emerald-400/50 bg-black/90 px-4 py-2 font-mono text-sm font-bold tracking-[0.25em] text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        COMING SOON
                      </span>
                    </div>
                  )}

                  {/* NODE BADGE */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <div className="px-2.5 py-1 border border-emerald-500/40 bg-black/85 backdrop-blur-md rounded">
                      <p className="text-[10px] font-mono tracking-[2px] text-emerald-400 font-bold">
                        NODE_{String(activeIndex + 1).padStart(2, "0")}
                      </p>
                    </div>
                  </div>

                  {/* STATUS INDICATOR */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2 px-2.5 py-1 bg-black/85 border border-emerald-500/20 rounded backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] uppercase tracking-[2px] text-emerald-300 font-mono">
                      {activeProject.comingSoon ? "AWAITING DEPLOYMENT" : "OPERATIONAL"}
                    </p>
                  </div>
                </div>

                {/* RIGHT TERMINAL CONTENT */}
                <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-zinc-950 font-mono">
                  <div>
                    {/* TERMINAL BAR */}
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-5">
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                      <p className="text-[10px] tracking-[2px] uppercase text-emerald-400/80">
                        SSH://node-{activeProject.id || activeIndex + 1}.lab
                      </p>
                    </div>

                    {/* PROJECT TITLE */}
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[3px] text-emerald-500/70 mb-1.5">
                        PROJECT IDENTIFIER
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {activeProject.comingSoon ? (
                          activeProject.title
                        ) : (
                          <Link href={`/projects/${activeProject.id}`}>
                            {activeProject.title}
                          </Link>
                        )}
                      </h3>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mb-6">
                      <p className="text-gray-200 leading-relaxed text-xs sm:text-sm font-sans">
                        {activeProject.description}
                      </p>
                    </div>

                    {/* TECH STACK */}
                    {!activeProject.comingSoon && activeProject.tech && activeProject.tech.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-[2px] text-emerald-500/70 mb-2">
                          CONFIGURED PROTOCOLS & TOOLS
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activeProject.tech.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-emerald-500/20 pt-5 mt-4">
                    <div className="flex items-center gap-3">
                      {activeProject.github && (
                        <a
                          href={activeProject.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-emerald-500/30 text-emerald-400 text-xs uppercase tracking-wider hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 rounded"
                        >
                          <HiOutlineExternalLink className="w-4 h-4" />
                          SOURCE_CODE
                        </a>
                      )}
                    </div>

                    {activeProject.comingSoon ? (
                      <span className="border border-emerald-500/30 px-4 py-2 text-center text-xs uppercase tracking-wider text-emerald-400 bg-emerald-500/5 rounded">
                        &gt; COMING_SOON
                      </span>
                    ) : (
                      <Link
                        href={`/projects/${activeProject.id}`}
                        className="px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 text-xs uppercase tracking-widest transition-all text-center rounded font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        &gt; INSPECT_LAB_DETAILS
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto border border-emerald-500/30 bg-zinc-950 p-8 text-center rounded-xl font-mono">
            <HiOutlineFolder className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base text-emerald-300 font-bold">
              NO LAB PROJECTS FOUND
            </h3>
            <p className="mt-2 text-gray-400 text-xs">
              Add new projects from the admin dashboard to populate this section.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}