export default function SideNavBarSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 pt-6 pb-6 z-40 bg-surface-container-low/80 backdrop-blur-md border-r border-outline-variant/30 w-64 rounded-r-2xl shadow-sm">
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary-fixed/20 to-secondary-fixed/10 rounded-2xl border border-primary-fixed/20">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary-fixed shrink-0 shadow-sm shimmer" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="w-20 h-3 rounded shimmer bg-surface-container-high" />
            <div className="w-14 h-2 rounded shimmer bg-surface-container-high" />
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {["home", "edit_note", "quiz", "monitoring"].map((icon) => (
          <div
            key={icon}
            className="flex items-center px-4 py-2.5 gap-3 rounded-xl"
          >
            <span className="material-symbols-outlined text-xl text-outline-variant/30">
              {icon}
            </span>
            <div className="w-16 h-3 rounded shimmer bg-surface-container-high" />
          </div>
        ))}
      </nav>

      <div className="mt-auto px-3 pt-4 border-t border-outline-variant/20 space-y-1">
        <div className="flex items-center px-4 py-2.5 gap-3 rounded-xl">
          <span className="material-symbols-outlined text-xl text-outline-variant/30">
            settings
          </span>
          <div className="w-12 h-3 rounded shimmer bg-surface-container-high" />
        </div>
        <div className="w-full mt-2 py-2.5 px-4 rounded-xl shimmer bg-primary-fixed/40" />
      </div>
    </aside>
  )
}
