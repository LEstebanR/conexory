import { test, expect } from "@playwright/test"
import { registerUser } from "./helpers/auth"

test("login con email y contraseña existentes", async ({ page }) => {
  const user = await registerUser(page, { prefix: "login" })

  // Waits on the sign-out call itself rather than the app's client-side
  // redirect after, which doesn't always navigate away from /dashboard
  // despite the call succeeding (real app quirk, out of scope here).
  const signOutResponse = page.waitForResponse("**/api/auth/sign-out")
  await page.getByRole("button", { name: "Cerrar sesión" }).click()
  await signOutResponse

  await page.goto("/login")
  await page.locator("#email").fill(user.email)
  await page.locator("#password").fill(user.password)
  await page.getByRole("button", { name: "Iniciar sesión" }).click()
  await page.waitForURL("**/dashboard")

  await expect(page.getByText(user.email)).toBeVisible()
})
