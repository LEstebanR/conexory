import type { Instrumentation } from "next"

// Request headers are left out on purpose: they carry the session cookie.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { captureServerError } = await import("./lib/report-error")
  await captureServerError(error, {
    digest: (error as { digest?: string }).digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
