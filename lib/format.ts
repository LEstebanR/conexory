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

// "$1.500" — rounded to the nearest million, no "M" suffix, so callers can
// style the suffix separately (e.g. a smaller font next to the value).
export function formatCOPMillionsValue(amount: number): string {
  return `$${Math.round(amount / 1_000_000).toLocaleString("es-CO")}`
}

// "$1.500 M" — full compact form for plain-text contexts.
export function formatCOPMillions(amount: number): string {
  return `${formatCOPMillionsValue(amount)} M`
}
