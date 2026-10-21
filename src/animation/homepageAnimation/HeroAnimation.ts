
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { roles } from "@/src/data/homepageData/HeroData";
import { useLoaderDone } from "@/src/components/common/LoaderWrapper";

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

export function useHeroAnimations() {
  const leftContentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const loaderDone = useLoaderDone();

  // Animation for left content entrance
  useEffect(() => {
    if (!loaderDone || !leftContentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftContentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
      );
    }, leftContentRef);

    return () => ctx.revert();
  }, [loaderDone]);

  // Typing effect timeline
  useEffect(() => {
    if (!loaderDone || !textRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });

      // Clear text first
      tl.to(textRef.current, {
        text: "",
        duration: 1.5,
        delay: 2,
        ease: "none",
      });

      roles.forEach((role) => {
        tl.to(textRef.current, {
          text: role,
          duration: 1.5,
          ease: "none",
        }).to(textRef.current, {
          text: "",
          duration: 1.5,
          delay: 2,
          ease: "none",
        });
      });

      // Final name
      tl.to(textRef.current, {
        text: "Siam Khan",
        duration: 1.5,
        ease: "none",
      });
    }, textRef);

    return () => ctx.revert();
  }, [loaderDone]);

  return {
    leftContentRef,
    textRef,
  };
}