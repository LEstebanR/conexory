export const SIGNUP_SOURCES = ["property_page", "agent_profile"] as const
export type SignupSource = (typeof SIGNUP_SOURCES)[number]

export const SIGNUP_SOURCE_LABELS: Record<SignupSource, string> = {
  property_page: "Ficha",
  agent_profile: "Perfil",
}

export const SIGNUP_SOURCE_COOKIE = "signup_source"

export const SIGNUP_SOURCE_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
} as const

// Plain allowlist check instead of Zod: the footer helper is imported from a
// client error boundary on /p/[slug], and Zod would ship with that route.
export function parseSignupSource(value: unknown): SignupSource | null {
  return SIGNUP_SOURCES.includes(value as SignupSource) ? (value as SignupSource) : null
}

export function attributedHref(path: string, source: SignupSource): string {
  return `${path}?utm_source=${source}&utm_medium=footer`
}

type CookieContext = {
  getCookie: (name: string) => string | null
  setCookie: (name: string, value: string, options: { maxAge: number; path: string }) => unknown
}

export function signupSourceFromCookies(ctx: Pick<CookieContext, "getCookie"> | null | undefined): SignupSource | null {
  return parseSignupSource(ctx?.getCookie(SIGNUP_SOURCE_COOKIE))
}

// Once stored on a user the cookie has done its job; keeping it would hand the
// same source to any other account created later in that browser.
export function forgetSignupSource(ctx: CookieContext | null | undefined): void {
  if (signupSourceFromCookies(ctx)) ctx?.setCookie(SIGNUP_SOURCE_COOKIE, "", { maxAge: 0, path: "/" })
}

// First touch wins: a later visit from another footer doesn't overwrite a
// valid source, but an invalid or stale value doesn't block a real one.
export function signupSourceToRemember(
  searchParams: URLSearchParams,
  currentCookie: string | undefined
): SignupSource | null {
  if (parseSignupSource(currentCookie)) return null
  return parseSignupSource(searchParams.get("utm_source"))
}
