import { describe, expect, test } from "bun:test"
import { pageMetadata } from "./page-metadata"

describe("pageMetadata", () => {
  test("indexes the page with a canonical and brands the social title", () => {
    const meta = pageMetadata({ title: "Precios", description: "Planes", path: "/precios" })
    expect(meta.title).toBe("Precios")
    expect(meta.robots).toEqual({ index: true, follow: true })
    expect(meta.alternates).toEqual({ canonical: "/precios" })
    expect(meta.openGraph).toMatchObject({
      title: { absolute: "Precios — Conexory" },
      url: "/precios",
      locale: "es_CO",
      type: "website",
    })
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: { absolute: "Precios — Conexory" },
    })
  })

  test("uses an absolute title verbatim everywhere", () => {
    const meta = pageMetadata({ title: "Conexory", description: "d", path: "/", absoluteTitle: true })
    expect(meta.title).toEqual({ absolute: "Conexory" })
    expect(meta.openGraph?.title).toEqual({ absolute: "Conexory" })
  })

  test("noindex pages get no canonical so they don't compete with the real one", () => {
    const meta = pageMetadata({ title: "Login", description: "d", path: "/login", noindex: true })
    expect(meta.robots).toEqual({ index: false, follow: true })
    expect(meta.alternates).toBeUndefined()
  })

  test("marks blog posts as articles", () => {
    const meta = pageMetadata({ title: "Post", description: "d", path: "/blog/x", type: "article" })
    expect(meta.openGraph).toMatchObject({ type: "article" })
  })
})
