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
}

export const DEFAULT_FLYER_OPTIONS: FlyerOptions = {
  template: "clasica",
  include: [...FLYER_INFO_IDS],
}
