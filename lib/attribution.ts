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
} as const

// Plain allowlist check instead of Zod: the footer helper is imported from a
// client error boundary on /p/[slug], and Zod would ship with that route.
export function parseSignupSource(value: unknown): SignupSource | null {
  return SIGNUP_SOURCES.includes(value as SignupSource) ? (value as SignupSource) : null
}

export function attributedHref(path: string, source: SignupSource): string {
  return `${path}?utm_source=${source}&utm_medium=footer`
}

export function signupSourceFromCookies(
  ctx: { getCookie: (name: string) => string | null } | null | undefined
): SignupSource | null {
  return parseSignupSource(ctx?.getCookie(SIGNUP_SOURCE_COOKIE))
}

// First touch wins: a later visit from another footer doesn't overwrite it.
export function signupSourceToRemember(
  searchParams: URLSearchParams,
  alreadyRemembered: boolean
): SignupSource | null {
  if (alreadyRemembered) return null
  return parseSignupSource(searchParams.get("utm_source"))
}
