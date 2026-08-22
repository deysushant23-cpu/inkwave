export default function ProductLoadingSkeleton() {
  return (
    <main className="pt-28 sm:pt-32 pb-24 wrap animate-pulse">
      {/* Top Product Overview Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        
        {/* Left: Gallery Skeleton (5 cols) */}
        <div className="lg:col-span-6 flex gap-4">
          {/* Thumbnails Rail Skeleton (Desktop) */}
          <div className="hidden sm:flex flex-col gap-3 w-20 shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="w-20 h-24 rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent" 
              />
            ))}
          </div>

          {/* Main PDP Image Skeleton */}
          <div className="flex-1 aspect-[3/4] rounded-2xl bg-white/[0.04] border border-white/[0.06] relative overflow-hidden flex items-center justify-center before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.05]" />
          </div>
        </div>

        {/* Right: Info & Controls Skeleton (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Category & Status tag */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-white/[0.06] rounded-md" />
            <div className="h-5 w-28 bg-[var(--accent)]/10 rounded-full border border-[var(--accent)]/20" />
          </div>

          {/* Product Title Skeleton */}
          <div className="space-y-2">
            <div className="h-8 md:h-10 w-3/4 bg-white/[0.08] rounded-xl" />
            <div className="h-4 w-1/3 bg-white/[0.04] rounded-md" />
          </div>

          {/* Price Row Skeleton */}
          <div className="flex items-center gap-4 py-2 border-y border-white/[0.06]">
            <div className="h-8 w-28 bg-[var(--accent)]/20 rounded-lg" />
            <div className="h-5 w-20 bg-white/[0.04] rounded-lg line-through" />
            <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-white/[0.04] rounded" />
            <div className="h-3.5 w-5/6 bg-white/[0.04] rounded" />
            <div className="h-3.5 w-2/3 bg-white/[0.04] rounded" />
          </div>

          {/* Size Selector Skeleton */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-24 bg-white/[0.05] rounded" />
              <div className="h-3.5 w-16 bg-white/[0.05] rounded" />
            </div>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <div key={sz} className="h-12 w-14 rounded-xl bg-white/[0.04] border border-white/[0.06]" />
              ))}
            </div>
          </div>

          {/* Dual Action Buttons Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="h-14 rounded-xl bg-[var(--accent)]/20 border border-[var(--accent)]/30" />
            <div className="h-14 rounded-xl bg-white/[0.08] border border-white/[0.1]" />
          </div>

          {/* Pincode & Delivery Box Skeleton */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <div className="h-4 w-40 bg-white/[0.06] rounded" />
            <div className="h-11 w-full bg-white/[0.04] rounded-xl border border-white/[0.06]" />
          </div>

        </div>

      </div>

      {/* Recommended Grid Skeleton */}
      <div className="mt-28 pt-16 border-t border-white/[0.06] space-y-8">
        <div className="h-8 w-48 bg-white/[0.08] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col justify-end gap-2">
              <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
              <div className="h-4 w-1/3 bg-white/[0.04] rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
