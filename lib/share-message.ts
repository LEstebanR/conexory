import { GoogleGenAI } from "@google/genai"
import type { Property } from "@prisma/client"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"

const GEMINI_TIMEOUT_MS = 8000

export const SHARE_MESSAGE_KINDS = ["intro", "followup", "price_drop"] as const
export type ShareMessageKind = (typeof SHARE_MESSAGE_KINDS)[number]

const KIND_INSTRUCTIONS: Record<ShareMessageKind, string> = {
  intro:
    "Es el PRIMER contacto: preséntale la propiedad a un cliente potencial y motívalo a pedir más información o agendar una visita.",
  followup:
    "Es un mensaje de SEGUIMIENTO: ya le habías compartido esta propiedad antes; pregúntale amablemente si la pudo revisar y ofrécele resolver dudas o coordinar una visita.",
  price_drop:
    "Es un anuncio de REBAJA DE PRECIO: cuéntale que la propiedad que le habías compartido bajó de precio (el precio listado abajo es el nuevo) e invítalo a aprovechar, con urgencia sutil y sin exagerar.",
}

const MESSAGE_RULES = `Reglas estrictas:
- Usa ÚNICAMENTE los datos reales de la propiedad listados abajo; no inventes características, cifras ni beneficios.
- No inventes nada sobre el cliente: ni su nombre, ni lo que dijo, ni lo que le interesa. Nada de placeholders tipo [Nombre]; el mensaje debe quedar listo para enviar tal cual.
- Formato de WhatsApp: *asteriscos* para negrita y líneas cortas. Nada de Markdown de otro tipo.
- No incluyas ningún enlace ni texto tipo "aquí va el link": el enlace de la propiedad se añade automáticamente después del mensaje.
- Cierra con una línea corta que dé pie al enlace que irá justo debajo (por ejemplo: "Mira todas las fotos aquí:").
- Máximo 2 emojis, sin mayúsculas sostenidas.
- Máximo 12 líneas.
- Responde SOLO con el mensaje, sin explicaciones ni comillas alrededor.`

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

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return null

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
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

export async function generateShareMessage(
  property: Property,
  kind: ShareMessageKind
): Promise<string | null> {
  return callGemini(`Eres un agente inmobiliario colombiano experto en ventas por WhatsApp.
Escribe un mensaje de WhatsApp para enviárselo a un cliente potencial sobre la propiedad de abajo. Hazlo vendedor, cercano y claro, sin sonar robótico ni exagerado.

${KIND_INSTRUCTIONS[kind]}

${MESSAGE_RULES}

Datos reales de la propiedad:
${propertyFacts(property)}`)
}
