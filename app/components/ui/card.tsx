import { forwardRef } from "react"

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md ${className}`}
      {...props}
    />
  ),
)

Card.displayName = "Card"

export default Card
