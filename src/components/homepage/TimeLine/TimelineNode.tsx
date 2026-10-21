import { ReactNode } from "react";

interface TimelineNodeProps {
  side: "left" | "right";
  children: ReactNode;
}

export function TimelineNode({ side, children }: TimelineNodeProps) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center w-full">
      {/* Mobile layout */}
      <div className="md:hidden relative pl-8 pb-8">
        {/* Mobile timeline line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-700" />
        
        {/* Mobile dot */}
        <div className="absolute left-[3px] top-1 w-[18px] h-[18px] rounded-full bg-gray-900 border-2 border-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.35)] z-10" />
        
        {/* Content */}
        <div className="ml-4">
          {children}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex md:items-center w-full">
        {/* LEFT SIDE */}
        <div className="w-[calc(50%-20px)] pr-4 flex justify-end">
          {side === "left" && <div className="w-full max-w-sm">{children}</div>}
        </div>

        {/* Center dot */}
        <div className="relative z-10 flex-shrink-0 w-10 flex justify-center">
          <div className="w-4 h-4 rounded-full bg-gray-900 border-2 border-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.35)]" />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-[calc(50%-20px)] pl-4 flex justify-start">
          {side === "right" && <div className="w-full max-w-sm">{children}</div>}
        </div>
      </div>
    </div>
  );
}