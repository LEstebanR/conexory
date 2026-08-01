import { test, expect } from "@playwright/test"
import { prisma } from "@/lib/prisma"
import { registerUser } from "./helpers/auth"

test("registro → crear propiedad → compartir", async ({ page }) => {
  const user = await registerUser(page, { prefix: "signup" })
  const title = `Apartamento E2E ${Date.now()}`

  await page.goto("/dashboard/properties/new")

  await page.getByRole("button", { name: "Apartamento", exact: true }).click()
  await page.getByPlaceholder("Ej: Apartamento moderno con vista al parque").fill(title)
  await page.getByPlaceholder("2.800.000").fill("350000000")
  // Only <select> on the page — Departamento/Ciudad aren't <label for> pairs.
  await page.locator("select").selectOption({ label: "Cundinamarca" })
  await page.getByPlaceholder("Buscar ciudad…").fill("Bogotá D.C.")
  await page.getByRole("button", { name: "Bogotá D.C.", exact: true }).click()

  // MapPicker keeps re-centering after the city is set, so force skips
  // Playwright's position-stability check on the submit button.
  const submit = page.getByRole("button", { name: "Publicar propiedad" })
  await submit.scrollIntoViewIfNeeded()
  await submit.click({ force: true })
  // "new" itself satisfies [^/]+, hence the negative lookahead.
  await page.waitForURL(/\/dashboard\/properties\/(?!new)[^/]+$/)

  const property = await prisma.property.findFirstOrThrow({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, published: true },
  })
  expect(property.title).toBe(title)
  expect(property.published).toBe(true)

  await page.goto(`/p/${property.slug}`)
  await expect(page.getByText(title)).toBeVisible()
})
