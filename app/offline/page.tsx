"use client"

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="material-symbols-outlined text-6xl text-primary">
        wifi_off
      </span>
      <h1 className="font-heading-lg text-on-surface">You&apos;re offline</h1>
      <p className="max-w-sm font-body-md text-on-surface/70">
        Check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-full bg-primary px-8 py-3 font-label-lg text-on-primary active:scale-[0.97]"
      >
        Retry
      </button>
    </div>
  )
}
