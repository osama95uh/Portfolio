import { ExpandableText } from "./ExpandableText";

interface BioCardProps {
  title: string;
  children: React.ReactNode;
}

export const BioCard = ({ title, children }: BioCardProps) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 mb-4 last:mb-0">
      <p className="text-xs text-emerald-400 uppercase tracking-widest font-medium mb-3">
        {title}
      </p>
      <ExpandableText>{children}</ExpandableText>
    </div>
  );
};