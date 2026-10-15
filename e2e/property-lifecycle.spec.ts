import { test, expect } from "@playwright/test"
import { propertyLimit } from "@/lib/plans"
import { registerUser } from "./helpers/auth"
import { seedProperty } from "./helpers/properties"

test("desactivar una propiedad la saca de la vista pública", async ({ page }) => {
  const agent = await registerUser(page, { prefix: "unpublish" })
  const property = await seedProperty(agent.userId)

  await page.goto(`/p/${property.slug}`)
  await expect(page.getByText(property.title)).toBeVisible()

  await page.goto(`/dashboard/properties/${property.id}`)
  await page.getByRole("button", { name: "Desactivar" }).click()
  await expect(page.getByText("Propiedad desactivada.")).toBeVisible()

  const response = await page.goto(`/p/${property.slug}`)
  expect(response?.status()).toBe(404)
})

test("el plan gratis avisa al llegar al límite de propiedades activas", async ({ page }) => {
  const agent = await registerUser(page, { prefix: "limit" })
  for (let i = 0; i < propertyLimit(false); i++) await seedProperty(agent.userId)

  await page.goto("/dashboard")
  await expect(page.getByText("Límite del plan gratuito alcanzado")).toBeVisible()
  await expect(page.getByRole("link", { name: "Actualizar a Pro" }).first()).toBeVisible()
})
