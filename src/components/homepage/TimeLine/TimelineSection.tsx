"use client";
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { TabSwitcher } from "./TabSwitcher";
import { Timeline } from "./Timeline";


export default function TimelineSection() {
  const [activeTab, setActiveTab] = useState<"skills" | "education">("skills");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  return (
    <>
          <div className="mt-150 md:mt-0"></div>
    <div ref={containerRef} className="max-w-7xl mx-auto ">
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      <Timeline activeTab={activeTab} />
    </div>
    </>
  );
}