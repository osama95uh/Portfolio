"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function LenisGsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // 1. Sync Lenis scroll with ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // 2. Drive Lenis's raf off GSAP's ticker for zero-jitter, frame-perfect sync
    const handleTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(handleTicker);
    gsap.ticker.lagSmoothing(0);

    // 3. Refresh ScrollTrigger to calculate exact initial pin positions
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(handleTicker);
    };
  }, [lenis]);

  return null;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Import and initialize Lenis styles if needed
    import("lenis/dist/lenis.css");
  }, []);

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
        infinite: false,
      }}
    >
      <LenisGsapSync />
      {children}
    </ReactLenis>
  );
}