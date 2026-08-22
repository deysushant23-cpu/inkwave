export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin" />
        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--text-dim)] animate-pulse">
          INKWAVE
        </span>
      </div>
    </div>
  );
}
