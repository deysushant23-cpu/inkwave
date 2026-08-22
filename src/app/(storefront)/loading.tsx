export default function StorefrontLoadingSkeleton() {
  return (
    <div className="pt-24 min-h-screen wrap animate-pulse pb-24 space-y-16">
      {/* Hero Banner Placeholder */}
      <div className="w-full aspect-[16/8] sm:aspect-[21/9] rounded-3xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden flex flex-col justify-end p-8 md:p-14 space-y-4 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent">
        <div className="h-4 w-28 bg-[var(--accent)]/20 rounded-md" />
        <div className="h-10 sm:h-16 w-2/3 max-w-xl bg-white/[0.08] rounded-2xl" />
        <div className="h-4 w-1/2 max-w-md bg-white/[0.04] rounded-md" />
        <div className="h-12 w-36 bg-[var(--accent)]/20 rounded-xl pt-2" />
      </div>

      {/* Featured Collection Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-[var(--accent)]/20 rounded" />
            <div className="h-8 w-48 bg-white/[0.08] rounded-xl" />
          </div>
          <div className="h-8 w-24 bg-white/[0.04] rounded-lg" />
        </div>

        {/* 4 Cards Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              <div className="aspect-[3/4] bg-white/[0.02]" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 bg-[var(--accent)]/10 rounded" />
                <div className="h-4 w-3/4 bg-white/[0.07] rounded" />
                <div className="h-4 w-1/3 bg-[var(--accent)]/20 rounded pt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
