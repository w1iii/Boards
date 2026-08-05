import SideNavBarSkeleton from "@/app/components/side-nav-bar-skeleton"

const AREA_ACCENTS = [
  "bg-primary-fixed",
  "bg-secondary-fixed",
  "bg-tertiary-fixed",
  "bg-primary-fixed-dim",
  "bg-outline-variant",
]

const AREA_ICONS = ["groups", "pregnant_woman", "monitor_heart", "medical_services", "psychology"]

export default function MockExamLoading() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      <SideNavBarSkeleton />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden px-margin-mobile md:px-margin-desktop">
          <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-4 md:py-6">
            <div className="mb-3 md:mb-4 shrink-0">
              <div className="w-28 h-5 rounded-full shimmer bg-primary-fixed mb-1.5" />
              <div className="w-72 h-8 md:w-96 shimmer rounded-lg bg-surface-container-high" />
              <div className="w-96 h-4 shimmer rounded bg-surface-container-high mt-1" />
            </div>

            <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {AREA_ICONS.map((icon, i) => (
                  <div
                    key={icon}
                    className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest"
                  >
                    <div className={`absolute top-0 left-0 w-full h-0.5 ${AREA_ACCENTS[i]}`} style={{ opacity: 0.4 }} />
                    <div className="p-3.5 flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[24px] text-outline-variant/30 shrink-0">
                        {icon}
                      </span>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="w-3/4 h-4 rounded shimmer bg-surface-container-high" />
                        <div className="w-1/2 h-3 rounded shimmer bg-surface-container-high" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[22px] text-outline-variant/30 shrink-0">
                    schedule
                  </span>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="w-48 h-4 rounded shimmer bg-surface-container-high" />
                    <div className="w-2/3 h-3 rounded shimmer bg-surface-container-high" />
                    <div className="w-1/2 h-3 rounded shimmer bg-surface-container-high" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-3 md:pb-6 space-y-2.5 md:space-y-3">
          <div className="max-w-4xl mx-auto w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-3 md:p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5">
              <div className="flex-1 w-full space-y-2">
                <div className="w-40 h-3 rounded shimmer bg-surface-container-high" />
                <div className="w-full h-4 rounded-full shimmer bg-surface-container-high" />
              </div>
              <div className="shrink-0 bg-primary-fixed rounded-lg px-4 py-2.5 text-center min-w-[120px]">
                <div className="w-16 h-5 rounded shimmer bg-surface-container-high mx-auto" />
                <div className="w-24 h-2.5 rounded shimmer bg-surface-container-high mx-auto mt-1.5" />
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-5 py-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,218,213,0.6)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shimmer bg-surface-container-high" />
              <div className="w-32 h-4 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="w-40 h-9 rounded-full shimmer bg-primary-fixed" />
          </div>
        </div>
      </div>
    </div>
  )
}
