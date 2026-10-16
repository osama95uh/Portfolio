"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);

  useLenis(({ scroll, limit }) => {
    if (!barRef.current || !limit) return;
    const progress = Math.min(1, Math.max(0, scroll / limit));
    const transformVal = `scaleX(${progress})`;
    barRef.current.style.transform = transformVal;
    if (scanlineRef.current) {
      scanlineRef.current.style.transform = transformVal;
    }
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-black/50 z-50 backdrop-blur-sm border-b border-green-500/20 pointer-events-none">
      {/* Background bar */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-cyan-500/10" />

      {/* Progress bar with glow - GPU scaleX transform with left origin */}
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 origin-left scale-x-0 shadow-lg shadow-green-500/70"
        style={{
          willChange: "transform",
        }}
      />

      {/* Animated scanlines on progress */}
      <div
        ref={scanlineRef}
        className="absolute inset-0 bg-repeat opacity-20 origin-left scale-x-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 255, 0, 0.1),
            rgba(0, 255, 0, 0.1) 1px,
            transparent 1px,
            transparent 2px
          )`,
          willChange: "transform",
        }}
      />
    </div>
  );
}
