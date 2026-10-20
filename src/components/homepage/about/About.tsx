"use client";

import { AboutImage } from "./AboutImage";
import { AboutContent } from "./AboutContent";
import { useAboutAnimation } from "@/src/animation/homepageAnimation/AboutAnimation";

const About = () => {
  const {
    imageRef,
    containerRef,
    contentRef,
    leftColRef,
    rightColRef,
  } = useAboutAnimation();

  return (
    <div
      ref={containerRef}
      className="min-h-screen max-w-7xl mx-auto py-10 px-4 md:px-8"
      id="about"
    >
      {/* Section Label */}
      <div className="mb-4">
        <span className="section-label">--- GET TO KNOW ME ---</span>
      </div>

      {/* Main Title */}
      <div className="text-center mb-16">
        <div className="flex justify-center mt-4">
          <div className="w-10 h-0.5 bg-emerald-500/50 glow-emerald m-2"></div>
          <div className="w-30 h-0.5 bg-emerald-500/50 glow-emerald"></div>
          <div className="w-10 h-0.5 bg-emerald-500/50 glow-emerald m-2"></div>
        </div>
        <h1 className="section-title">
          About <span className="text-emerald-primary">Me</span>
        </h1>
        <div className="flex justify-center mt-4">
          <div className="w-10 h-0.5 bg-emerald-500/50 glow-emerald"></div>
          <div className="w-30 h-0.5 bg-emerald-500/50 glow-emerald m-2"></div>
          <div className="w-10 h-0.5 bg-emerald-500/50 glow-emerald"></div>
        </div>
      </div>

      {/* Container for image and content */}
      <div className="relative flex flex-col md:block md:min-h-[600px] items-center justify-center">
        <AboutImage imageRef={imageRef} />
        <AboutContent
          contentRef={contentRef}
          leftColRef={leftColRef}
          rightColRef={rightColRef}
        />
      </div>
    </div>
  );
};

export default About;