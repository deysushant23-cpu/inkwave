export default function CategoryLoadingSkeleton() {
  return (
    <main className="pt-28 pb-24 wrap animate-pulse">
      {/* Category Hero Skeleton */}
      <div className="py-12 md:py-16 border-b border-white/[0.06] space-y-4 mb-12">
        <div className="h-4 w-28 bg-[var(--accent)]/20 rounded-md" />
        <div className="h-10 md:h-14 w-1/2 bg-white/[0.08] rounded-2xl" />
        <div className="h-4 w-3/4 max-w-xl bg-white/[0.04] rounded-md" />
      </div>

      {/* Filter & Sort Bar Skeleton */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/[0.04]">
        <div className="h-4 w-24 bg-white/[0.05] rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
          <div className="h-9 w-28 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div 
            key={i} 
            className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden flex flex-col relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent"
          >
            <div className="aspect-[3/4] bg-white/[0.02]" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-16 bg-[var(--accent)]/10 rounded" />
              <div className="h-4 w-3/4 bg-white/[0.07] rounded" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-4 w-16 bg-[var(--accent)]/20 rounded" />
                <div className="h-3 w-10 bg-white/[0.04] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
