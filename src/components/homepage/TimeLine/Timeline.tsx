"use client";
import React, { useRef } from "react";

import { TimelineNode } from "./TimelineNode";
import { SkillCard } from "./SkillCard";
import { EduCard } from "./EduCard";

import { education, skills } from "@/src/data/toolkit&edu";
import { useGsapTimeline } from "@/src/animation/homepageAnimation/TimelineAnimation";
import { buildTimelineNodes } from "./timelineUtils";

interface TimelineProps {
  activeTab: "skills" | "education";
}

export function Timeline({ activeTab }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const nodes =
    activeTab === "skills"
      ? buildTimelineNodes(skills)
      : buildTimelineNodes(education);

  useGsapTimeline(cardRefs, nodes, activeTab);

  return (
    <div ref={timelineRef} className="relative w-full overflow-x-hidden">
      {/* Desktop vertical spine - hidden on mobile */}
      <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gray-700" />

      <div className="w-full">
        <div className="flex flex-col gap-6 md:gap-10">
          {nodes.map(({ item, side }, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="w-full"
            >
              <TimelineNode side={side}>
                {activeTab === "skills" ? (
                  <SkillCard {...(item as (typeof skills)[number])} />
                ) : (
                  <EduCard {...(item as (typeof education)[number])} />
                )}
              </TimelineNode>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}