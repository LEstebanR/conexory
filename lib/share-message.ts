import { GoogleGenAI } from "@google/genai"
import type { Property } from "@prisma/client"
import { formatCOP } from "@/lib/format"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"
import { SHARE_INFO_IDS, type ShareInfo, type ShareMessageKind } from "@/lib/share-message-options"

const GEMINI_TIMEOUT_MS = 8000

const KIND_INSTRUCTIONS: Record<ShareMessageKind, string> = {
  intro:
    "Es el PRIMER contacto: preséntale la propiedad a un cliente potencial y motívalo a pedir más información o agendar una visita.",
  followup:
    "Es un mensaje de SEGUIMIENTO: ya le habías compartido esta propiedad antes; pregúntale amablemente si la pudo revisar y ofrécele resolver dudas o coordinar una visita.",
  price_drop:
    "Es un anuncio de REBAJA DE PRECIO: cuéntale que la propiedad que le habías compartido bajó de precio (el precio listado abajo es el nuevo) e invítalo a aprovechar, con urgencia sutil y sin exagerar.",
  visit:
    "Es una invitación a AGENDAR UNA VISITA: propón conocer la propiedad en persona, ofrece flexibilidad de horarios y pídele qué día le queda bien.",
  opportunity:
    "Es un mensaje de OPORTUNIDAD: resalta por qué esta propiedad es una buena oportunidad según sus datos reales (precio, ubicación, características) y genera urgencia sutil sin inventar demanda ni escasez.",
  investor:
    "Es un mensaje para un INVERSIONISTA: presenta la propiedad como opción de inversión destacando sus datos reales; no inventes cifras de rentabilidad, valorización ni proyecciones.",
}

const MESSAGE_RULES = `Reglas estrictas:
- Usa ÚNICAMENTE los datos reales de la propiedad listados abajo; no inventes características, cifras ni beneficios.
- No inventes nada sobre el cliente: ni su nombre, ni lo que dijo, ni lo que le interesa. Nada de placeholders tipo [Nombre] o [Tu Inmobiliaria]; el mensaje debe quedar listo para enviar tal cual.
- Si necesitas firmar el mensaje, usa el nombre del agente que se indica más abajo; si no aplica no lo incluyas.
- Formato de WhatsApp: *asteriscos* para negrita y líneas cortas. Para listas usa guiones (-), nunca asteriscos como viñeta. Nada de Markdown de otro tipo.
- No incluyas ningún enlace ni texto tipo "aquí va el link": el enlace de la propiedad se añade automáticamente después del mensaje.
- Cierra con una línea corta que dé pie al enlace que irá justo debajo (por ejemplo: "Mira todas las fotos aquí:").
- Máximo 2 emojis, sin mayúsculas sostenidas.
- Máximo 12 líneas.
- Responde SOLO con el mensaje, sin explicaciones ni comillas alrededor.`

function propertyFacts(property: Property, include: readonly ShareInfo[]): string {
  const has = (info: ShareInfo) => include.includes(info)
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
    has("ubicacion") ? `- Ubicación: ${location}` : null,
    has("precio") ? `- Precio: ${formatCOP(Number(property.price))}` : null,
    has("habitaciones") && property.bedrooms != null ? `- Habitaciones: ${property.bedrooms}` : null,
    has("banos") && property.bathrooms != null ? `- Baños: ${property.bathrooms}` : null,
    has("parqueaderos") && property.parking != null ? `- Parqueaderos: ${property.parking}` : null,
    has("area") && property.area != null ? `- Área: ${property.area} m²` : null,
    has("terreno") && property.landArea != null ? `- Área de terreno: ${property.landArea} m²` : null,
    has("cerrada") && property.gatedCommunity ? "- En unidad cerrada" : null,
    has("descripcion") && property.description
      ? `- Descripción del agente: ${property.description}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")
}

export async function generateShareMessage(
  property: Property,
  kind: ShareMessageKind,
  include: readonly ShareInfo[] = SHARE_INFO_IDS,
  agentName?: string | null
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return null

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      // flash-lite: the plain 2.5-flash free tier is capped at ~20 req/day,
      // too low for this feature; lite has a much higher daily quota.
      model: "gemini-2.5-flash-lite",
      contents: `Eres un agente inmobiliario colombiano experto en ventas por WhatsApp.
Escribe un mensaje de WhatsApp para enviárselo a un cliente potencial sobre la propiedad de abajo. Hazlo vendedor, cercano y claro, sin sonar robótico ni exagerado.

${KIND_INSTRUCTIONS[kind]}

${MESSAGE_RULES}

Nombre del agente: ${agentName ?? "no disponible"}

Datos reales de la propiedad (menciona solo lo que está aquí):
${propertyFacts(property, include)}`,
      config: {
        abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        thinkingConfig: { thinkingBudget: 0 },
      },
    })
    const text = response.text?.trim()
    if (!text) return null
    // Replace any leftover bracket placeholders the model may have emitted.
    return text.replace(/\[[^\]]{1,40}\]/g, agentName ?? "").replace(/\s{2,}/g, " ").trim()
  } catch (error) {
    console.error("[share-message] Gemini generation failed:", error)
    return null
  }
}
