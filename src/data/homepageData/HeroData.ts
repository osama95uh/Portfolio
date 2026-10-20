export const skills = [
  { name: "Cisco Routing & Switching", level: 90 },
  { name: "VLANs & 802.1Q Trunking", level: 88 },
  { name: "Wireshark Packet Analysis", level: 85 },
  { name: "IPv4 Subnetting & VLSM", level: 92 },
  { name: "Firewalls & VPNs (pfSense)", level: 82 },
  { name: "NOC Network Diagnostics", level: 85 },
];

export const roles = [
  "a Junior Network Engineer",
  "a Network Operations (NOC) Specialist",
  "a Routing & Switching Enthusiast",
];

export const techStack = [
  "Cisco IOS & Packet Tracer",
  "Routing (OSPF / Static)",
  "VLANs & Inter-VLAN Routing",
  "Wireshark Packet Inspection",
  "pfSense & Network Security",
  "IPv4 Subnetting & Addressing",
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
  { label: "Lab Nodes", value: "10+" },
  { label: "Protocols", value: "TCP/IP" },
  { label: "Focus", value: "CCNA" },
];

export const dotColors = [
  "bg-gray-800/60 border border-gray-700/40",
  "bg-emerald-900/70 border border-emerald-800/50",
  "bg-emerald-600/70 border border-emerald-500/50",
  "bg-emerald-400/90 border border-emerald-300/60",
];
