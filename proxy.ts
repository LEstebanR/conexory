import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

// Only checks that a session cookie exists, never validates it against the
// database: that keeps the landing static and uptime pings/crawlers from
// waking the Neon compute. A stale cookie just bounces through /dashboard,
// whose layout validates the session and redirects to /login.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/",
}
