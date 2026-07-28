import SideNavBarSkeleton from "@/app/components/side-nav-bar-skeleton"

export default function ProgressLoading() {
  return (
    <>
      <SideNavBarSkeleton />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
          <section className="mb-10">
            <div className="glass-jar p-8 md:p-10 rounded-3xl border border-white/50">
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1 space-y-3">
                  <div className="w-72 h-9 rounded shimmer bg-surface-container-high" />
                  <div className="w-96 h-5 rounded shimmer bg-surface-container-high" />
                  <div className="flex gap-4 mt-6">
                    <div className="w-36 h-11 rounded-full shimmer bg-primary-fixed" />
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-center space-y-2">
                  <div className="w-28 h-3 rounded shimmer bg-surface-container-high" />
                  <div className="w-[200px] h-[200px] rounded-full shimmer bg-surface-container-high" />
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-jar p-6 rounded-2xl space-y-2">
                <div className="w-20 h-3 rounded shimmer bg-surface-container-high" />
                <div className="w-24 h-8 rounded shimmer bg-surface-container-high" />
                <div className="w-16 h-3 rounded shimmer bg-surface-container-high mt-2" />
              </div>
            ))}
          </div>

          <div className="mb-10">
            <div className="flex items-end justify-between mb-6">
              <div className="w-48 h-7 rounded shimmer bg-surface-container-high" />
              <div className="w-32 h-3 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass-jar p-6 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl text-outline-variant/30">school</span>
                      <div className="space-y-1">
                        <div className="w-36 h-4 rounded shimmer bg-surface-container-high" />
                        <div className="w-48 h-3 rounded shimmer bg-surface-container-high" />
                      </div>
                    </div>
                    <div className="w-16 h-7 rounded shimmer bg-surface-container-high" />
                  </div>
                  <div className="h-2 w-full rounded-full shimmer bg-surface-container-high" />
                  <div className="flex justify-between">
                    <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
                    <div className="w-28 h-3 rounded shimmer bg-surface-container-high" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-end justify-between mb-6">
              <div className="w-36 h-7 rounded shimmer bg-surface-container-high" />
              <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3 px-4 bg-surface-container-low rounded-xl">
                  <div className="w-8 text-center shrink-0">
                    <div className="w-4 h-3 rounded shimmer bg-surface-container-high mx-auto" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-4 rounded shimmer bg-surface-container-high" />
                      <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-4 rounded shimmer bg-surface-container-high" />
                      <div className="w-16 h-3 rounded shimmer bg-surface-container-high" />
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full shimmer bg-surface-container-high shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
