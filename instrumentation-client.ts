import { captureUncaughtErrors } from "./lib/posthog-client"

try {
  captureUncaughtErrors()
} catch {
  // Error tracking must never break the page it is watching.
}
