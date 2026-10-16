
import LightRays from "./LightRays";
import SheenCard from "../../common/SheenCard";
import { SysInfoPanel } from "./SysInfoPanel";
import HeroTerminal from "./HeroTerminal";


export default function Hero() {

  return (
    <section id="home" className="min-h-screen py-24 flex items-center justify-center px-6 overflow-hidden relative">
      {/* SEO heading: screen-reader only, visual design unchanged */}
      <h1 className="sr-only">
        Siam Khan NOC — Network Security Analyst Portfolio
      </h1>
      {/* Background Rays */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#6ee7b7"
          raysSpeed={0.8}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.12}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={0.85}
        />
      </div>
      <div className="absolute inset-0 bg-black/20 z-[1]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-10 items-center justify-between">
        {/* Left Side: Terminal */}
        <HeroTerminal />

        {/* Right Side: SysInfo Monitor Panel */}
        <div className="flex-1 flex justify-center lg:justify-end items-center">
          <SheenCard className="w-full">
            <SysInfoPanel />
          </SheenCard>
        </div>
      </div>
    </section>
  );
}