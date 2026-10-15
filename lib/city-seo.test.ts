import { describe, expect, test } from "bun:test"
import { buildCityDescription, buildCityTitle } from "./city-seo"

describe("buildCityTitle", () => {
  test("defaults to all properties in the city", () => {
    expect(buildCityTitle("Medellín")).toBe("Propiedades en Medellín")
  })

  test("uses the irregular plural and the operation phrase", () => {
    expect(buildCityTitle("Cali", "commercial", "rent")).toBe("Locales comerciales en arriendo en Cali")
  })

  test("ignores unknown types and operations", () => {
    expect(buildCityTitle("Cali", "castle", "lease")).toBe("Propiedades en Cali")
  })
})

describe("buildCityDescription", () => {
  test("lowercases the type inside the sentence", () => {
    expect(buildCityDescription("Bogotá", "apartment", "sale")).toStartWith(
      "Encuentra apartamentos en venta en Bogotá publicadas"
    )
  })

  test("reads naturally without type or operation", () => {
    expect(buildCityDescription("Bogotá")).toStartWith("Encuentra propiedades en Bogotá publicadas")
  })
})
