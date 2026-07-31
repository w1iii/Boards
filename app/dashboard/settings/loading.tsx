import SideNavBarSkeleton from "@/app/components/side-nav-bar-skeleton"

export default function SettingsLoading() {
  return (
    <>
      <SideNavBarSkeleton />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
          <div className="max-w-3xl">
            <div className="w-40 h-9 rounded shimmer bg-surface-container-high mb-2" />
            <div className="w-72 h-5 rounded shimmer bg-surface-container-high mb-8" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-jar p-6 md:p-8 rounded-2xl mb-6 space-y-4">
                <div className="w-32 h-6 rounded shimmer bg-surface-container-high" />
                <div className="w-full h-11 rounded shimmer bg-surface-container-high" />
                <div className="w-40 h-10 rounded-full shimmer bg-primary-fixed/40" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
