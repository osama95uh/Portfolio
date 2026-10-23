interface LeftColumnProps {
  leftColRef: React.RefObject<HTMLDivElement | null>;
}

export const LeftColumn = ({ leftColRef }: LeftColumnProps) => {
  return (
    <div ref={leftColRef} className="space-y-4">
      
      
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          I focus on hands-on IT infrastructure and network engineering — configuring switches, managing VLANs, diagnosing connectivity issues, and administering Active Directory to maintain robust day-to-day operations.
        </p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          With a strong technical support mindset, I handle L1/L2 incident troubleshooting, root cause analysis (RCA), and ticketing workflows. I bridge the gap between complex network protocols and user-friendly technical resolutions to deliver reliable support.
        </p>
      </div>
    </div>
  );
};
