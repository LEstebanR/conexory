"use client"

import { usePathname, useRouter } from "next/navigation"
import { X } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { SHARE_INFO_IDS } from "@/lib/share-message-options"
import { buildBody, stripEmojis, type TemplateCtx } from "./share-panel"
import { incrementShares } from "./actions"

export default function ShareReadyBanner({
  propertyId,
  url,
  property,
}: {
  propertyId: string
  url: string
  property: Omit<TemplateCtx, "include">
}) {
  const router = useRouter()
  const pathname = usePathname()

  const body = buildBody("intro", { ...property, include: [...SHARE_INFO_IDS] })
  const waUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`

  function dismiss() {
    router.replace(pathname, { scroll: false })
  }

  function handleShare(e: React.MouseEvent<HTMLAnchorElement>) {
    // Mirrors SharePanel: desktop WhatsApp renders emoji poorly. Decided at click
    // time (not render) so the server-rendered href stays hydration-safe.
    if (window.matchMedia("(pointer: fine)").matches) e.currentTarget.href = waUrl(stripEmojis(body))
    incrementShares(propertyId).catch(() => {})
    dismiss()
  }

  return (
    <div className="relative bg-canvas-soft rounded-2xl p-6 mb-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="absolute top-3 right-3 p-1.5 rounded-full text-mute hover:bg-surface-pressed hover:text-ink transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-lg font-black text-ink tracking-tight pr-8">
        ¡Tu ficha está lista! Compártela por WhatsApp
      </p>
      <p className="text-sm text-body mt-1 mb-5">
        Se abre WhatsApp con un mensaje listo, con los datos de la propiedad y tu link. Puedes editarlo antes de enviarlo.
      </p>
      <a
        href={waUrl(body)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleShare}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-ink px-6 h-12 text-sm font-bold text-white hover:bg-elevated transition-colors"
      >
        <WhatsAppIcon className="w-5 h-5" />
        Compartir por WhatsApp
      </a>
    </div>
  )
}
