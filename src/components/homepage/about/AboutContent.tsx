import { LeftColumn } from "./LeftColumn";
import { RightColumn } from "./RightColumn";

interface AboutContentProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  leftColRef: React.RefObject<HTMLDivElement | null>;
  rightColRef: React.RefObject<HTMLDivElement | null>;
}

export const AboutContent = ({ contentRef, leftColRef, rightColRef }: AboutContentProps) => {
  return (
    <div ref={contentRef} className="w-full md:absolute md:inset-0 md:opacity-0">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 h-full items-start">
        <LeftColumn leftColRef={leftColRef} />
        <RightColumn rightColRef={rightColRef} />
      </div>
    </div>
  );
};