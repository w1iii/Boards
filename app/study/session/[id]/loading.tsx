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
            </div>
            <div className="w-full h-[3px] bg-surface-variant" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-3">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
            <section className="md:col-span-8">
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-md bg-surface-container-lowest border border-outline-variant space-y-2">
                    <div className="w-3/4 h-4 rounded shimmer bg-surface-container-high" />
                    <div className="w-1/2 h-4 rounded shimmer bg-surface-container-high" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-br-md bg-primary-fixed space-y-2">
                    <div className="w-2/3 h-4 rounded shimmer bg-primary-fixed-dim" />
                    <div className="w-1/3 h-4 rounded shimmer bg-primary-fixed-dim" />
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-md bg-surface-container-lowest border border-outline-variant space-y-2">
                    <div className="w-full h-4 rounded shimmer bg-surface-container-high" />
                    <div className="w-3/5 h-4 rounded shimmer bg-surface-container-high" />
                  </div>
                </div>
              </div>
            </section>

            <aside className="md:col-span-4 md:sticky md:top-3 md:self-start">
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
            </aside>
          </div>
        </main>

        <footer className="shrink-0 bg-surface-container-high border-t border-tertiary px-margin-mobile md:px-margin-desktop py-3">
          <div className="max-w-6xl mx-auto flex gap-3">
            <div className="flex-1 h-12 rounded-xl shimmer bg-surface-container-high" />
            <div className="w-24 h-12 rounded-xl shimmer bg-primary-fixed" />
          </div>
        </footer>
      </div>
    </div>
  )
}
