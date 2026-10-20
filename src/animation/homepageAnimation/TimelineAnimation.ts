"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface NodeItem {
  side: "left" | "right";
}

export function useGsapTimeline(
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  nodes: NodeItem[],
  activeTab: string
) {
  useEffect(() => {
    if (!cardRefs.current.length) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // Set initial hidden state
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.set(card, {
          opacity: 0,
          x: isMobile ? 0 : (nodes[index]?.side === "left" ? -50 : 50),
          y: isMobile ? 20 : 0,
          scale: 0.95,
        });
      }
    });

    // Create scroll-triggered animations
    const animations = cardRefs.current.map((card, index) => {
      if (!card) return null;
      
      return ScrollTrigger.create({
        trigger: card,
        start: "top 85%",
        end: "top 60%",
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: index * 0.1,
          });
        },
        once: true,
      });
    });

    return () => {
      animations.forEach((anim) => anim?.kill());
    };
  }, [activeTab, nodes, cardRefs]);
}

export function useGsapFadeIn(
  ref: React.RefObject<HTMLDivElement | null>,
  delay: number = 0
) {
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay }
      );
    }
  }, [ref, delay]);
}