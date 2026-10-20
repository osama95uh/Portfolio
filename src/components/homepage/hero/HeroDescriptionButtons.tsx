import Link from "next/link";
import SheenCard from "../../common/SheenCard";
import { FiFolder } from "react-icons/fi";

const HeroDesButtons = () => {
  return (
    <>
      {/* Description with SheenCard */}
      <SheenCard className="mb-8">
        <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed backdrop-blur-md bg-black/40 p-4 rounded-lg border border-emerald-500/30">
          I am <span className="text-emerald-400 font-semibold">Siam Khan</span>, an aspiring Junior Network Engineer specializing in Cisco routing & switching, network topology design, packet analysis, and infrastructure reliability.
        </p>
      </SheenCard>

      {/* Buttons with SheenCard */}
      <div className="flex gap-4 flex-wrap">
        <SheenCard>
          {/* View Projects Button */}
          <Link
            href="#projects"
            className="relative block px-10 py-3 rounded-lg bg-emerald-600/20 border border-emerald-700 text-emerald-300 hover:bg-emerald-600/30 transition-all duration-300 font-medium text-sm overflow-hidden group"
          >
            {/* Top scrolling text */}
            <div className="absolute top-0 left-0 w-full overflow-hidden h-[12px] flex items-center">
              <div className="flex animate-marquee-slow whitespace-nowrap gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-[9px] text-emerald-500/60 tracking-widest uppercase"
                  >
                    View Projects
                  </span>
                ))}
              </div>
            </div>

            {/* Center icon */}
            <div className="flex items-center justify-center py-1">
              <FiFolder className="text-emerald-400 text-xl group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Bottom scrolling text — reverse */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[12px] flex items-center">
              <div className="flex animate-marquee-slow-reverse whitespace-nowrap gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-[9px] text-emerald-500/60 tracking-widest uppercase"
                  >
                    View Projects
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </SheenCard>
        
        {/* Resume download button temporarily disabled.
        <SheenCard>
          <Link
            href="/Siam_Khan_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-emerald-600/20 border border-emerald-700 text-emerald-300 hover:bg-emerald-600/30 transition-all duration-300 font-medium text-sm overflow-hidden group"
          >
            <span>Download Resume</span>
            <FiDownload className="text-emerald-400 text-sm animate-bounce" />
          </Link>
        </SheenCard>
        */}
        
      </div>
    </>
  );
};

export default HeroDesButtons;
