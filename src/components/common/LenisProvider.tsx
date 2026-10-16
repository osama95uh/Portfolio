"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function LenisScrollSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);
    // Ensure triggers measure correctly once smooth scroll is ready
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      lenis.off("scroll", onScroll);
      clearTimeout(t);
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
      <LenisScrollSync />
      {children}
    </ReactLenis>
  );
}