import { GoogleGenAI } from "@google/genai"
import type { Property } from "@prisma/client"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"

const GEMINI_TIMEOUT_MS = 8000

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function propertyFacts(property: Property): string {
  const typeLabel = PROPERTY_TYPE_LABELS[property.type] ?? property.type
  const transactionLabel = property.transactionType
    ? TRANSACTION_TYPE_LABELS[property.transactionType] ?? null
    : null
  const location = [property.neighborhood, property.city, property.state]
    .filter(Boolean)
    .join(", ")

  return [
    `- Tipo: ${typeLabel}${transactionLabel ? ` en ${transactionLabel.toLowerCase()}` : ""}`,
    `- Título: ${property.title}`,
    `- Ubicación: ${location}`,
    `- Precio: ${formatCOP(Number(property.price))}`,
    property.bedrooms != null ? `- Habitaciones: ${property.bedrooms}` : null,
    property.bathrooms != null ? `- Baños: ${property.bathrooms}` : null,
    property.parking != null ? `- Parqueaderos: ${property.parking}` : null,
    property.area != null ? `- Área: ${property.area} m²` : null,
    property.landArea != null ? `- Área de terreno: ${property.landArea} m²` : null,
    property.gatedCommunity ? "- En unidad cerrada" : null,
    property.description ? `- Descripción del agente: ${property.description}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

export async function improveMessageWithAI(
  property: Property,
  message: string
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return null

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Eres un agente inmobiliario colombiano experto en ventas por WhatsApp.
Mejora el siguiente mensaje que un agente le enviará a un cliente potencial: hazlo más vendedor, cercano y claro, sin sonar robótico ni exagerado.

Reglas estrictas:
- Usa ÚNICAMENTE los datos reales de la propiedad listados abajo; no inventes características, cifras ni beneficios.
- Conserva el formato de WhatsApp: *asteriscos* para negrita y líneas cortas. Nada de Markdown de otro tipo.
- No incluyas ningún enlace ni texto tipo "aquí va el link": el enlace de la propiedad se añade automáticamente después.
- Máximo 2 emojis, sin mayúsculas sostenidas.
- Máximo 12 líneas.
- Responde SOLO con el mensaje mejorado, sin explicaciones ni comillas alrededor.

Datos reales de la propiedad:
${propertyFacts(property)}

Mensaje actual:
${message}`,
      config: {
        abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        thinkingConfig: { thinkingBudget: 0 },
      },
    })

    return response.text?.trim() || null
  } catch {
    return null
  }
}
