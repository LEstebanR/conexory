import { E2E_DEV_SERVER_ENV } from "./fake-mercadopago/config"

// `bun run dev:e2e`: the dev server Playwright would start, for when you
// want to keep one running between local E2E runs.
const child = Bun.spawn(["bun", "run", "dev"], {
  env: { ...process.env, ...E2E_DEV_SERVER_ENV, NODE_ENV: "test" },
  stdio: ["inherit", "inherit", "inherit"],
})
process.exit(await child.exited)
