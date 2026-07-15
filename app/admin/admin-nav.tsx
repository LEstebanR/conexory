"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/admin", label: "Métricas", exact: true },
  { href: "/admin/usuarios", label: "Usuarios", exact: false },
  { href: "/admin/referidos", label: "Referidos", exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 mb-8 border-b border-hairline">
      {TABS.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
              isActive
                ? "border-ink text-ink"
                : "border-transparent text-mute hover:text-ink"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
