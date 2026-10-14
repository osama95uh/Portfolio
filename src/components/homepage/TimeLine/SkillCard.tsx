export function SkillCard({ category, items }: { category: string; items: string[] }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 w-full">
      <p className="text-emerald-400 text-xs font-medium tracking-widest uppercase mb-3">
        {category}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-xs rounded-lg bg-gray-800/80 border border-gray-700
                       text-gray-300 hover:border-emerald-500/50 hover:text-emerald-300
                       transition-colors duration-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}