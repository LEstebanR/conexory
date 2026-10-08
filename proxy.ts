import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { publicListingSlug } from "@/lib/listing-seo"

async function isPublishedListing(slug: string): Promise<boolean | null> {
  try {
    const { getPublicProperty } = await import("@/lib/public-pages")
    const property = await getPublicProperty(slug)
    return Boolean(property?.published)
  } catch {
    return null
  }
}

const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"]
const LANDING_BOUNCE_COOKIE = "landing_bounce"

// Only checks that a session cookie exists, never validates it against the
// database: that keeps the landing static and uptime pings/crawlers from
// waking the Neon compute. A revoked session's cookie would then send every
// visit to / through /dashboard to /login forever, so the redirect leaves a
// short-lived marker and, if the user lands on /login right after, the dead
// cookie is cleared there.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const slug = publicListingSlug(pathname)
  if (slug) {
    const published = await isPublishedListing(slug)
    if (published === false) {
      const url = request.nextUrl.clone()
      url.pathname = "/__missing"
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  if (pathname === "/login") {
    if (!request.cookies.has(LANDING_BOUNCE_COOKIE)) return NextResponse.next()
    const response = NextResponse.next()
    response.cookies.delete(LANDING_BOUNCE_COOKIE)
    for (const name of SESSION_COOKIES) {
      response.cookies.set(name, "", { maxAge: 0, path: "/", secure: name.startsWith("__Secure-") })
    }
    return response
  }

  if (!getSessionCookie(request)) return NextResponse.next()

  const response = NextResponse.redirect(new URL("/dashboard", request.url))
  response.cookies.set(LANDING_BOUNCE_COOKIE, "1", { maxAge: 10, httpOnly: true, path: "/" })
  return response
}

export const config = {
  matcher: ["/", "/login", "/p/:slug"],
}
