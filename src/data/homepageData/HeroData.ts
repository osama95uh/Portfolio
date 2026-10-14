export const skills = [
  { name: "SIEM & Blue Teaming (Splunk/Wazuh)", level: 86 },
  { name: "Pentesting & Offensive Security", level: 60 },
  { name: "IDS/IPS Deployment", level: 85 },
  { name: "Languages & Scripting", level: 40 },
  { name: "Cloud & Infrastructure", level: 70 },
  { name: "Scripting, Automation", level: 45 },
];

export const roles = [
  "a Network Security Analyst",
  "a SecOps Specialist",
  "a Penetration Tester",
];

export const techStack = [
  "SIEM (Splunk / Sentinel)",
  "Network Traffic Analysis",
  "Python & Bash Scripting",
  "Incident Response",
  "Linux & Windows Server",
  "Vulnerability Management",
];

  // GitHub-style activity grid (7 cols × 5 rows = 35 days)
export const activityDotsGenerator = () => {
  return Array.from({ length: 35 }, (_, i) => {
    const seed = (i * 17 + 7) % 100;
    if (seed < 25) return 0;
    if (seed < 55) return 1;
    if (seed < 80) return 2;
    return 3;
  });
};

export const stats = [
  { label: "Projects", value: "1" },
  { label: "Commits", value: "9+" },
  { label: "YoE", value: "1yr" },
];

export const dotColors = [
  "bg-gray-800/60 border border-gray-700/40",
  "bg-emerald-900/70 border border-emerald-800/50",
  "bg-emerald-600/70 border border-emerald-500/50",
  "bg-emerald-400/90 border border-emerald-300/60",
];
