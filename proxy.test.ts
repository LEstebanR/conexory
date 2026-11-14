import { afterEach, describe, expect, spyOn, test, type Mock } from "bun:test"
import { NextRequest } from "next/server"
import * as publicPages from "@/lib/public-pages"
import { proxy } from "./proxy"

let getPublicProperty: Mock<typeof publicPages.getPublicProperty>

function landing(query: string, cookies: Record<string, string> = {}) {
  const cookie = Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join("; ")
  return new NextRequest(`http://localhost:3000/${query}`, { headers: cookie ? { cookie } : {} })
}

describe("proxy on the landing", () => {
  test("remembers a footer source for a visitor without session", async () => {
    const response = await proxy(landing("?utm_source=property_page&utm_medium=footer"))

    expect(response.headers.get("location")).toBeNull()
    const cookie = response.cookies.get("signup_source")
    expect(cookie?.value).toBe("property_page")
    expect(cookie?.httpOnly).toBe(true)
  })

  test("ignores unknown sources and plain visits", async () => {
    expect((await proxy(landing("?utm_source=spam"))).cookies.get("signup_source")).toBeUndefined()
    expect((await proxy(landing(""))).cookies.get("signup_source")).toBeUndefined()
  })

  test("keeps the first valid source", async () => {
    const response = await proxy(landing("?utm_source=agent_profile", { signup_source: "property_page" }))
    expect(response.cookies.get("signup_source")).toBeUndefined()
  })

  test("replaces a tampered remembered value", async () => {
    const response = await proxy(landing("?utm_source=agent_profile", { signup_source: "admin" }))
    expect(response.cookies.get("signup_source")?.value).toBe("agent_profile")
  })

  test("still remembers the source when a session cookie sends the visitor to the dashboard", async () => {
    const response = await proxy(
      landing("?utm_source=property_page", { "better-auth.session_token": "stale" })
    )

    expect(new URL(response.headers.get("location") ?? "").pathname).toBe("/dashboard")
    expect(response.cookies.get("landing_bounce")?.value).toBe("1")
    expect(response.cookies.get("signup_source")?.value).toBe("property_page")
  })
})

describe("proxy on a public listing", () => {
  const listing = () => new NextRequest("http://localhost:3000/p/abc123")

  afterEach(() => getPublicProperty.mockRestore())

  test("lets a published listing through", async () => {
    getPublicProperty = spyOn(publicPages, "getPublicProperty").mockResolvedValue({ published: true } as never)
    const response = await proxy(listing())
    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })

  test("rewrites an unpublished listing to the missing page", async () => {
    getPublicProperty = spyOn(publicPages, "getPublicProperty").mockResolvedValue({ published: false } as never)
    const response = await proxy(listing())
    expect(new URL(response.headers.get("x-middleware-rewrite") ?? "").pathname).toBe("/__missing")
  })

  test("lets the page decide when the lookup fails", async () => {
    getPublicProperty = spyOn(publicPages, "getPublicProperty").mockRejectedValue(new Error("db down"))
    const response = await proxy(listing())
    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })
})

describe("proxy on /login", () => {
  test("does nothing without a landing bounce", async () => {
    const response = await proxy(new NextRequest("http://localhost:3000/login"))
    expect(response.cookies.getAll()).toEqual([])
  })

  test("clears a dead session cookie right after a landing bounce", async () => {
    const response = await proxy(
      new NextRequest("http://localhost:3000/login", { headers: { cookie: "landing_bounce=1" } })
    )

    expect(response.cookies.get("landing_bounce")?.value).toBe("")
    expect(response.cookies.get("better-auth.session_token")?.maxAge).toBe(0)
    expect(response.cookies.get("__Secure-better-auth.session_token")?.secure).toBe(true)
  })
})
