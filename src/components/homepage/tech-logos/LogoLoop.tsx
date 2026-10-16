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
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    let halfWidth = track.scrollWidth / 3;

    const measureWidth = () => {
      if (track) {
        halfWidth = track.scrollWidth / 3;
      }
    };
    window.addEventListener("resize", measureWidth, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !rafRef.current) {
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      if (!isVisibleRef.current) {
        rafRef.current = 0;
        return;
      }

      if (!pausedRef.current && halfWidth > 0) {
        positionRef.current = (positionRef.current + speed * 0.015) % halfWidth;
        track.style.transform = `translate3d(-${positionRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener("resize", measureWidth);
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
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