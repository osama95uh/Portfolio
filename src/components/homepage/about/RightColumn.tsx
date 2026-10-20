import { BioCard } from "./BioCard";

interface RightColumnProps {
  rightColRef: React.RefObject<HTMLDivElement | null>;
}

export const RightColumn = ({ rightColRef }: RightColumnProps) => {
  return (
    <div ref={rightColRef} className="space-y-4">
      <BioCard title="Network Focus & Engineering Philosophy">
        <p className="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
          I focus on building resilient network foundations where{" "}
          <span className="text-white font-medium">
            uptime, packet integrity, and deterministic routing
          </span>{" "}
          are paramount. Whether designing VLAN boundaries, configuring inter-VLAN routing, or analyzing Wireshark captures, I treat network stability as mission-critical.
        </p>
      </BioCard>

      <BioCard title="Continuous Learning & Homelab">
        <p className="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
          Beyond daily tasks, I actively build virtual network topologies using{" "}
          <span className="text-emerald-300">Cisco Packet Tracer</span> and{" "}
          <span className="text-emerald-300">GNS3</span> to simulate multi-switch branch networks, router configurations, and firewall policies.
        </p>
        <p className="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
          I continuously study CCNA-level concepts, protocol behaviors (TCP/IP 3-way handshakes, ARP, STP, DHCP), and Linux networking fundamentals to prepare for enterprise NOC roles.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            "🌐 Network Homelab",
            "📡 Packet Analysis",
            "🔧 Cisco IOS CLI",
            "🐧 Linux Networking",
            "📊 Network Monitoring",
          ].map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-300 bg-gray-800/50 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </BioCard>
    </div>
  );
};


