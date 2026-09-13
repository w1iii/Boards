import Link from "next/link"

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: { href: string; label: string; icon?: string }
}

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 font-label-caps text-label-caps uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display-lg text-display-lg text-primary">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-title-md text-sm text-on-primary candy-button-shadow transition-all hover:bg-primary-container active:translate-y-0.5"
        >
          {action.icon && <span className="material-symbols-outlined text-lg">{action.icon}</span>}
          {action.label}
        </Link>
      )}
    </header>
  )
}
