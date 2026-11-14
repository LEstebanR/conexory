import type { Instrumentation } from "next"
import { pathWithoutQuery } from "./lib/posthog"

// Request headers are left out on purpose: they carry the session cookie.
// request.path is the raw URL, so the query string goes too: it can carry
// secrets such as the password-reset token.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { captureRequestError } = await import("./lib/report-error")
  await captureRequestError(error, {
    digest: (error as { digest?: string }).digest,
    path: pathWithoutQuery(request.path),
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
