import { describe, test, expect } from "bun:test"
import { requireAdmin } from "./require-admin"

// next/navigation is mocked globally in test-setup.ts: redirect() throws "REDIRECT:<path>".
describe("requireAdmin", () => {
  test("sends a signed-out visitor to /login", async () => {
    await expect(requireAdmin(() => Promise.resolve(null))).rejects.toThrow("REDIRECT:/login")
  })

  test("sends a non-admin user to /dashboard", async () => {
    const session = { user: { role: "user" } }
    await expect(requireAdmin(() => Promise.resolve(session))).rejects.toThrow(
      "REDIRECT:/dashboard"
    )
  })

  test("returns the session of an admin", async () => {
    const session = { user: { role: "admin" } }
    await expect(requireAdmin(() => Promise.resolve(session))).resolves.toBe(session)
  })
})
