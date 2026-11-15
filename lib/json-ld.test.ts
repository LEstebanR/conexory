import { describe, expect, test } from "bun:test"
import { serializeJsonLd } from "./json-ld"

describe("serializeJsonLd", () => {
  test("escapes < so user text cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "Casa</script><script>alert(1)</script>" })
    expect(out).not.toContain("<")
    expect(out).toContain("\\u003c/script>")
  })

  test("round-trips to the original data", () => {
    const data = { name: "Apto <3 hab>", price: 100, nested: { a: ["<b>"] } }
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })
})
