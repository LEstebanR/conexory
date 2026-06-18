"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { registerShare } from "@/app/p/[slug]/actions"

export default function PublicShareButton({
  slug,
  title,
  className,
}: {
  slug: string
  title: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    registerShare(slug).catch(() => {})

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-4 rounded-full bg-canvas-soft text-ink text-sm font-bold hover:bg-surface-pressed active:scale-[0.98] transition-all",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Copiado
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" strokeWidth={2.25} />
          Compartir
        </>
      )}
    </button>
  )
}
