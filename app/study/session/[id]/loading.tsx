import SideNavBarSkeleton from "@/app/components/side-nav-bar-skeleton"

export default function StudySessionLoading() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      <SideNavBarSkeleton />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 px-margin-mobile md:px-margin-desktop pt-4 pb-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-3">
              <div>
                <div className="w-20 h-3 rounded shimmer bg-surface-container-high mb-1" />
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-40 h-6 rounded shimmer bg-surface-container-high" />
                  <div className="w-24 h-5 rounded shimmer bg-surface-container-high" />
                </div>
              </div>
              <div className="w-16 h-5 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="w-full h-[3px] bg-surface-variant">
              <div className="h-full w-1/4 bg-primary/50" />
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-3">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
            <section className="md:col-span-8">
              <div className="space-y-4">
                <div className="p-5 border-l-4 border-primary bg-surface-container-lowest rounded-2xl rounded-bl-md">
                  <div className="w-4/5 h-4 rounded shimmer bg-surface-container-high mb-2" />
                  <div className="w-3/4 h-4 rounded shimmer bg-surface-container-high mb-2" />
                  <div className="w-2/3 h-4 rounded shimmer bg-surface-container-high" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center p-5 border border-outline-variant bg-white rounded-2xl">
                      <div className="w-7 h-7 flex items-center justify-center rounded shimmer bg-surface-container-high mr-3" />
                      <div className="flex-1 space-y-2">
                        <div className="w-full h-3 rounded shimmer bg-surface-container-high" />
                        <div className="w-2/3 h-3 rounded shimmer bg-surface-container-high" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="md:col-span-4 md:sticky md:top-3 md:self-start space-y-4">
              <div className="p-5 border border-tertiary-fixed bg-surface-container-low">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded shimmer bg-surface-container-high" />
                  <div className="w-16 h-3 rounded shimmer bg-surface-container-high" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 rounded shimmer bg-surface-container-high" />
                  <div className="w-4/5 h-3 rounded shimmer bg-surface-container-high" />
                  <div className="w-3/4 h-3 rounded shimmer bg-surface-container-high" />
                </div>
              </div>

              <div className="p-5 bg-inverse-surface text-surface border-t-8 border-primary">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded shimmer bg-surface-container-high" />
                  <div className="w-20 h-3 rounded shimmer bg-surface-container-high" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="w-16 h-3 rounded shimmer bg-surface-container-high mb-1.5" />
                    <div className="w-8 h-7 rounded shimmer bg-surface-container-high" />
                  </div>
                  <div>
                    <div className="w-16 h-3 rounded shimmer bg-surface-container-high mb-1.5" />
                    <div className="w-8 h-7 rounded shimmer bg-surface-container-high" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-primary rounded-full" />
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="shrink-0 bg-surface-container-high border-t border-tertiary px-margin-mobile md:px-margin-desktop py-3">
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
            <div className="w-28 h-6 rounded shimmer bg-surface-container-high" />
            <div className="w-20 h-3 rounded shimmer bg-surface-container-high" />
            <div className="w-28 h-6 rounded shimmer bg-surface-container-high" />
          </div>
        </footer>
      </div>
    </div>
  )
}