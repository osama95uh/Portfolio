export type Project = {
  id: string;
  title: string;
  image: string;
  description: string;
  tech: string[];
  features?: string[];
  challenges?: string[];
  improvements?: string[];
  github?: string;
  live?: string;
  comingSoon?: boolean;
};

export const projects: Project[] = [
  {
    id: "branch-office-network",
    title: "Branch Office Network Implementation",
    image: "/branch-office-network.png",
    description:
      "A simulated enterprise branch-office network engineered in Cisco Packet Tracer, demonstrating Layer 2 switching, IEEE 802.1Q VLAN segmentation, and endpoint IP connectivity.",
    tech: ["Cisco Packet Tracer", "VLAN Segmentation", "802.1Q Trunking", "IPv4 Subnetting", "Ethernet Switching"],
    features: [
      "Segmented department endpoints into dedicated VLANs (VLAN 10 and VLAN 20) to isolate broadcast domains and enhance LAN security.",
      "Configured 802.1Q trunking on the inter-switch link (ISL) to transport multi-VLAN traffic between distribution switches.",
      "Implemented a structured IPv4 static addressing scheme with default gateway configurations across all end workstations.",
      "Verified network health using ICMP ping diagnostics, ARP table inspection, and MAC address table mapping.",
    ],
    challenges: [
      "Isolating inter-VLAN broadcast storms while verifying full transparency over switch-to-switch trunk links.",
      "Diagnosing endpoint communication failures caused by trunk encapsulation mismatches and access port assignment errors.",
    ],
    improvements: [
      "Configure Router-on-a-Stick (ROAS) or Layer 3 Switch SVI for controlled inter-VLAN communication.",
      "Implement dynamic IP configuration via DHCP with DHCP Snooping to mitigate rogue DHCP threats.",
      "Enable Cisco Port Security on access ports to enforce MAC-level endpoint restrictions.",
    ],
    github:
      "https://github.com/osama95uh/Branch-office-network-using-Cisco-Packet-Tracer.git",
  },
  {
    id: "upcoming-network-lab",
    title: "Active Directory & Enterprise Helpdesk Lab",
    image: "/network-coming-soon.svg",
    description:
      "A virtualized IT support environment focusing on Windows Server 2022 Active Directory DS, Group Policy Objects (GPO), user onboarding, and remote assistance.",
    tech: ["Windows Server", "Active Directory", "Group Policy", "DNS / DHCP", "Helpdesk Support"],
    comingSoon: true,
  },
  {
    id: "upcoming-infrastructure-project",
    title: "Multi-Branch Routing & Firewall Support Lab",
    image: "/network-coming-soon.svg",
    description:
      "A routed network lab featuring inter-VLAN routing, NAT/PAT, ACL firewall security policies, and Wireshark packet capture analysis for rapid fault isolation.",
    tech: ["Inter-VLAN Routing", "NAT / PAT", "ACL Firewalls", "Wireshark", "Network Troubleshooting"],
    comingSoon: true,
  },
];
