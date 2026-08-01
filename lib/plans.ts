// Per-plan limits. Single source of truth for enforcement (server) and UI.
// Free: 3 active properties, 10 photos per property.
// Pro:  50 active properties, 20 photos per property.
// Custom: no limit — managed by contact, has no flag of its own.

export const FREE_PROPERTY_LIMIT = 3
export const PRO_PROPERTY_LIMIT = 50
export const FREE_PHOTO_LIMIT = 10
export const PRO_PHOTO_LIMIT = 20
export const PINNED_LIMIT = 3
export const FREE_AI_MESSAGE_LIMIT = 0
export const PRO_AI_MESSAGE_LIMIT = 10

export function propertyLimit(isPremium: boolean): number {
  return isPremium ? PRO_PROPERTY_LIMIT : FREE_PROPERTY_LIMIT
}

export function photoLimit(isPremium: boolean): number {
  return isPremium ? PRO_PHOTO_LIMIT : FREE_PHOTO_LIMIT
}

// Same for every plan — pinning is about curation, not a paywalled quota.
export function pinnedLimit(): number {
  return PINNED_LIMIT
}

export function aiMessageLimit(isPremium: boolean): number {
  return isPremium ? PRO_AI_MESSAGE_LIMIT : FREE_AI_MESSAGE_LIMIT
}

// Admins get functional Pro access without being billing Pro customers.
// isPremium stays the sole source of truth for billing; role only affects gating.
export function hasProAccess(user: { isPremium: boolean; role: string }): boolean {
  return user.isPremium || user.role === "admin"
}
