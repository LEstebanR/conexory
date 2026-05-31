import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que un usuario autenticado no debería ver
const AUTH_ONLY_ROUTES = ["/login", "/register"]
// Rutas públicas raíz que redirigen al dashboard si hay sesión
const REDIRECT_IF_AUTHED = ["/", ...AUTH_ONLY_ROUTES]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Better Auth guarda el token en esta cookie
  const session = request.cookies.get("better-auth.session_token")
  const isLoggedIn = !!session?.value

  // Usuario autenticado intentando acceder a home o páginas de auth → dashboard
  if (isLoggedIn && REDIRECT_IF_AUTHED.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Usuario no autenticado intentando acceder al dashboard → login
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - archivos estáticos de Next.js
     * - rutas de la API de auth (Better Auth las maneja sola)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
