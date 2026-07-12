import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, #e8e2d5 1px, transparent 1px), linear-gradient(to bottom, #e8e2d5 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  medical_services
                </span>
              </div>
            </div>
            <h1 className="font-display-md text-2xl md:text-3xl font-black tracking-tighter text-on-surface">
              BOARDS.
            </h1>
            <p className="font-label-caps text-[10px] uppercase text-secondary tracking-widest mt-1">
              Nursing Excellence Platform
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary z-10" />
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'mx-auto w-full',
                  card: 'bg-surface-container-lowest border border-tertiary shadow-none p-6 md:p-8 relative',
                  headerTitle: 'font-headline-lg text-xl text-on-surface',
                  headerSubtitle: 'text-sm text-on-surface-variant',
                  socialButtonsBlockButton: 'border-2 border-on-surface-variant text-on-surface hover:bg-surface-container hover:border-on-surface',
                  socialButtonsBlockButtonText: 'text-sm font-body-md text-on-surface',
                  dividerLine: 'bg-tertiary',
                  dividerText: 'font-label-caps text-[10px] text-secondary',
                  formFieldLabel: 'font-label-caps text-[10px] text-secondary',
                  formFieldInput: 'w-full bg-surface-container-low border border-tertiary px-3 py-2 text-sm text-on-surface placeholder:text-on-secondary-fixed-variant focus:border-primary focus:outline-none focus:ring-0',
                  formButtonPrimary: 'w-full bg-primary text-on-primary text-sm py-3 transition-all hover:bg-primary-container active:scale-[0.98] uppercase tracking-wider',
                  footerActionText: 'text-sm text-secondary',
                  footerActionLink: 'text-primary font-bold hover:underline',
                  identityPreviewText: 'text-on-surface',
                  identityPreviewEditButton: 'text-primary',
                },
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 opacity-50">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-secondary text-lg mb-1">verified_user</span>
              <span className="font-label-caps text-[9px]">ENCRYPTED</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-secondary text-lg mb-1">school</span>
              <span className="font-label-caps text-[9px]">NLE CURRICULUM</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-secondary text-lg mb-1">clinical_notes</span>
              <span className="font-label-caps text-[9px]">BOARD READY</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-tertiary bg-surface-container relative z-10">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-label-caps text-on-secondary-container opacity-60">
            &copy; 2024 BOARDS. Nursing Excellence Platform. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a className="font-label-caps text-[10px] text-on-secondary-container hover:text-primary transition-colors" href="#">
              PRIVACY POLICY
            </a>
            <a className="font-label-caps text-[10px] text-on-secondary-container hover:text-primary transition-colors" href="#">
              TERMS OF SERVICE
            </a>
            <a className="font-label-caps text-[10px] text-on-secondary-container hover:text-primary transition-colors" href="#">
              SUPPORT
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
