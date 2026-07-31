export default function Loading() {
  return (
    <main className="font-sans antialiased overflow-x-hidden">
      <div className="min-h-screen flex items-center justify-center p-0 md:p-2 lg:p-4" style={{ backgroundColor: "#2b2b2b" }}>
        <div className="flex flex-col lg:flex-row w-full max-w-[1440px] bg-boards-charcoal overflow-hidden shadow-2xl">
          <section className="relative flex-1 bg-boards-charcoal p-6 lg:p-10 flex flex-col justify-between overflow-hidden min-h-[380px] lg:min-h-[440px]">
            <div className="space-y-4">
              <div className="w-36 h-12 rounded shimmer bg-white/10" />
              <div className="w-64 h-3 rounded shimmer bg-white/10" />
            </div>
            <div className="space-y-3">
              <div className="w-3/4 h-10 rounded shimmer bg-white/10" />
              <div className="w-1/2 h-10 rounded shimmer bg-white/10" />
            </div>
          </section>

          <section className="flex-1 bg-white p-6 lg:p-10 flex flex-col justify-center items-center">
            <div className="w-full max-w-md space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-48 h-9 rounded shimmer bg-gray-200" />
                <div className="w-20 h-4 rounded shimmer bg-gray-200" />
              </div>
              <div className="space-y-4">
                <div className="w-full h-14 rounded-2xl shimmer bg-gray-100" />
                <div className="w-full h-14 rounded-2xl shimmer bg-gray-100" />
                <div className="w-full h-14 rounded-2xl shimmer bg-gray-100" />
                <div className="w-full h-14 rounded-full shimmer bg-red-200" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
