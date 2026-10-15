import { describe, expect, test } from "bun:test"
import { slugifyCity } from "./slug"

describe("slugifyCity", () => {
  test("strips accents and lowercases", () => {
    expect(slugifyCity("Medellín")).toBe("medellin")
  })

  test("drops abbreviation dots instead of turning them into dashes", () => {
    expect(slugifyCity("Bogotá D.C.")).toBe("bogota-dc")
  })

  test("collapses separators and trims stray dashes", () => {
    expect(slugifyCity("  Santa Marta / Rodadero  ")).toBe("santa-marta-rodadero")
  })

  test("returns an empty slug for names with no letters or digits", () => {
    expect(slugifyCity("...")).toBe("")
  })
})
