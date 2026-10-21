"use client";

import { useEffect, useRef } from "react";

type Logo = {
  node: React.ReactNode;
  title?: string;
};

export default function LogoLoop({
  logos,
  speed = 40,
  gap = 40,
  pauseOnHover = false,
}: {
  logos: Logo[];
  speed?: number;
  gap?: number;
  pauseOnHover?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);       // use ref not state — no re-render
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      if (!track) return;

      const halfWidth = track.scrollWidth / 2;

      if (!pausedRef.current) {
        positionRef.current = (positionRef.current + speed * 0.01) % halfWidth;
      }

      track.style.transform = `translateX(-${positionRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]); // no isHovered dep — pausedRef handles it without restarting loop

  return (
    <div
      className="relative overflow-hidden w-full"
      onMouseEnter={() => { pausedRef.current = pauseOnHover; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#020617] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#020617] to-transparent z-10" />

      <div
        ref={trackRef}
        className="flex items-center w-max"
        style={{ gap: `${gap}px` }}
      >
        {[...logos, ...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="text-3xl text-emerald-300 opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300"
            title={logo.title}
          >
            {logo.node}
          </div>
        ))}
      </div>
    </div>
  );
}