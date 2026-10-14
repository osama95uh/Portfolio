"use client";

import { ReactLenis } from "lenis/react";
import { useEffect } from "react";

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
      {children}
    </ReactLenis>
  );
}