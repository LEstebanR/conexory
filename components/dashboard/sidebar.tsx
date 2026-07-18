"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutGrid,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  Shield,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"
import { hasProAccess } from "@/lib/plans"
import { SUPPORT_EMAIL } from "@/lib/urls"
import FeedbackModal from "./feedback-modal"

interface User {
  name: string
  email: string
  image: string | null
  isPremium: boolean
  role: string
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

const adminNavItem = {
  icon: Shield,
  label: "Admin",
  href: "/admin",
}


function NavLink({
  href,
  icon: Icon,
  label,
  exact = false,
  soon = false,
  onClick,
  id,
}: {
  href: string
  icon: React.ElementType
  label: string
  exact?: boolean
  soon?: boolean
  onClick?: () => void
  id?: string
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  if (soon) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-mute cursor-default select-none">
        <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
        <span className="text-sm font-medium flex-1">{label}</span>
        <span className="text-[9px] font-bold text-mute uppercase tracking-wider">Pronto</span>
      </div>
    )
  }

  return (
    <Link
      id={id}
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
        isActive
          ? "bg-canvas-soft text-ink"
          : "text-body hover:bg-canvas-softer hover:text-ink"
      )}
    >
      <Icon
        className={cn("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-ink" : "")}
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className={cn("text-sm flex-1", isActive ? "font-bold" : "font-medium")}>
        {label}
      </span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 text-ink flex-shrink-0" />}
    </Link>
  )
}

function SidebarContent({
  user,
  onClose,
  variant = "desktop",
}: {
  user: User
  onClose?: () => void
  variant?: "desktop" | "mobile"
}) {
  const router = useRouter()
  const tourSuffix = variant === "mobile" ? "-mobile" : ""
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
        onError: () => setSigningOut(false),
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-hairline flex-shrink-0">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <Image src="/mark-white.png" alt="Conexory" width={20} height={20} className="w-5 h-5" />
          </div>
          <span className="text-base font-bold text-ink tracking-tight">Conexory</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-mute hover:bg-canvas-soft lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User */}
      <div className="flex-shrink-0 border-b border-hairline px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserAvatar name={user.name} image={user.image} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-ink truncate">{user.name}</p>
              {hasProAccess(user) && (
                <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-wider bg-ink text-white px-1.5 py-0.5 rounded-full leading-none">
                  Pro
                </span>
              )}
            </div>
            <p className="text-xs text-mute truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            id={`tour-properties${tourSuffix}`}
            onClick={onClose}
          />
        ))}
        <FeedbackModal userName={user.name} />
      </div>

      {/* Admin + Configuración — encima del separador */}
      <div className="flex-shrink-0 px-3 pb-2 space-y-1">
        {user.role === "admin" && (
          <NavLink key={adminNavItem.href} {...adminNavItem} onClick={onClose} />
        )}
        <NavLink
          href="/dashboard/settings"
          icon={Settings}
          label="Configuración"
          onClick={onClose}
          id={`tour-settings${tourSuffix}`}
        />
      </div>

      {/* Cerrar sesión */}
      <div className="flex-shrink-0 border-t border-hairline p-3">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-body hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" strokeWidth={1.75} />
          ) : (
            <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          )}
          {signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="block text-center text-[11px] text-mute hover:text-ink transition-colors mt-2 pt-2 border-t border-hairline"
        >
          ¿Necesitas ayuda? {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  )
}

export default function Sidebar({ user }: { user: User }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      setMobileOpen((e as CustomEvent<boolean>).detail)
    }
    window.addEventListener("conexory:toggle-sidebar", handler)
    return () => window.removeEventListener("conexory:toggle-sidebar", handler)
  }, [])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-hairline-strong z-30">
        <SidebarContent user={user} variant="desktop" />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-hairline h-14 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
            <Image src="/mark-white.png" alt="Conexory" width={18} height={18} className="w-4.5 h-4.5" />
          </div>
          <span className="text-base font-bold text-ink tracking-tight">Conexory</span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="ml-auto p-2 rounded-xl text-body hover:bg-canvas-soft transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-ink/40 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-full sm:w-80 bg-white z-50 shadow-2xl">
            <SidebarContent user={user} onClose={() => setMobileOpen(false)} variant="mobile" />
          </div>
        </>
      )}
    </>
  )
}
