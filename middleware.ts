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
  // Excluye _next (estáticos, imagen, data chunks), api (Better Auth + upload)
  // y archivos con extensión (favicon, imágenes, fuentes, etc.)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
