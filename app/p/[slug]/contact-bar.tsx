"use client"

import Image from "next/image"
import { Phone, Mail } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { trackPropertyEvent } from "@/lib/track-property-event"
import { whatsappHref } from "./contact-buttons"

type Props = {
  propertyId: string
  name: string
  image: string | null
  initials: string
  phone: string | null
  phoneIsWhatsapp: boolean
  email: string
  whatsappMessage: string
  english: boolean
}

// Mobile-only bar pinned to the thumb zone: the agent's face and name stay
// visible while the client scrolls, with one labeled way to reach them.
export default function ContactBar({
  propertyId, name, image, initials, phone, phoneIsWhatsapp, email, whatsappMessage, english,
}: Props) {
  const action =
    phone && phoneIsWhatsapp
      ? {
          href: whatsappHref(phone, whatsappMessage),
          event: "whatsapp_click",
          label: "WhatsApp",
          icon: <WhatsAppIcon className="h-5 w-5 shrink-0" />,
          external: true,
        }
      : phone
        ? {
            href: `tel:${phone}`,
            event: "contact_phone_click",
            label: english ? "Call" : "Llamar",
            icon: <Phone className="h-4 w-4" strokeWidth={2} />,
            external: false,
          }
        : {
            href: `mailto:${email}`,
            event: "contact_email_click",
            label: english ? "Email" : "Correo",
            icon: <Mail className="h-4 w-4" strokeWidth={2} />,
            external: false,
          }

  return (
    <div className="xl:hidden fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <a href="#agente" className="flex min-w-0 flex-1 items-center gap-3">
          {image ? (
            <Image src={image} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
              {initials}
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-xs text-body">{english ? "Listed by" : "Te atiende"}</span>
            <span className="block truncate text-sm font-medium text-ink">{name}</span>
          </span>
        </a>
        <a
          href={action.href}
          {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          onClick={() => trackPropertyEvent(propertyId, action.event)}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-elevated transition-colors"
        >
          {action.icon}
          {action.label}
        </a>
      </div>
    </div>
  )
}
