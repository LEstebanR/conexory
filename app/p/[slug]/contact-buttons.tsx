"use client"

import { Phone, Mail } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { trackPropertyEvent } from "@/lib/track-property-event"
import { toWhatsAppNumber } from "@/lib/phone"

type Props = {
  propertyId: string
  phone: string | null
  phoneIsWhatsapp: boolean
  email: string
  whatsappMessage: string
  english: boolean
}

export function whatsappHref(phone: string, message: string) {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`
}

const secondaryButton =
  "flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-hairline-strong bg-white text-sm font-medium text-ink hover:border-ink transition-colors"

export default function ContactButtons({ propertyId, phone, phoneIsWhatsapp, email, whatsappMessage, english }: Props) {
  const hasWhatsapp = !!phone && phoneIsWhatsapp

  return (
    <div className="space-y-2">
      {hasWhatsapp && (
        <a
          href={whatsappHref(phone, whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackPropertyEvent(propertyId, "contact_whatsapp_click")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-canvas-soft text-sm font-medium text-ink hover:bg-surface-pressed transition-colors"
        >
          <WhatsAppIcon className="h-5 w-5 shrink-0" />
          {english ? "Message on WhatsApp" : "Escribir por WhatsApp"}
        </a>
      )}
      <div className="flex gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            onClick={() => trackPropertyEvent(propertyId, "contact_phone_click")}
            className={secondaryButton}
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            {english ? "Call" : "Llamar"}
          </a>
        )}
        <a
          href={`mailto:${email}`}
          onClick={() => trackPropertyEvent(propertyId, "contact_email_click")}
          className={secondaryButton}
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          {english ? "Email" : "Correo"}
        </a>
      </div>
    </div>
  )
}
