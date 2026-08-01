import { PROPERTY_TYPE_LABELS_PLURAL, TRANSACTION_TYPE_PHRASES } from "@/lib/property-types"

export function buildCityTitle(cityLabel: string, type?: string, transactionType?: string): string {
  const noun = (type && PROPERTY_TYPE_LABELS_PLURAL[type]) || "Propiedades"
  const phrase = (transactionType && TRANSACTION_TYPE_PHRASES[transactionType]) || ""
  return [noun, phrase, `en ${cityLabel}`].filter(Boolean).join(" ")
}

export function buildCityDescription(cityLabel: string, type?: string, transactionType?: string): string {
  const noun = (type && PROPERTY_TYPE_LABELS_PLURAL[type].toLowerCase()) || "propiedades"
  const phrase = (transactionType && TRANSACTION_TYPE_PHRASES[transactionType]) || ""
  return `Encuentra ${noun}${phrase ? ` ${phrase}` : ""} en ${cityLabel} publicadas directamente por agentes inmobiliarios en Conexory. Contacta al agente por WhatsApp en segundos.`
}
