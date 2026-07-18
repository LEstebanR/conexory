import { describe, test, expect, mock, beforeEach } from "bun:test"
import type { Property } from "@prisma/client"
import { SHARE_INFO_IDS } from "./share-message-options"

const mockGenerateContent = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ text?: string }>({ text: "Hola, te comparto esta propiedad." })
})
class FakeGoogleGenAI {
  models = { generateContent: mockGenerateContent }
}
mock.module("@google/genai", () => ({ GoogleGenAI: FakeGoogleGenAI }))

const { generateShareMessage } = await import("./share-message")

const property = {
  type: "apartment",
  transactionType: "sale",
  title: "Apartamento moderno en El Poblado",
  neighborhood: "El Poblado",
  city: "Medellín",
  state: "Antioquia",
  price: "450000000",
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  area: 85,
  landArea: null,
  gatedCommunity: true,
  description: "Vista panorámica, remodelado.",
} as unknown as Property

function lastPrompt(): string {
  const call = mockGenerateContent.mock.calls.at(-1)
  return (call?.[0] as { contents: string }).contents
}

beforeEach(() => {
  process.env.GOOGLE_AI_API_KEY = "test-gemini-key"
  mockGenerateContent.mockClear()
  mockGenerateContent.mockImplementation(() =>
    Promise.resolve({ text: "Hola, te comparto esta propiedad." })
  )
})

describe("generateShareMessage", () => {
  test("returns null immediately when no API key is configured", async () => {
    delete process.env.GOOGLE_AI_API_KEY
    const result = await generateShareMessage(property, "intro", SHARE_INFO_IDS, "Luis")
    expect(result).toBeNull()
    expect(mockGenerateContent).not.toHaveBeenCalled()
  })

  test("includes every requested fact that the property has", async () => {
    await generateShareMessage(property, "intro", SHARE_INFO_IDS, "Luis")
    const prompt = lastPrompt()
    expect(prompt).toContain("Ubicación: El Poblado, Medellín, Antioquia")
    expect(prompt).toContain("Precio:")
    expect(prompt).toContain("Habitaciones: 3")
    expect(prompt).toContain("Baños: 2")
    expect(prompt).toContain("Parqueaderos: 1")
    expect(prompt).toContain("Área: 85 m²")
    expect(prompt).toContain("En unidad cerrada")
    expect(prompt).toContain("Descripción del agente: Vista panorámica, remodelado.")
    expect(prompt).not.toContain("terreno")
  })

  test("omits facts the caller didn't ask to include", async () => {
    await generateShareMessage(property, "intro", ["precio"], "Luis")
    const prompt = lastPrompt()
    expect(prompt).toContain("Precio:")
    expect(prompt).not.toContain("Habitaciones")
    expect(prompt).not.toContain("Baños")
  })

  test("omits facts the property doesn't have even if requested", async () => {
    const noBedrooms = { ...property, bedrooms: null, landArea: null } as unknown as Property
    await generateShareMessage(noBedrooms, "intro", SHARE_INFO_IDS, "Luis")
    const prompt = lastPrompt()
    expect(prompt).not.toContain("Habitaciones")
    expect(prompt).not.toContain("Área de terreno")
  })

  test("passes the price_drop framing and 'Nuevo precio' label for that kind", async () => {
    await generateShareMessage(property, "price_drop", SHARE_INFO_IDS, "Luis")
    const prompt = lastPrompt()
    expect(prompt).toContain("REBAJA DE PRECIO")
  })

  test("includes the agent's name, or 'no disponible' when absent", async () => {
    await generateShareMessage(property, "intro", SHARE_INFO_IDS, "Luis Ramirez")
    expect(lastPrompt()).toContain("Nombre del agente: Luis Ramirez")

    await generateShareMessage(property, "intro", SHARE_INFO_IDS, null)
    expect(lastPrompt()).toContain("Nombre del agente: no disponible")
  })

  test("strips leftover bracket placeholders from the model's response", async () => {
    mockGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "Hola [Nombre], te comparto esta propiedad" })
    )
    const result = await generateShareMessage(property, "intro", SHARE_INFO_IDS, "Luis")
    expect(result).not.toContain("[Nombre]")
  })

  test("returns null when the model responds with empty text", async () => {
    mockGenerateContent.mockImplementation(() => Promise.resolve({ text: "" }))
    const result = await generateShareMessage(property, "intro", SHARE_INFO_IDS, "Luis")
    expect(result).toBeNull()
  })

  test("returns null instead of throwing when the API call fails", async () => {
    mockGenerateContent.mockImplementation(() => Promise.reject(new Error("429 quota exceeded")))
    const result = await generateShareMessage(property, "intro", SHARE_INFO_IDS, "Luis")
    expect(result).toBeNull()
  })

  test("retries once after a transient failure and returns the second attempt's result", async () => {
    let calls = 0
    mockGenerateContent.mockImplementation(() => {
      calls++
      if (calls === 1) return Promise.reject(new Error("transient"))
      return Promise.resolve({ text: "Mensaje generado en el segundo intento" })
    })
    const result = await generateShareMessage(property, "intro", SHARE_INFO_IDS, "Luis")
    expect(result).toBe("Mensaje generado en el segundo intento")
    expect(calls).toBe(2)
  })
})
