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

// Millions-compact only when it's lossless (a multiple of $10.000, so two
// decimals in millions represent it exactly); otherwise the full currency,
// so the shown price always matches what the agent typed. Used across the
// dashboard, agent profile and map popups.
export function formatCOPCompact(amount: number): string {
  const lossless = Number.isInteger(amount / 10_000)
  return amount >= 1_000_000 && lossless ? formatCOPMillions(amount) : formatCOP(amount)
}
