interface LeftColumnProps {
  leftColRef: React.RefObject<HTMLDivElement | null>;
}

export const LeftColumn = ({ leftColRef }: LeftColumnProps) => {
  return (
    <div ref={leftColRef} className="space-y-4">
      
      
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          
          My
          work emphasizes real-time network visibility, automated detection,
          and response maturity for enterprise NOC teams.
        </p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          I align technical controls with governance through GRC frameworks
          such as NIST CSF, ISO 27001, and CIS Controls while continuously
          improving uritsecy posture through network monitoring, risk
          management, and policy-driven operations.
        </p>
      </div>
    </div>
  );
};
