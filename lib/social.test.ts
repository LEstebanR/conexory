import { describe, test, expect } from "bun:test"
import { normalizeSocialHandle, socialProfileUrl } from "./social"

describe("normalizeSocialHandle", () => {
  test("keeps a bare handle", () => {
    expect(normalizeSocialHandle("instagram", "cs.inversiones")).toBe("cs.inversiones")
  })

  test("strips a leading @ and whitespace", () => {
    expect(normalizeSocialHandle("instagram", "  @cs.inversiones ")).toBe("cs.inversiones")
  })

  test("returns null for empty input", () => {
    expect(normalizeSocialHandle("instagram", "")).toBeNull()
    expect(normalizeSocialHandle("instagram", "   ")).toBeNull()
    expect(normalizeSocialHandle("instagram", null)).toBeNull()
    expect(normalizeSocialHandle("instagram", "@")).toBeNull()
  })

  test("extracts the handle from a pasted profile URL with tracking params", () => {
    expect(normalizeSocialHandle("instagram", "https://www.instagram.com/cs.inversiones?rpxt=dm44")).toBe("cs.inversiones")
    expect(normalizeSocialHandle("instagram", "https://instagram.com/cs.inversiones/?igsh=abc123")).toBe("cs.inversiones")
  })

  test("extracts the handle from a URL without protocol", () => {
    expect(normalizeSocialHandle("instagram", "www.instagram.com/cs.inversiones")).toBe("cs.inversiones")
    expect(normalizeSocialHandle("instagram", "instagram.com/cs.inversiones")).toBe("cs.inversiones")
  })

  test("drops a trailing path or query typed after a bare handle", () => {
    expect(normalizeSocialHandle("instagram", "cs.inversiones/")).toBe("cs.inversiones")
    expect(normalizeSocialHandle("instagram", "cs.inversiones?igsh=abc")).toBe("cs.inversiones")
  })

  test("handles TikTok and YouTube @ URLs", () => {
    expect(normalizeSocialHandle("tiktok", "https://www.tiktok.com/@agente.co?lang=es")).toBe("agente.co")
    expect(normalizeSocialHandle("youtube", "https://www.youtube.com/@Conexory")).toBe("Conexory")
    expect(normalizeSocialHandle("youtube", "https://youtube.com/c/Conexory")).toBe("Conexory")
  })

  test("handles LinkedIn /in/ URLs", () => {
    expect(normalizeSocialHandle("linkedin", "https://www.linkedin.com/in/luis-ramirez/")).toBe("luis-ramirez")
  })

  test("handles Facebook pages and numeric profiles", () => {
    expect(normalizeSocialHandle("facebook", "https://m.facebook.com/conexory?ref=bookmarks")).toBe("conexory")
    expect(normalizeSocialHandle("facebook", "https://www.facebook.com/profile.php?id=1000123")).toBe("profile.php?id=1000123")
    expect(normalizeSocialHandle("facebook", "profile.php?id=1000123")).toBe("profile.php?id=1000123")
  })
})

describe("socialProfileUrl", () => {
  test("builds each network's profile URL", () => {
    expect(socialProfileUrl("instagram", "cs.inversiones")).toBe("https://instagram.com/cs.inversiones")
    expect(socialProfileUrl("tiktok", "agente.co")).toBe("https://tiktok.com/@agente.co")
    expect(socialProfileUrl("facebook", "conexory")).toBe("https://facebook.com/conexory")
    expect(socialProfileUrl("linkedin", "luis-ramirez")).toBe("https://linkedin.com/in/luis-ramirez")
    expect(socialProfileUrl("youtube", "Conexory")).toBe("https://youtube.com/@Conexory")
  })

  test("repairs a URL stored before normalization existed", () => {
    expect(socialProfileUrl("instagram", "https://www.instagram.com/cs.inversiones?rpxt=dm44")).toBe("https://instagram.com/cs.inversiones")
  })

  test("returns null when there is no handle", () => {
    expect(socialProfileUrl("instagram", null)).toBeNull()
    expect(socialProfileUrl("instagram", "")).toBeNull()
  })
})
