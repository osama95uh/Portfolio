export const skills = [
  { name: "Networking (L2/L3)", level: 88 },
  { name: "IT Troubleshooting", level: 90 },
  { name: "Active Directory & OS", level: 85 },
  { name: "Network Diagnostics", level: 84 },
  { name: "Linux & Windows Server", level: 80 },
  { name: "Scripting & Automation", level: 65 },
];

export const roles = [
  "an IT Support Engineer",
  "a Junior Network Engineer",
  "a Technical Support Engineer (TSE)",
];

export const techStack = [
  "TCP/IP & Subnetting",
  "Routing & Switching",
  "Active Directory & DNS",
  "Windows & Linux Support",
  "Network Diagnostics",
  "ITSM / Ticket Support",
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
  { label: "Projects", value: "+" },
  { label: "Commits", value: "5" },
  { label: "YoE", value: "1yr" },
];

export const dotColors = [
  "bg-gray-800/60 border border-gray-700/40",
  "bg-emerald-900/70 border border-emerald-800/50",
  "bg-emerald-600/70 border border-emerald-500/50",
  "bg-emerald-400/90 border border-emerald-300/60",
];
