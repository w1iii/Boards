export default function Loading() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-primary-fixed/30">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-3 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary italic tracking-tight">
              BOARDS.
            </span>
            <nav className="hidden md:flex items-center gap-6">
              {["Dashboard", "Practice", "Progress"].map((label) => (
                <div key={label} className="w-20 h-4 rounded shimmer bg-surface-container-high" />
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-4 rounded shimmer bg-surface-container-high" />
            <div className="w-20 h-9 rounded-xl shimmer bg-primary-fixed" />
          </div>
        </div>
      </header>

      <header className="relative min-h-[80vh] flex flex-col justify-center px-margin-mobile md:px-margin-desktop pt-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter items-end pb-12 border-b border-tertiary">
          <div className="md:col-span-8 space-y-6">
            <div className="w-48 h-4 rounded-full shimmer bg-primary-fixed mb-4" />
            <div className="w-3/4 h-12 rounded shimmer bg-surface-container-high" />
            <div className="w-1/2 h-12 rounded shimmer bg-surface-container-high" />
            <div className="w-2/3 h-5 rounded shimmer bg-surface-container-high mt-8" />
            <div className="flex gap-4 mt-12">
              <div className="w-52 h-14 shimmer rounded-none bg-primary-fixed" />
              <div className="w-64 h-14 shimmer rounded-none bg-surface-container-high" />
            </div>
          </div>
          <div className="md:col-span-4 hidden md:flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-center w-full justify-end py-2">
                <div className="w-8 h-3 rounded shimmer bg-surface-container-high" />
                <div className="flex-grow border-t border-tertiary/20 mx-2" />
                <div className="w-28 h-3 rounded shimmer bg-surface-container-high" />
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-l border-tertiary pl-6 py-4 space-y-3">
              <div className="w-24 h-10 rounded shimmer bg-surface-container-high" />
              <div className="w-32 h-3 rounded shimmer bg-surface-container-high" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-3">
              <div className="w-16 h-3 rounded-full shimmer bg-primary-fixed" />
              <div className="w-72 h-10 rounded shimmer bg-surface-container-high" />
            </div>
            <div className="w-32 h-5 rounded shimmer bg-surface-container-high hidden md:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 bg-surface-container-high p-12 min-h-[500px] rounded-none">
              <div className="flex justify-between items-start">
                <div className="w-24 h-4 rounded-full shimmer bg-primary-fixed" />
                <span className="material-symbols-outlined text-4xl text-outline-variant/30">psychology</span>
              </div>
              <div className="mt-24 space-y-4">
                <div className="w-3/4 h-8 rounded shimmer bg-surface-container-low" />
                <div className="w-1/2 h-8 rounded shimmer bg-surface-container-low" />
                <div className="w-full h-4 rounded shimmer bg-surface-container-low mt-8" />
                <div className="w-2/3 h-4 rounded shimmer bg-surface-container-low" />
              </div>
            </div>
            <div className="md:col-span-4 grid grid-rows-2 gap-gutter">
              <div className="bg-surface-container-high p-8 rounded-none">
                <div className="w-full h-32 rounded shimmer bg-surface-container-low mb-6" />
                <div className="w-40 h-6 rounded shimmer bg-surface-container-low" />
              </div>
              <div className="bg-primary-fixed/40 p-8 rounded-none">
                <div className="w-10 h-10 rounded shimmer bg-primary-fixed/20 mb-8" />
                <div className="w-36 h-6 rounded shimmer bg-surface-container-low" />
                <div className="w-48 h-3 rounded shimmer bg-surface-container-low mt-2" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="md:col-span-4 bg-surface-container-high p-6 h-64 rounded-none">
                <div className="w-40 h-6 rounded shimmer bg-surface-container-low" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="w-40 h-4 rounded-full shimmer bg-primary-fixed mx-auto mb-2" />
          <div className="w-64 h-10 rounded shimmer bg-surface-container-high mx-auto mb-20" />
          <div className="grid grid-cols-1 md:grid-cols-3 border-y border-tertiary">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-12 md:border-r border-tertiary space-y-4">
                <div className="w-16 h-10 rounded shimmer bg-surface-container-high mb-8" />
                <div className="w-36 h-6 rounded shimmer bg-surface-container-high" />
                <div className="w-full h-4 rounded shimmer bg-surface-container-high" />
                <div className="w-3/4 h-4 rounded shimmer bg-surface-container-high" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-highest">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-4 space-y-4">
            <div className="w-48 h-10 rounded shimmer bg-surface-container-high" />
            <div className="w-56 h-4 rounded shimmer bg-surface-container-high" />
          </div>
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            {[1, 2].map((i) => (
              <div key={i} className="bg-surface-container-high p-12">
                <div className="w-20 h-3 rounded shimmer bg-primary-fixed mb-8" />
                <div className="w-28 h-6 rounded shimmer bg-surface-container-low mb-2" />
                <div className="w-24 h-10 rounded shimmer bg-primary-fixed/60 mb-8" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-40 h-4 rounded shimmer bg-surface-container-low mb-4" />
                ))}
                <div className="w-full h-12 rounded-none shimmer bg-primary-fixed/40 mt-8" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-primary-fixed/80 border-t border-primary-fixed/30 px-margin-mobile md:px-margin-desktop py-section-gap w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="md:col-span-2 space-y-4">
            <div className="w-32 h-12 rounded shimmer bg-surface-container-low" />
            <div className="w-64 h-4 rounded shimmer bg-surface-container-low" />
          </div>
          {[1, 2].map((col) => (
            <div key={col} className="flex flex-col gap-4">
              <div className="w-20 h-3 rounded shimmer bg-primary-fixed/20 mb-2" />
              {[1, 2, 3].map((row) => (
                <div key={row} className="w-24 h-3 rounded shimmer bg-surface-container-low" />
              ))}
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-tertiary/20 flex flex-col md:flex-row justify-between gap-4">
          <div className="w-64 h-3 rounded shimmer bg-surface-container-low" />
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded shimmer bg-surface-container-low" />
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
