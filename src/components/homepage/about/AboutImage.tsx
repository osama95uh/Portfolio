import Image from "next/image";

interface AboutImageProps {
  imageRef: React.RefObject<HTMLDivElement | null>;
}

export const AboutImage = ({ imageRef }: AboutImageProps) => {
  return (
    <div 
      ref={imageRef} 
      className="mb-8 md:mb-0 md:absolute md:inset-0 flex items-center justify-center transition-opacity"
    >
      <div className="relative max-w-[220px] sm:max-w-[280px] md:max-w-none">
        <div className="absolute inset-3 rounded-[2rem] bg-emerald-500/10 blur-xl" />
        <div className="relative rounded-[2rem] border border-emerald-500/25 bg-black/20 p-2 shadow-[0_0_24px_rgba(52,211,153,0.18)] backdrop-blur-sm">
          <Image
            src="/mew.png"
            alt="About Siam Khan"
            className="mx-auto object-cover rounded-[1.4rem] brightness-[0.8] contrast-125 saturate-110 drop-shadow-[0_0_18px_rgba(52,211,153,0.25)] w-full h-auto max-h-[220px] sm:max-h-[280px] md:max-h-[500px]"
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};