export function ProjectCard({
  title,
  org,
  desc,
  badge,
}: {
  title: string;
  org: string;
  desc: string;
  badge: string;
}) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 w-full">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-gray-100 font-semibold text-sm leading-snug">
          {title}
        </p>
        <span
          className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            badge === "Research"
              ? "border-blue-600/40 text-blue-400 bg-blue-500/10"
              : "border-emerald-600/40 text-emerald-400 bg-emerald-500/10"
          }`}
        >
          {badge}
        </span>
      </div>
      <p className="text-emerald-400 text-xs font-medium mb-1">{org}</p>
      <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}
