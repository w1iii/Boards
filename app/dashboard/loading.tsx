import SideNavBarSkeleton from "@/app/components/side-nav-bar-skeleton"

export default function DashboardLoading() {
  return (
    <>
      <SideNavBarSkeleton />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
          <section className="mb-10">
            <div className="glass-jar p-8 md:p-10 rounded-3xl border border-white/50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="w-64 h-9 rounded shimmer bg-surface-container-high" />
                  <div className="w-96 h-5 rounded shimmer bg-surface-container-high" />
                </div>
                <div className="flex gap-4 shrink-0">
                  <div className="w-36 h-11 rounded-full shimmer bg-primary-fixed" />
                  <div className="w-36 h-11 rounded-full shimmer bg-surface-container-high" />
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-jar p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-2">
                <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
                <div className="w-20 h-9 rounded shimmer bg-surface-container-high" />
              </div>
              <div className="w-20 h-20 rounded-full shimmer bg-surface-container-high shrink-0" />
            </div>
            <div className="glass-jar p-6 rounded-2xl space-y-2">
              <div className="w-24 h-3 rounded shimmer bg-surface-container-high" />
              <div className="w-20 h-9 rounded shimmer bg-surface-container-high" />
              <div className="w-36 h-3 rounded shimmer bg-surface-container-high mt-2" />
            </div>
            <div className="glass-jar p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-2">
                <div className="w-20 h-3 rounded shimmer bg-surface-container-high" />
                <div className="w-16 h-9 rounded shimmer bg-surface-container-high" />
              </div>
              <span className="material-symbols-outlined text-4xl text-outline-variant/30">warning</span>
            </div>
          </div>

          <div className="w-48 h-7 rounded shimmer bg-surface-container-high mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
            <div className="md:col-span-8 space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass-jar p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-40 h-4 rounded shimmer bg-surface-container-high" />
                    <div className="w-10 h-4 rounded shimmer bg-surface-container-high" />
                  </div>
                  <div className="h-2 w-full rounded-full shimmer bg-surface-container-high" />
                </div>
              ))}
            </div>
            <div className="md:col-span-4 space-y-6">
              <div className="bg-primary-fixed/30 p-8 rounded-3xl relative overflow-hidden">
                <div className="w-32 h-4 rounded shimmer bg-surface-container-low mb-4" />
                <div className="w-full h-4 rounded shimmer bg-surface-container-low mb-2" />
                <div className="w-3/4 h-4 rounded shimmer bg-surface-container-low" />
              </div>
              <div className="glass-jar p-6 rounded-3xl flex flex-col items-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-outline-variant/30">stars</span>
                <div className="w-24 h-4 rounded shimmer bg-surface-container-high" />
                <div className="w-36 h-3 rounded shimmer bg-surface-container-high" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
