import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const REDIRECT_IF_AUTHED = new Set(["/", "/login", "/register"])

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const session = request.cookies.get("better-auth.session_token")
    const isLoggedIn = !!session?.value

    if (isLoggedIn && REDIRECT_IF_AUTHED.has(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (!isLoggedIn && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  } catch {
    // No bloquear peticiones si el middleware falla
  }

  return NextResponse.next()
}

export const config = {
  // Solo corre en las rutas que necesitan lógica de auth.
  // Las demás (/_next, /api, /p/*, /terms, /privacy…) no lo necesitan.
  matcher: ["/", "/login", "/register", "/dashboard/:path*"],
}
