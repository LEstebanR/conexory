"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Funciones", href: "/#features" },
  { label: "Cómo funciona", href: "/#how-it-works" },
  { label: "Precios", href: "/#pricing" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
              <Image
                src="/mark-white.png"
                alt="Conexory"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <span className="text-lg font-bold text-ink tracking-tight">
              Conexory
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Empezar gratis</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-ink hover:bg-canvas-soft transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-hairline space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas-soft rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Button variant="secondary" size="sm" className="w-full" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  Iniciar sesión
                </Link>
              </Button>
              <Button size="sm" className="w-full" asChild>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  Empezar gratis
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
