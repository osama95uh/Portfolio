export function EduCard({
  degree,
  institution,
  period,
  note,
  badge,
}: {
  degree: string;
  institution: string;
  period: string;
  note?: string;
  badge: string;
}) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 w-full">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-gray-100 font-semibold text-sm leading-snug">
          {degree}
        </p>
        <span
          className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            badge === "Ongoing"
              ? "border-emerald-600/40 text-emerald-400 bg-emerald-500/10"
              : "border-gray-600/40 text-gray-400 bg-gray-700/30"
          }`}
        >
          {badge}
        </span>
      </div>
      <p className="text-emerald-400 text-xs font-medium mb-1">{institution}</p>
      <p className="text-gray-500 text-xs">{period}</p>
      {note && <p className="text-gray-500 text-xs mt-1">{note}</p>}
    </div>
  );
}