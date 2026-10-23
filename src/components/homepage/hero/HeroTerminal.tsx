"use client";
import SheenCard from "../../common/SheenCard";
import Image from "next/image";
import { techStack } from "@/src/data/homepageData/HeroData";
import { useHeroAnimations } from "@/src/animation/homepageAnimation/HeroAnimation";
import HeroDesButtons from "./HeroDescriptionButtons";

const HeroTerminal = () => {
  const { leftContentRef, textRef } = useHeroAnimations();
  return (
    <>
      <div
        ref={leftContentRef}
        className="text-left opacity-0 flex-1 max-w-2xl px-4 md:px-0"
      >
        <p className="text-emerald-400 text-sm mb-4 tracking-widest uppercase font-medium">
          --- Welcome ---
        </p>

        {/* Terminal Box with SheenCard */}
        <SheenCard className="mb-8 overflow-hidden">
          <div className="backdrop-blur-md bg-black/40 rounded-lg border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-gradient-to-r from-gray-900/80 to-black/80 px-4 py-2 border-b border-emerald-500/20 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-emerald-400/70 font-mono">
                  it-network-eng@portfolio:~
                </span>
              </div>
              <div className="w-14" />
            </div>

            {/* Terminal Content */}
            <div className="p-5 font-mono">
              {/* whoami */}
              <div className="flex items-start gap-2 mb-3">
                <span className="text-emerald-400 shrink-0">$</span>
                <span className="text-gray-300 text-sm">whoami --verbose</span>
              </div>

              {/* whoami response — photo + info side by side */}
              <div className="ml-6 mb-5 flex items-center gap-4">
                {/* Small photo */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-md" />
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-emerald-400/50 bg-black/60 shadow-[0_0_24px_rgba(52,211,153,0.22)] ring-1 ring-emerald-500/20">
                    <Image
                      src="/mew.png"
                      alt="Siam Khan"
                      width={64}
                      height={64}
                      className="object-cover w-full h-full brightness-[0.82] contrast-125 saturate-110"
                      priority
                    />
                  </div>
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                </div>

                {/* Info */}
                <div>
                  <div className="text-emerald-300 text-base font-bold leading-tight">
                    Siam Khan
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    IT Support &amp; Network Engineer
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400">
                      BD
                    </span>
                    <span className="text-gray-600 text-[10px]">•</span>
                    <span className="text-gray-500 text-[10px]">
                      Available to get hired!
                    </span>
                  </div>
                </div>
              </div>

              {/* skills */}
              <div className="flex items-start gap-2 mb-3">
                <span className="text-emerald-400 shrink-0">$</span>
                <span className="text-gray-300 text-sm">
                  skills --tech
                </span>
              </div>

              <div className="ml-6 mb-5 flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* echo / typing */}
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">$</span>
                <div className="flex items-center gap-1 flex-wrap text-sm">
                  <span className="text-gray-300">echo</span>
                  <span className="text-yellow-300">&quot;I&apos;m&quot;</span>
                  <span ref={textRef} className="text-emerald-300 font-mono">
                    Siam Khan
                  </span>
                  <span className="text-2xl animate-pulse text-emerald-400 font-light ml-0.5 leading-none">
                    |
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheenCard>

        {/* Description & Buttons with SheenCard */}
        <HeroDesButtons />
      </div>
    </>
  );
};

export default HeroTerminal;
