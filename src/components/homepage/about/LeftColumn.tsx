interface LeftColumnProps {
  leftColRef: React.RefObject<HTMLDivElement | null>;
}

export const LeftColumn = ({ leftColRef }: LeftColumnProps) => {
  return (
    <div ref={leftColRef} className="space-y-4">
      
      
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          Hands-on IT infrastructure and network engineering — configuring switches, managing VLANs, diagnosing connectivity, and administering Active Directory for reliable day-to-day operations.
        </p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          L1/L2 troubleshooting, root cause analysis, and ticketing workflows — turning complex network issues into simple, user-friendly resolutions.
        </p>
      </div>
    </div>
  );
};
