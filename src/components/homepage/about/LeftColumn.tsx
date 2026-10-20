interface LeftColumnProps {
  leftColRef: React.RefObject<HTMLDivElement | null>;
}

export const LeftColumn = ({ leftColRef }: LeftColumnProps) => {
  return (
    <div ref={leftColRef} className="space-y-4">
      
      
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-5">
        <p className="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
          Aspiring <span className="text-emerald-400 font-semibold">Junior Network Engineer</span> with practical experience in Cisco routing & switching, VLAN segmentation, IPv4 subnetting (VLSM), and infrastructure troubleshooting.
        </p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-5">
        <p className="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
          Proficient in Wireshark packet capture analysis, configuring dynamic routing (OSPF, Static), switchport security, NAT, and gateway redundancy. Dedicated to maintaining high network uptime and rapid diagnostic resolution in enterprise NOC environments.
        </p>
      </div>
    </div>
  );
};
