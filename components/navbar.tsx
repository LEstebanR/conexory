"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Building2 } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-slate-950 tracking-tight">
              Conexory
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {[
              { label: "Funciones", href: "#features" },
              { label: "Cómo funciona", href: "#how-it-works" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-600 font-semibold" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button size="sm" className="font-bold shadow-sm shadow-brand-400/20" asChild>
              <Link href="/register">Empezar gratis →</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {[
              { label: "Funciones", href: "#features" },
              { label: "Cómo funciona", href: "#how-it-works" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Button variant="ghost" size="sm" className="w-full font-semibold text-slate-600" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  Iniciar sesión
                </Link>
              </Button>
              <Button size="sm" className="w-full font-bold" asChild>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  Empezar gratis →
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
