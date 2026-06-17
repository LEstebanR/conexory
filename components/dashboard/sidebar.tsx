"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  LayoutGrid,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"

interface User {
  name: string
  email: string
  image: string | null
}

function UserAvatar({ name, image, size = 32 }: { name: string; image: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const colors = [
    "bg-ink",
    "bg-brand-700",
    "bg-brand-600",
    "bg-brand-800",
    "bg-brand-900",
    "bg-elevated",
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  const px = `${size}px`

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <div
      className={cn("rounded-full flex items-center justify-center text-white font-bold flex-shrink-0", color)}
      style={{ width: px, height: px, fontSize: size * 0.375 }}
    >
      {initials}
    </div>
  )
}

const navItems = [
  {
    icon: LayoutGrid,
    label: "Mis propiedades",
    href: "/dashboard",
    exact: true,
  },
]


function NavLink({
  href,
  icon: Icon,
  label,
  exact = false,
  soon = false,
  onClick,
}: {
  href: string
  icon: React.ElementType
  label: string
  exact?: boolean
  soon?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  if (soon) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 cursor-default select-none">
        <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
        <span className="text-sm font-medium flex-1">{label}</span>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Pronto</span>
      </div>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
        isActive
          ? "bg-brand-50 text-brand-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon
        className={cn("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-brand-500" : "")}
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className={cn("text-sm flex-1", isActive ? "font-bold" : "font-medium")}>
        {label}
      </span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />}
    </Link>
  )
}

function SidebarContent({ user, onClose }: { user: User; onClose?: () => void }) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 flex-shrink-0">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-ink tracking-tight">Conexory</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Nueva propiedad CTA */}
        <Link
          href="/dashboard/properties/new"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-ink text-white hover:bg-elevated transition-colors mb-3"
        >
          <Plus className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={2.5} />
          <span className="text-sm font-bold">Nueva propiedad</span>
        </Link>

        {navItems.map((item) => (
          <NavLink key={item.href} {...item} onClick={onClose} />
        ))}
      </div>

      {/* User */}
      <div className="flex-shrink-0 border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <UserAvatar name={user.name} image={user.image} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ user }: { user: User }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-slate-200 z-30">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-100 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-ink tracking-tight">Conexory</span>
        </div>

        <div className="ml-auto">
          <UserAvatar name={user.name} image={user.image} size={32} />
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-slate-950/40 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl">
            <SidebarContent user={user} onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
