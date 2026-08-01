export const NAV_ITEMS: Array<{
  href: string
  label: string
  icon: string
  query?: boolean
}> = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/practice", label: "Practice", icon: "edit_note" },
  { href: "/practice?type=mock-exam", label: "Mock Exam", icon: "quiz", query: true },
  { href: "/progress", label: "Progress", icon: "monitoring" },
]
