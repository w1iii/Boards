import { SignIn } from '@clerk/nextjs'
import TopNavBar from '@/app/components/top-nav-bar'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar variant="public" />

      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12 relative z-10 pt-28">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-md">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              </div>
            </div>
            <h1 className="font-display-md text-3xl font-black tracking-tighter text-primary mb-1">BOARDS.</h1>
            <p className="font-body-md text-on-surface-variant">Elevate Your Practice</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-primary-fixed/40 px-3 py-1.5 rounded-xl border border-primary-fixed/30">
              <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
              <span className="font-label-caps text-[9px] text-primary uppercase">Join 5,000+ nursing students</span>
            </div>
          </div>

          <SignIn
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'mx-auto w-full',
                card: 'glass-jar border border-white/40 shadow-none p-6 md:p-8 rounded-2xl',
                headerTitle: 'font-display-md text-2xl font-black tracking-tighter text-primary',
                headerSubtitle: 'text-sm text-on-surface-variant',
                socialButtonsBlockButton: 'border border-outline-variant text-on-surface hover:bg-surface-container rounded-xl',
                socialButtonsBlockButtonText: 'text-sm font-body-md text-on-surface',
                dividerLine: 'bg-outline-variant',
                dividerText: 'font-label-caps text-[10px] text-on-surface-variant',
                formFieldLabel: 'font-label-caps text-[10px] text-on-surface-variant',
                formFieldInput: 'w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-0 transition-all',
                formButtonPrimary: 'w-full bg-primary text-on-primary text-sm py-3 rounded-xl font-label-caps uppercase tracking-wider transition-all hover:bg-primary-container active:scale-[0.98] candy-button-shadow',
                footerActionText: 'text-sm text-on-surface-variant',
                footerActionLink: 'text-primary font-bold hover:underline',
                identityPreviewText: 'text-on-surface',
                identityPreviewEditButton: 'text-primary',
              },
            }}
          />
        </div>
      </main>

      <footer className="w-full py-6 px-margin-mobile border-t border-outline-variant/30 bg-surface-container-low/50 backdrop-blur-md text-center relative z-10">
        <p className="font-label-caps text-[10px] text-on-surface-variant">&copy; 2024 BOARDS. NURSING EXCELLENCE PLATFORM.</p>
      </footer>
    </div>
  )
}
