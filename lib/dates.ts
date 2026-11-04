export const COLOMBIA_TIME_ZONE = "America/Bogota"

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

// Dates are stored in UTC and server code runs in UTC on Vercel, so every
// date shown to a person must be formatted in Colombia time explicitly —
// otherwise anything after 7 p. m. shows up as the next day.
export function formatColombiaDate(date: Date | string, options: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleString("es-CO", { ...options, timeZone: COLOMBIA_TIME_ZONE })
}

export function colombiaHour(date: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: COLOMBIA_TIME_ZONE,
  }).format(date)
  return Number(hour)
}
