// Options the agent picks in the flyer modal before generating.
// Shared between the client form and the server prompt builder.

export const FLYER_STYLE_IDS = ["premium", "moderno", "minimalista", "vibrante"] as const
export type FlyerStyle = (typeof FLYER_STYLE_IDS)[number]

export const FLYER_STYLE_LABELS: Record<FlyerStyle, string> = {
  premium: "Premium",
  moderno: "Moderno",
  minimalista: "Minimalista",
  vibrante: "Vibrante",
}

export const FLYER_STYLE_PROMPTS: Record<FlyerStyle, string> = {
  premium:
    "Estilo inmobiliario premium y elegante: tipografía moderna, espacios equilibrados, paleta sobria y sofisticada.",
  moderno:
    "Estilo moderno y audaz: composición dinámica, tipografía grande y contrastes marcados.",
  minimalista:
    "Estilo minimalista: mucho espacio en blanco, tipografía fina, paleta monocroma en blanco, negro y grises.",
  vibrante:
    "Estilo colorido y llamativo: alto contraste, colores vivos y energía visual, sin perder legibilidad.",
}

export const FLYER_INFO_IDS = ["precio", "caracteristicas", "descripcion", "contacto"] as const
export type FlyerInfo = (typeof FLYER_INFO_IDS)[number]

export const FLYER_INFO_LABELS: Record<FlyerInfo, string> = {
  precio: "Precio",
  caracteristicas: "Características",
  descripcion: "Descripción",
  contacto: "Mis datos de contacto",
}

export type FlyerOptions = {
  style: FlyerStyle
  highlight?: string
  include: FlyerInfo[]
}

export const DEFAULT_FLYER_OPTIONS: FlyerOptions = {
  style: "premium",
  include: [...FLYER_INFO_IDS],
}
