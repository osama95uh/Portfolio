import Image from "next/image";

interface AboutImageProps {
  imageRef: React.RefObject<HTMLDivElement | null>;
}

export const AboutImage = ({ imageRef }: AboutImageProps) => {
  return (
    <div 
      ref={imageRef} 
      className="absolute inset-0 flex items-center justify-center transition-opacity"
    >
      <div className="relative">
        <div className="absolute inset-5 rounded-[2rem] bg-emerald-500/10 blur-2xl" />
        <div className="relative rounded-[2rem] border border-emerald-500/25 bg-black/20 p-2 shadow-[0_0_30px_rgba(52,211,153,0.18)] backdrop-blur-sm">
          <Image
            src="/mew.png"
            alt="About"
            className="mx-auto object-cover rounded-[1.4rem] brightness-[0.75] contrast-125 saturate-110 drop-shadow-[0_0_18px_rgba(52,211,153,0.25)]"
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};