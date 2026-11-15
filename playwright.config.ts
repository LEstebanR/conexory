import { defineConfig, devices } from "@playwright/test"
import { E2E_DEV_SERVER_ENV, FAKE_MP_URL } from "./e2e/fake-mercadopago/config"

// Next.js refuses a second `next dev` per project directory regardless of
// port, so this reuses whatever dev server is already running locally.
const PORT = 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "bun e2e/fake-mercadopago/server.ts",
      url: `${FAKE_MP_URL}/__health`,
      reuseExistingServer: !process.env.CI,
      timeout: 10_000,
    },
    {
      command: `NODE_ENV=test PORT=${PORT} bun run dev`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: E2E_DEV_SERVER_ENV,
    },
  ],
})
