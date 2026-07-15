export type PropertyMetrics = {
  whatsapp: number
  social: { instagram: number; facebook: number; tiktok: number; linkedin: number; youtube: number }
  contact: { phone: number; email: number; whatsapp: number }
}

const EMPTY_METRICS: PropertyMetrics = {
  whatsapp: 0,
  social: { instagram: 0, facebook: 0, tiktok: 0, linkedin: 0, youtube: 0 },
  contact: { phone: 0, email: 0, whatsapp: 0 },
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0
}

export function readMetrics(json: unknown): PropertyMetrics {
  if (!json || typeof json !== "object" || Array.isArray(json)) return EMPTY_METRICS

  const root = json as Record<string, unknown>
  const social = (root.social && typeof root.social === "object" ? root.social : {}) as Record<string, unknown>
  const contact = (root.contact && typeof root.contact === "object" ? root.contact : {}) as Record<string, unknown>

  return {
    whatsapp: num(root.whatsapp),
    social: {
      instagram: num(social.instagram),
      facebook: num(social.facebook),
      tiktok: num(social.tiktok),
      linkedin: num(social.linkedin),
      youtube: num(social.youtube),
    },
    contact: {
      phone: num(contact.phone),
      email: num(contact.email),
      whatsapp: num(contact.whatsapp),
    },
  }
}

export function socialTotal(metrics: PropertyMetrics): number {
  const { instagram, facebook, tiktok, linkedin, youtube } = metrics.social
  return instagram + facebook + tiktok + linkedin + youtube
}

export function contactTotal(metrics: PropertyMetrics): number {
  const { phone, email, whatsapp } = metrics.contact
  return phone + email + whatsapp
}
