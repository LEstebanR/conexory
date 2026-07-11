"use client"

import type { ReactNode } from "react"
import { trackPropertyEvent } from "@/lib/track-property-event"

type Props = {
  propertyId: string
  href: string
  label: string
  eventType: string
  children: ReactNode
}

export default function SocialLinkButton({ propertyId, href, label, eventType, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={() => trackPropertyEvent(propertyId, eventType)}
      className="w-8 h-8 rounded-full bg-white border border-hairline-strong flex items-center justify-center text-body hover:text-ink hover:border-ink transition-colors"
    >
      {children}
    </a>
  )
}
