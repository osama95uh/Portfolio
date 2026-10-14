import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useAboutAnimation = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imageRef.current || !contentRef.current) return;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          pinSpacing: true,
        },
      });

      tl.to(imageRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 1,
        ease: "power2.inOut",
      })
      .to(contentRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.3")
      .from(leftColRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4")
      .from(rightColRef.current, {
        opacity: 0,
        x: 30,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4");
    },
    { scope: containerRef },
  );

  return {
    imageRef,
    containerRef,
    contentRef,
    leftColRef,
    rightColRef,
  };
};