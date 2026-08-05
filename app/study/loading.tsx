import SideNavBarSkeleton from "@/app/components/side-nav-bar-skeleton"

const MODE_SLOTS = Array.from({ length: 5 })
const AREA_SLOTS = Array.from({ length: 5 })

export default function StudyLoading() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      <SideNavBarSkeleton />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden px-margin-mobile md:px-margin-desktop">
          <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-4 md:py-6">
            <div className="mb-4 md:mb-5 shrink-0">
              <div className="w-24 h-5 rounded-full shimmer bg-primary-fixed mb-1.5" />
              <div className="w-56 h-8 md:w-72 shimmer rounded-lg bg-surface-container-high" />
              <div className="w-64 h-4 shimmer rounded bg-surface-container-high mt-1" />
            </div>

            <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2">
              <div className="mb-4">
                <div className="w-28 h-3 rounded shimmer bg-surface-container-high mb-2" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {MODE_SLOTS.map((_, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-3.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded shimmer bg-surface-container-high shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="w-3/4 h-4 rounded shimmer bg-surface-container-high" />
                          <div className="w-1/2 h-3 rounded shimmer bg-surface-container-high" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="w-30 h-3 rounded shimmer bg-surface-container-high mb-2" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {AREA_SLOTS.map((_, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-3.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded shimmer bg-surface-container-high shrink-0" />
                        <div className="flex-1">
                          <div className="w-3/4 h-4 rounded shimmer bg-surface-container-high" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-3 md:pb-6 space-y-2.5 md:space-y-3">
          <div className="max-w-4xl mx-auto w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-3.5 md:p-5">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shimmer bg-surface-container-high" />
              <div className="w-48 h-4 rounded shimmer bg-surface-container-high" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-6 py-3 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,218,213,0.6)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shimmer bg-surface-container-high" />
              <div className="w-36 h-4 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="w-44 h-9 rounded-full shimmer bg-primary-fixed" />
          </div>
        </div>
      </div>
    </div>
  )
}
