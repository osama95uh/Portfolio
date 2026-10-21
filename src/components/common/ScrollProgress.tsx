"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    let animationFrameId: number;

    const updateProgress = () => {
      const scrolled = (lenis.scroll / lenis.limit) * 100;
      setProgress(scrolled);
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [lenis]);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-black/50 z-50 backdrop-blur-sm border-b border-green-500/20">
      {/* Background bar */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-cyan-500/10" />
      
      {/* Progress bar with glow */}
      <div 
        className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 shadow-lg shadow-green-500/70"
        style={{ 
          width: `${progress}%`,
          willChange: "width",
          transition: "none",
          boxShadow: `0 0 20px rgba(0, 255, 0, ${0.3 + progress / 300})`,
        }}
      />

      {/* Animated scanlines on progress */}
      <div 
        className="absolute inset-0 bg-repeat opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 255, 0, 0.1),
            rgba(0, 255, 0, 0.1) 1px,
            transparent 1px,
            transparent 2px
          )`,
          width: `${progress}%`,
          willChange: "width",
        }}
      />
    </div>
  );
}
