"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects as staticProjects } from "@/src/data/projects";
import { useGitHubData } from "@/src/hooks/useGitHubData";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressDotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { projects } = useGitHubData();

  // Mid-range/touch devices run the same cards in normal document flow
  // (no GSAP pinning) - visually it is the same stack, just scroll-native,
  // which removes the heavy scrub animation that janked on phones.
  const [isLite, setIsLite] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px), (pointer: coarse)");
    const update = () => setIsLite(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useGSAP(
    () => {
      // Lite mode: no pinning/scrub. Clear any inline GSAP styles left by the
      // pre-hydration desktop pass so every card is fully visible in flow.
      if (isLite) {
        const existing = cardsRef.current.filter(Boolean) as HTMLDivElement[];
        if (existing.length) {
          gsap.set(existing, { clearProps: "transform,opacity,zIndex" });
        }
        return;
      }

      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      const total = cards.length;
      if (!cards[0]) return;

      // Set initial positions - all cards stacked
      gsap.set(cards, {
        y: 0,
        scale: 1,
        opacity: 1,
      });

      // First card: full view on top
      gsap.set(cards[0], {
        zIndex: total,
        y: "0%",
        scale: 1,
        opacity: 1,
      });

      // Other cards: positioned below, ready to slide up
      for (let i = 1; i < total; i++) {
        gsap.set(cards[i], {
          zIndex: total - i,
          y: "100%",
          scale: 0.95,
          opacity: 0,
        });
      }

      // Create timeline for card stacking effect
      const scrollDistance = window.innerHeight * (total > 1 ? total - 1 : 1);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 1.2,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      // Animate each card: current card moves up, next card slides in on top
      for (let i = 0; i < total; i++) {
        const currentCard = cards[i];
        const nextCard = cards[i + 1];
        
        if (!currentCard) continue;

        // Only animate if NOT the last card
        if (i < total - 1) {
          // Current card moves up and fades slightly
          tl.to(
            currentCard,
            {
              y: "-30%",
              scale: 0.9,
              opacity: 0.7,
              zIndex: total - i - 1,
              duration: 1,
              ease: "power2.inOut",
            },
            i
          );
        }

        // Next card slides up from bottom and becomes fully visible
        if (nextCard) {
          tl.to(
            nextCard,
            {
              y: "0%",
              scale: 1,
              opacity: 1,
              zIndex: total - i,
              duration: 1,
              ease: "power2.inOut",
            },
            i
          );
        }
      }

      // Update progress dots based on scroll
      const dotsTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIndex = Math.min(
            Math.round(progress * (total - 1)),
            total - 1
          );
          
          progressDotsRef.current.forEach((dot, idx) => {
            if (dot) {
              if (idx === activeIndex) {
                gsap.to(dot, {
                  backgroundColor: "rgb(52 211 153)",
                  scale: 1.3,
                  duration: 0.2,
                });
              } else {
                gsap.to(dot, {
                  backgroundColor: "transparent",
                  scale: 1,
                  duration: 0.2,
                });
              }
            }
          });
        },
      });

      // Cleanup only this section's triggers
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        dotsTrigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [isLite] }
  );

  // Refresh ScrollTrigger on resize (desktop pinning only)
  useEffect(() => {
    if (isLite) return;
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLite]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative bg-black min-h-screen"
    >
      {/* MATRIX GRID */}
      <div className={`inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#22c55e_1px,transparent_1px),linear-gradient(to_bottom,#22c55e_1px,transparent_1px)] bg-[size:32px_32px] ${isLite ? "absolute" : "fixed"}`} />

      {/* RADIAL GLOW */}
      <div className={`top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[900px] h-[600px] bg-emerald-500/10 blur-[180px] rounded-full pointer-events-none ${isLite ? "absolute" : "fixed"}`} />

      {/* NOISE */}
      <div className={`inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,#22c55e_1px,transparent_1px)] bg-[size:20px_20px] ${isLite ? "absolute" : "fixed"}`} />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <p className="section-label mb-3 sm:mb-4 lg:mb-5">PROJECTS</p>
          <h2 className="section-title font-mono tracking-tight text-2xl sm:text-3xl lg:text-4xl">
            NETWORK_&amp;_SYSTEM_LABS
          </h2>
          <p className="text-secondary mt-4 sm:mt-5 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4">
            A portfolio of network configurations, system topologies, and troubleshooting labs tailored for IT Support, Junior Network, and Technical Support operations.
          </p>
          <div className="flex justify-center gap-2 mt-5 sm:mt-6 lg:mt-7">
            <div className="timeline-dot animate-pulse" />
            <div className="timeline-dot animate-pulse delay-100" />
            <div className="timeline-dot animate-pulse delay-200" />
          </div>
        </div>

        {/* CARD STACK CONTAINER */}
        <div
          className={`${projects.length === 0 ? "hidden" : ""} ${isLite ? "relative w-full max-w-6xl flex flex-col gap-10 px-1" : "relative w-full max-w-6xl"}`}
          style={isLite ? undefined : { height: "480px" }}
        >
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={isLite ? "relative will-change-transform" : "absolute inset-0 will-change-transform"}
              style={{
                transformOrigin: "center center",
                pointerEvents: "auto",
              }}
            >
              <div className={`group relative overflow-hidden glow-emerald bg-black rounded-xl ${isLite ? "min-h-[460px]" : "h-full"}`}>
                {/* SCANLINES */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(0,255,120,0.08)_3px)]" />

                {/* HOVER GLOW */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_60px_rgba(16,185,129,0.15)] pointer-events-none" />

                <div className="relative z-10 grid lg:grid-cols-[380px_1fr] h-full">
                  {/* LEFT IMAGE */}
                  <div className="relative min-h-[280px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-emerald-500/20 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      unoptimized={project.image.endsWith(".svg")}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />
                    {project.comingSoon && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="border border-emerald-400/50 bg-black/75 px-4 py-2 font-mono text-sm font-bold tracking-[0.25em] text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)] sm:text-base">
                          COMING SOON
                        </span>
                      </div>
                    )}

                    {/* PROJECT NUMBER */}
                    <div className="absolute top-3 sm:top-4 lg:top-5 left-3 sm:left-4 lg:left-5">
                      <div className="px-2 sm:px-3 py-0.5 sm:py-1 border border-emerald-500/30 bg-black/70 backdrop-blur-sm">
                        <p className="text-[9px] sm:text-[10px] lg:text-[11px] font-mono tracking-[2px] sm:tracking-[3px] text-emerald-400">
                          NODE_{String(index + 1).padStart(2, "0")}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="absolute bottom-3 sm:bottom-4 lg:bottom-5 left-3 sm:left-4 lg:left-5 flex items-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[9px] sm:text-[10px] lg:text-[11px] uppercase tracking-[2px] sm:tracking-[3px] text-emerald-300 font-mono">
                        {project.comingSoon ? "awaiting deployment" : "operational"}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT CONTENT */}
                  <div className={`p-4 sm:p-5 lg:p-6 xl:p-7 flex flex-col ${isLite ? "" : "overflow-y-auto"}`}>
                    {/* TERMINAL HEADER */}
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 sm:pb-4 mb-4 sm:mb-5 lg:mb-6">
                      <div className="flex gap-1.5 sm:gap-2">
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-500" />
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-yellow-500" />
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-green-500" />
                      </div>
                      <p className="text-[8px] sm:text-[9px] lg:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase font-mono text-emerald-400">
                        secure-shell
                      </p>
                    </div>

                    {/* TITLE */}
                    <div className="mb-3 sm:mb-4 lg:mb-5">
                      <p className="text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[3px] sm:tracking-[4px] text-emerald-500/70 font-mono mb-1.5 sm:mb-2">
                        PROJECT IDENTIFIER
                      </p>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-primary group-hover:text-emerald-primary transition-colors duration-300">
                        {project.comingSoon ? (
                          project.title
                        ) : (
                          <Link href={`/projects/${project.id}`}>
                            {project.title}
                          </Link>
                        )}
                      </h3>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mb-4 sm:mb-5 lg:mb-6 xl:mb-7">
                      <p className="text-secondary leading-relaxed text-xs sm:text-sm">
                        {project.description}
                      </p>
                    </div>

                    {/* TECH STACK */}
                    {!project.comingSoon && (
                      <div className="mb-5 sm:mb-6 lg:mb-7 xl:mb-8">
                        <p className="text-[9px] sm:text-[10px] lg:text-[11px] uppercase tracking-[2px] sm:tracking-[3px] text-emerald-500/70 font-mono mb-2 sm:mb-3">
                          TECH STACK
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {project.tech.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] lg:text-[11px] font-mono tracking-wide border border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 lg:gap-5 border-t border-emerald-500/10 pt-4 sm:pt-5 lg:pt-6">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-[1px] sm:tracking-[2px] hover:bg-emerald-500/10 transition-colors duration-300"
                          >
                            SOURCE_CODE
                          </a>
                        )}
                        
                      </div>

                      {project.comingSoon ? (
                        <span className="border border-emerald-500/30 px-3 py-1.5 text-center font-mono text-[9px] uppercase tracking-[2px] text-emerald-400 sm:px-4 sm:py-2 sm:text-[10px] lg:px-5 lg:py-2.5 lg:text-xs">
                          &gt; coming_soon
                        </span>
                      ) : (
                        <Link
                          href={`/projects/${project.id}`}
                          className="group/button relative overflow-hidden border border-emerald-500/30 px-3 sm:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 lg:py-2.5 xl:py-3 text-center font-mono text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-[2px] sm:tracking-[3px] text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300"
                        >
                          <span className="relative z-10">&gt; inspect_project</span>
                          <div className="absolute inset-0 translate-x-[-120%] group-hover/button:translate-x-[120%] transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent skew-x-12" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="w-full max-w-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 text-center">
            <h3 className="font-mono text-lg sm:text-xl text-emerald-300">
              No verified case studies are documented yet
            </h3>
            <p className="mt-4 text-secondary leading-relaxed text-sm sm:text-base">
              The project details currently in the site do not establish authorship or match the linked repository, so they are not presented as Siam&apos;s work. This section is ready for projects with confirmed contribution, technical details, and outcomes.
            </p>
          </div>
        )}

        {/* PROGRESS DOTS (desktop pinned-scroll indicator) */}
        {!isLite && (
        <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-7 lg:mt-8">
          {projects.map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                progressDotsRef.current[i] = el;
              }}
              className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full border border-emerald-500/40 transition-all duration-300 cursor-pointer"
              onClick={() => {
                const scrollAmount = window.innerHeight * i;
                window.scrollTo({
                  top: sectionRef.current?.offsetTop
                    ? sectionRef.current.offsetTop + scrollAmount
                    : scrollAmount,
                  behavior: "smooth",
                });
              }}
            />
          ))}
        </div>
        )}
      </div>
    </section>
  );
}