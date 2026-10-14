"use client";

import {
  SiWireshark,
  SiSplunk,
  SiLinux,
  SiDocker,
  SiPython,
  SiPostgresql,
  SiServerfault,
  SiGit,
} from "react-icons/si";

import "./TechLogos.css";
import LogoLoop from "./LogoLoop";

const techLogos = [
  { node: <SiWireshark />, title: "Wireshark" },
  { node: <SiSplunk />, title: "Splunk" },
  { node: <SiLinux />, title: "Linux" },
  { node: <SiDocker />, title: "Docker" },
  { node: <SiPython />, title: "Python" },
  { node: <SiPostgresql />, title: "PostgreSQL" },
  { node: <SiServerfault />, title: "Windows Server" },
  { node: <SiGit />, title: "Git" },
];

export default function TechLogos() {
  return (
    <section className="tech-section">
      
      {/* MATRIX GRID BACKGROUND */}
      <div className="tech-matrix-grid" />
      
      {/* SCANLINES */}
      <div className="tech-scanlines" />
      
      {/* TERMINAL CURSOR */}
      <div className="tech-cursor">_</div>
      
      {/* GLITCH LINES */}
      <div className="tech-glitch-line tech-glitch-line-1" />
      <div className="tech-glitch-line tech-glitch-line-2" />
      
      {/* Glow LEFT */}
      <div className="tech-glow tech-glow-left" />

      {/* Glow RIGHT */}
      <div className="tech-glow tech-glow-right" />

      {/* DECORATIVE BRACKETS */}
      <div className="tech-bracket tech-bracket-tl">{'<'}</div>
      <div className="tech-bracket tech-bracket-tr">{'>'}</div>
      <div className="tech-bracket tech-bracket-bl">{'</'}</div>
      <div className="tech-bracket tech-bracket-br">{'>'}</div>

      <div className="tech-container">
        
        {/* HACKER TITLE */}
        <div className="tech-title-wrapper">
          <span className="tech-prompt">$</span>
          <p className="tech-title">
            <span className="tech-title-text">TECH_And_Knowledge</span>
            <span className="tech-blink">_</span>
          </p>
          <span className="tech-version">v2.0.4</span>
        </div>
        
        {/* DECORATIVE LINE */}
        <div className="tech-divider">
          <span className="tech-divider-line"></span>
          <span className="tech-divider-icon">{'>_'}</span>
          <span className="tech-divider-line"></span>
        </div>

        <LogoLoop
          logos={techLogos}
          speed={50}
          gap={50}
          pauseOnHover
        />

        {/* STATUS BAR */}
        <div className="tech-status">
          <span className="tech-status-dot"></span>
          <span className="tech-status-text">SYSTEM_READY</span>
          <span className="tech-status-dot tech-status-dot-right"></span>
          <span className="tech-status-text">SECURE_CONNECTION</span>
        </div>
      </div>
    </section>
  );
}