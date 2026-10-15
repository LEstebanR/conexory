import { test, expect } from "@playwright/test"
import { registerUser } from "./helpers/auth"
import { seedProperty } from "./helpers/properties"

test("sin sesión, el dashboard redirige a /login", async ({ page }) => {
  await page.goto("/dashboard")
  await page.waitForURL("**/login")
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible()
})

test("un agente no puede abrir la propiedad de otro agente", async ({ page, browser }) => {
  const otherContext = await browser.newContext()
  const owner = await registerUser(await otherContext.newPage(), { prefix: "owner" })
  await otherContext.close()
  const property = await seedProperty(owner.userId)

  await registerUser(page, { prefix: "intruder" })
  const response = await page.goto(`/dashboard/properties/${property.id}`)
  expect(response?.status()).toBe(404)
})

test("la ficha pública no expone el id del agente", async ({ page }) => {
  const agent = await registerUser(page, { prefix: "public" })
  const property = await seedProperty(agent.userId)

  await page.goto(`/p/${property.slug}`)
  await expect(page.getByText(property.title)).toBeVisible()
  expect(await page.content()).not.toContain(agent.userId)
})
