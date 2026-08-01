// Single source of truth for property type and transaction (operation) options.
// IDs are stored in the DB and validated server-side; labels are user-facing (es-CO).
// Never hardcode these maps elsewhere — import from here.

export const PROPERTY_TYPE_IDS = [
  "apartment",
  "house",
  "office",
  "commercial",
  "lot",
  "warehouse",
  "house_lot",
  "farm",
  "aparta_suite",
] as const

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  lot: "Lote",
  warehouse: "Bodega",
  house_lot: "Casa lote",
  farm: "Finca",
  aparta_suite: "Aparta suite",
}

export const PROPERTY_TYPES = PROPERTY_TYPE_IDS.map((id) => ({
  id,
  label: PROPERTY_TYPE_LABELS[id],
}))

// Plurals aren't mechanical in Spanish ("Local comercial" -> "Locales
// comerciales"), so this is a separate explicit map rather than a suffix
// rule. Used for programmatic SEO titles like "Apartamentos en Bogotá".
export const PROPERTY_TYPE_LABELS_PLURAL: Record<string, string> = {
  apartment: "Apartamentos",
  house: "Casas",
  office: "Oficinas",
  commercial: "Locales comerciales",
  lot: "Lotes",
  warehouse: "Bodegas",
  house_lot: "Casas lote",
  farm: "Fincas",
  aparta_suite: "Aparta suites",
}

export const TRANSACTION_TYPE_IDS = ["sale", "rent", "rent_furnished", "exchange"] as const

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  sale: "Venta",
  rent: "Arriendo",
  rent_furnished: "Arriendo amoblado",
  exchange: "Permuta",
}

export const TRANSACTION_TYPES = TRANSACTION_TYPE_IDS.map((id) => ({
  id,
  label: TRANSACTION_TYPE_LABELS[id],
}))

// Prepositional phrase form, for titles like "Apartamentos en arriendo en Medellín".
export const TRANSACTION_TYPE_PHRASES: Record<string, string> = {
  sale: "en venta",
  rent: "en arriendo",
  rent_furnished: "en arriendo amoblado",
  exchange: "en permuta",
}

export const DEFAULT_TRANSACTION_TYPE = "sale"
