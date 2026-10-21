"use client";

import { useRef } from "react";

export default function SheenCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const sheenRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (!sheenRef.current) return;
    sheenRef.current.className =
      "pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg";
    const el = sheenRef.current.firstElementChild as HTMLElement;
    el.className =
      "absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/8 to-transparent sheen-forward";
  };

  const handleLeave = () => {
    if (!sheenRef.current) return;
    const el = sheenRef.current.firstElementChild as HTMLElement;
    el.className =
      "absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/8 to-transparent sheen-reverse";
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div ref={sheenRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>
      {children}
    </div>
  );
}