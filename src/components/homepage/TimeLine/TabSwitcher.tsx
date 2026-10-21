"use client";
import { useGsapFadeIn } from "@/src/animation/homepageAnimation/TimelineAnimation";
import { useRef } from "react";

interface TabSwitcherProps {
  activeTab: "skills" | "education";
  onTabChange: (tab: "skills" | "education") => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  const switcherRef = useRef<HTMLDivElement>(null);
  useGsapFadeIn(switcherRef);

  return (
    <div ref={switcherRef} className="flex justify-center mb-12">
      <div className="inline-flex rounded-xl bg-gray-900 border border-gray-800 p-1 gap-1">
        {(["skills", "education"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`relative px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span
              className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                activeTab === tab ? "bg-emerald-400 scale-100" : "bg-transparent scale-95"
              }`}
            />
            <span className="relative z-10">
              {tab === "skills" ? "Technical Toolkit" : "Education"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}