import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 text-gray-200 font-mono flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-emerald-500/20 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-xl border border-emerald-500/25 bg-black/70 p-8 shadow-xl">
        <div className="flex gap-1.5 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <p className="ml-auto text-[10px] tracking-[3px] uppercase text-emerald-500">
            secure-shell
          </p>
        </div>

        <h1 className="text-emerald-400 text-xl mb-2">
          <span className="text-emerald-500">&gt;</span> ERROR_404
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          $ cd <span className="text-red-400">/requested-page</span>
        </p>
        <p className="text-gray-500 text-xs mb-8">
          not found — this route does not exist on this network. The packet
          never made it to its destination.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 border border-emerald-500/40 bg-emerald-500/10 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors uppercase tracking-[2px]"
          >
            &gt; back to home
          </Link>
          <Link
            href="/#projects"
            className="px-5 py-2.5 border border-emerald-500/20 text-sm text-gray-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors uppercase tracking-[2px]"
          >
            &gt; browse projects
          </Link>
        </div>
      </div>
    </main>
  );
}
