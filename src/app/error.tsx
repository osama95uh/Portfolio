"use client";

/**
 * Route-level crash guard: if a section ever throws (e.g. a Supabase hiccup
 * at render), visitors get this on-brand screen instead of a raw crash. The
 * `reset()` remounts the segment so a transient failure can self-recover.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 text-gray-200 font-mono flex items-center justify-center px-4 relative overflow-hidden">
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
          <span className="text-emerald-500">&gt;</span> ERROR_500
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          $ tail -n 3 ./route.log
        </p>
        <p className="text-red-400/90 text-xs mb-1 break-words">
          {error.digest ? `trace: ${error.digest}` : "runtime error"}
        </p>
        <p className="text-gray-500 text-xs mb-8">
          Something failed on our side, not yours. A connection retry usually
          fixes it.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 border border-emerald-500/40 bg-emerald-500/10 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors uppercase tracking-[2px]"
          >
            &gt; retry
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-emerald-500/20 text-sm text-gray-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors uppercase tracking-[2px]"
          >
            &gt; back to home
          </a>
        </div>
      </div>
    </main>
  );
}
