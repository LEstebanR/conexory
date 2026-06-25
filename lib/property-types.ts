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

export const DEFAULT_TRANSACTION_TYPE = "sale"
