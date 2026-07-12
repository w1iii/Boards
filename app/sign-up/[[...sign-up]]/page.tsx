import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6">
            <h1 className="font-display-md text-2xl md:text-3xl font-black tracking-tighter text-primary mb-1">
              BOARDS.
            </h1>
            <p className="text-sm text-on-surface-variant">
              Elevate Your Practice
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-tertiary-fixed px-3 py-1 border border-tertiary">
              <span
                className="material-symbols-outlined text-[14px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                group
              </span>
              <span className="font-label-caps text-[9px] text-on-tertiary-fixed uppercase">
                Join 5,000+ nursing students
              </span>
            </div>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto w-full',
                card: 'bg-surface-container-lowest border border-secondary shadow-none p-6 md:p-8',
                headerTitle: 'font-display-md text-2xl md:text-3xl font-black tracking-tighter text-primary',
                headerSubtitle: 'text-sm text-on-surface-variant',
                socialButtonsBlockButton: 'border border-secondary text-on-surface hover:bg-surface-container-lowest',
                socialButtonsBlockButtonText: 'text-sm font-body-md text-on-surface',
                dividerLine: 'bg-tertiary',
                dividerText: 'font-label-caps text-[10px] text-secondary-fixed-dim',
                formFieldLabel: 'font-label-caps text-[10px] text-on-surface-variant',
                formFieldInput: 'w-full bg-surface border-b border-tertiary px-0 py-2 text-sm text-on-surface placeholder:text-secondary-fixed-dim focus:border-primary focus:outline-none focus:ring-0',
                formButtonPrimary: 'w-full bg-primary text-on-primary text-sm py-3 uppercase tracking-wider transition-all hover:bg-on-primary-fixed-variant active:scale-[0.98]',
                footerActionText: 'text-sm text-on-surface-variant',
                footerActionLink: 'text-primary font-bold hover:underline',
                identityPreviewText: 'text-on-surface',
                identityPreviewEditButton: 'text-primary',
              },
            }}
          />
        </div>
      </main>

      <footer className="w-full py-6 px-margin-mobile border-t border-tertiary bg-surface text-center">
        <p className="font-label-caps text-[10px] text-secondary-fixed-dim">
          &copy; 2024 BOARDS. NURSING EXCELLENCE PLATFORM.
        </p>
      </footer>
    </div>
  )
}
