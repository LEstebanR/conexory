"use client"

import { Phone, Mail, MessageCircle } from "lucide-react"
import { trackPropertyEvent } from "@/lib/track-property-event"

type Props = {
  propertyId: string
  phone: string | null
  phoneIsWhatsapp: boolean
  email: string
  whatsappMessage: string
}

export default function ContactButtons({ propertyId, phone, phoneIsWhatsapp, email, whatsappMessage }: Props) {
  return (
    <div className="flex gap-2">
      {phone && phoneIsWhatsapp && (
        <div className="relative group flex-1">
          <a
            href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackPropertyEvent(propertyId, "contact_whatsapp_click")}
            className="flex w-full h-11 items-center justify-center rounded-full border border-hairline-strong bg-white text-body hover:text-ink hover:border-ink transition-colors"
          >
            <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
          </a>
          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-ink text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
            {phone}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-ink" />
          </div>
        </div>
      )}
      {phone && (
        <div className="relative group flex-1">
          <a
            href={`tel:${phone}`}
            onClick={() => trackPropertyEvent(propertyId, "contact_phone_click")}
            className="flex w-full h-11 items-center justify-center rounded-full border border-hairline-strong bg-white text-body hover:text-ink hover:border-ink transition-colors"
          >
            <Phone className="w-[18px] h-[18px]" strokeWidth={2} />
          </a>
          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-ink text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
            {phone}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-ink" />
          </div>
        </div>
      )}
      <div className="relative group flex-1">
        <a
          href={`mailto:${email}`}
          onClick={() => trackPropertyEvent(propertyId, "contact_email_click")}
          className="flex w-full h-11 items-center justify-center rounded-full border border-hairline-strong bg-white text-body hover:text-ink hover:border-ink transition-colors"
        >
          <Mail className="w-[18px] h-[18px]" strokeWidth={2} />
        </a>
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-ink text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
          {email}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-ink" />
        </div>
      </div>
    </div>
  )
}
