"use client";
import { useGsapFadeIn } from "@/src/animation/homepageAnimation/TimelineAnimation";
import { useRef } from "react";

interface TabSwitcherProps {
  activeTab: "skills" | "projects" | "education";
  onTabChange: (tab: "skills" | "projects" | "education") => void;
}

const TABS = [
  { key: "skills", label: "Technical Toolkit" },
  { key: "projects", label: "Projects & Research" },
  { key: "education", label: "Education" },
] as const;

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  const switcherRef = useRef<HTMLDivElement>(null);
  useGsapFadeIn(switcherRef);

  return (
    <div ref={switcherRef} className="flex justify-center mb-12">
      <div className="inline-flex rounded-xl bg-gray-900 border border-gray-800 p-1 gap-1 max-w-full overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative px-4 sm:px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.key ? "text-gray-900" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span
              className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                activeTab === tab.key ? "bg-emerald-400 scale-100" : "bg-transparent scale-95"
              }`}
            />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
