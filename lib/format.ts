// Shared Colombian-peso formatting — single source of truth so every surface
// (dashboard, public property page, agent profile, flyers) agrees on it.

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// "$1.500" / "$2,85" — the amount in millions, no "M" suffix, so callers can
// style the suffix separately (e.g. a smaller font next to the value). Keeps
// up to two decimals instead of rounding to whole millions: a $1.500.000 rent
// must never read as "$2 M".
export function formatCOPMillionsValue(amount: number): string {
  return `$${(amount / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 2 })}`
}

// "$1.500 M" — full compact form for plain-text contexts.
export function formatCOPMillions(amount: number): string {
  return `${formatCOPMillionsValue(amount)} M`
}

// Above this amount the full peso figure ("$ 12.500.000.000") no longer fits
// cards or flyer price boxes, so we switch to the compact "$ 12.500 M" form.
// Note: "M" is millones — Colombian Spanish "billón" means 10^12 (not the
// English "billion" = 10^9), so we never use that word here.
export const PRICE_ABBREVIATION_THRESHOLD = 1_000_000_000

// Full price below the threshold, so what the agent typed is what buyers see;
// millions-compact only for very large amounts. Used across the dashboard,
// agent profile and map popups.
export function formatCOPCompact(amount: number): string {
  return amount >= PRICE_ABBREVIATION_THRESHOLD ? formatCOPMillions(amount) : formatCOP(amount)
}
