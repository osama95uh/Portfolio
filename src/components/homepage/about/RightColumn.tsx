import { BioCard } from "./BioCard";

interface RightColumnProps {
  rightColRef: React.RefObject<HTMLDivElement | null>;
}

export const RightColumn = ({ rightColRef }: RightColumnProps) => {
  return (
    <div ref={rightColRef} className="space-y-2">
      <BioCard title="The work I enjoy">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          I enjoy studying systems where things actually matter — where{" "}
          <span className="text-gray-300">
            security, performance, and reliability
          </span>{" "}
          all come together.
        </p>
      </BioCard>

      <BioCard title="Beyond the screen">
        <p className="text-gray-400 leading-relaxed text-[15px]">
          I love diving into <span className="text-gray-300">conspiracy theories</span>,
          and I&apos;m a fan of <span className="text-gray-300">marvel cinematic stories</span>.
          I&apos;ve always been fascinated by how much of the past is still unknown.
        </p>
        <p className="text-gray-400 leading-relaxed text-[15px]">
          I also like <span className="text-emerald-300">Valorant</span>,{" "}
          <span className="text-emerald-300">GTA VC</span>, and{" "}
          <span className="text-emerald-300">Conqueror&apos;s Blade</span> — they help me relax
          and sharpen my focus and decision-making.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            "Rockstar Games",
            "🐔 chicken farming",
            "🏛️ marvel",
            "🎮 Gaming",
          ].map((hobby) => (
            <span
              key={hobby}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 bg-gray-800/50"
            >
              {hobby}
            </span>
          ))}
        </div>
      </BioCard>
    </div>
  );
};


