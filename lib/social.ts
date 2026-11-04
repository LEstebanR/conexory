export type SocialNetwork = "instagram" | "tiktok" | "facebook" | "linkedin" | "youtube"

const NETWORK_DOMAINS: Record<SocialNetwork, string[]> = {
  instagram: ["instagram.com", "instagr.am"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.com", "fb.me"],
  linkedin: ["linkedin.com"],
  youtube: ["youtube.com"],
}

// Path prefixes that precede the actual handle in a profile URL
// (linkedin.com/in/<user>, youtube.com/c/<name>, ...).
const PATH_PREFIXES: Partial<Record<SocialNetwork, string[]>> = {
  linkedin: ["in"],
  youtube: ["c", "user"],
}

function looksLikeUrl(value: string, network: SocialNetwork): boolean {
  if (/^https?:\/\//i.test(value)) return true
  const host = value.split("/")[0].toLowerCase().replace(/^(www\.|m\.)/, "")
  return NETWORK_DOMAINS[network].includes(host)
}

function handleFromUrl(value: string, network: SocialNetwork): string | null {
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
  } catch {
    return null
  }

  const segments = url.pathname.split("/").filter(Boolean)
  if (network === "facebook" && segments[0] === "profile.php") {
    const id = url.searchParams.get("id")
    return id ? `profile.php?id=${id}` : null
  }

  const prefixes = PATH_PREFIXES[network] ?? []
  const index = segments.length > 1 && prefixes.includes(segments[0]) ? 1 : 0
  return segments[index] ?? null
}

// Agents paste anything into the social fields: "@user", "user", or a full
// profile URL copied from the app (with tracking params like ?igsh=...).
// Reduce all of them to the bare handle the link builders expect.
export function normalizeSocialHandle(network: SocialNetwork, raw: string | null | undefined): string | null {
  const value = raw?.trim()
  if (!value) return null

  if (network === "facebook" && FACEBOOK_NUMERIC_PROFILE.test(value)) return value

  const handle = looksLikeUrl(value, network) ? handleFromUrl(value, network) : value.split(/[/?#]/)[0]
  const clean = handle ? safeDecode(handle).replace(/^@+/, "").trim() : ""
  return clean || null
}

const FACEBOOK_NUMERIC_PROFILE = /^profile\.php\?id=\d+$/

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const PROFILE_URL: Record<SocialNetwork, (handle: string) => string> = {
  instagram: (h) => `https://instagram.com/${h}`,
  tiktok: (h) => `https://tiktok.com/@${h}`,
  facebook: (h) => `https://facebook.com/${h}`,
  linkedin: (h) => `https://linkedin.com/in/${h}`,
  youtube: (h) => `https://youtube.com/@${h}`,
}

// Normalizes again at render time so rows saved before normalization existed
// still produce a valid link.
export function socialProfileUrl(network: SocialNetwork, stored: string | null | undefined): string | null {
  const handle = normalizeSocialHandle(network, stored)
  return handle ? PROFILE_URL[network](handle) : null
}
