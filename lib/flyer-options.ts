// Options the agent picks in the flyer modal before generating.
// Shared between the client form and the server renderer.

export const FLYER_TEMPLATE_IDS = ["clasica", "ficha", "fotos"] as const
export type FlyerTemplate = (typeof FLYER_TEMPLATE_IDS)[number]

export const FLYER_TEMPLATE_LABELS: Record<FlyerTemplate, string> = {
  clasica: "Clásica",
  ficha: "Ficha técnica",
  fotos: "Fotos",
}

export const FLYER_INFO_IDS = ["precio", "caracteristicas", "descripcion", "contacto"] as const
export type FlyerInfo = (typeof FLYER_INFO_IDS)[number]

export const FLYER_HIGHLIGHT_MAX_LENGTH = 120

export const FLYER_INFO_LABELS: Record<FlyerInfo, string> = {
  precio: "Precio",
  caracteristicas: "Características",
  descripcion: "Descripción",
  contacto: "Mis datos de contacto",
}

export type FlyerOptions = {
  template: FlyerTemplate
  highlight?: string
  include: FlyerInfo[]
  accentColor?: string
  // Used for titles/icons drawn directly on the light canvas or white
  // panels — kept separate from accentColor so an agent whose brand color
  // is light isn't stuck with an auto-darkened gray for those.
  secondaryColor?: string
}

export const DEFAULT_FLYER_OPTIONS: FlyerOptions = {
  template: "clasica",
  include: [...FLYER_INFO_IDS],
}

// Same value as INK in lib/flyer/shared.tsx — duplicated on purpose: that
// module pulls in fs/sharp (server-only) and can't be imported from client
// components like the flyer modal or settings form.
export const DEFAULT_ACCENT_COLOR = "#0a0a0a"
export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/
