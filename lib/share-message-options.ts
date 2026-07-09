// Message kinds and info toggles for the WhatsApp share message.
// Shared between the client panel and the server prompt builder.

export const SHARE_MESSAGE_KINDS = [
  "intro",
  "followup",
  "price_drop",
  "visit",
  "opportunity",
  "investor",
] as const
export type ShareMessageKind = (typeof SHARE_MESSAGE_KINDS)[number]

export const SHARE_MESSAGE_KIND_LABELS: Record<ShareMessageKind, string> = {
  intro: "Presentación",
  followup: "Seguimiento",
  price_drop: "Precio reducido",
  visit: "Agendar visita",
  opportunity: "Oportunidad",
  investor: "Inversión",
}

export const SHARE_INFO_IDS = ["precio", "caracteristicas", "ubicacion", "descripcion"] as const
export type ShareInfo = (typeof SHARE_INFO_IDS)[number]

export const SHARE_INFO_LABELS: Record<ShareInfo, string> = {
  precio: "Precio",
  caracteristicas: "Características",
  ubicacion: "Ubicación",
  descripcion: "Descripción",
}
