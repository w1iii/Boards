import SideNavBarSkeleton from "@/app/components/side-nav-bar-skeleton"

const MODE_ICONS = ["psychology", "clinical_notes", "bolt", "record_voice_over"]
const AREA_ICONS = ["groups", "pregnant_woman", "monitor_heart", "medical_services", "psychology"]

export default function StudyLoading() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden text-on-surface">
      <SideNavBarSkeleton />

      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden px-margin-mobile md:px-margin-desktop">
          <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 overflow-hidden py-3 md:py-5">
            <header className="mb-4 md:mb-5 shrink-0">
              <div className="w-28 h-3.5 rounded shimmer bg-surface-container-high mb-1.5" />
              <div className="w-56 h-8 md:w-72 shimmer rounded-lg bg-surface-container-high mb-2" />
              <div className="w-64 h-4 shimmer rounded bg-surface-container-high" />
            </header>

            <div className="flex-1 overflow-y-auto -mx-3 px-3 pb-3">
              <div className="mb-5">
                <div className="w-28 h-3 rounded shimmer bg-surface-container-high mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                  {MODE_ICONS.map((icon) => (
                    <div
                      key={icon}
                      className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6 flex flex-col h-full"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary/20" style={{ fontSize: 26 }}>{icon}</span>
                      </div>
                      <div className="mt-auto space-y-2">
                        <div className="w-3/4 h-5 rounded shimmer bg-surface-container-high" />
                        <div className="w-1/2 h-3.5 rounded shimmer bg-surface-container-high" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="w-28 h-3 rounded shimmer bg-surface-container-high mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                  {AREA_ICONS.map((icon) => (
                    <div
                      key={icon}
                      className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6 flex flex-col h-full"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary/20" style={{ fontSize: 26 }}>{icon}</span>
                      </div>
                      <div className="mt-auto">
                        <div className="w-3/4 h-5 rounded shimmer bg-surface-container-high" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-margin-mobile md:px-margin-desktop pb-3 md:pb-6">
          <div className="max-w-7xl mx-auto bg-surface-container-lowest rounded-full border border-outline-variant/30 p-1.5 pl-4 md:pl-5 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full shimmer bg-surface-container-high" />
              <div className="w-32 h-4 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="w-44 h-9 rounded-full shimmer bg-primary-fixed" />
          </div>
        </div>
      </div>
    </div>
  )
}
