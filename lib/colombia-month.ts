const TIME_ZONE = "America/Bogota"
// Colombia has no daylight saving time: it is always UTC-5.
const UTC_OFFSET_HOURS = 5

function colombiaYearMonth(now: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "numeric", timeZone: TIME_ZONE }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get("year"), month: get("month") - 1 }
}

export function startOfColombiaMonth(now: Date = new Date()): Date {
  const { year, month } = colombiaYearMonth(now)
  return new Date(Date.UTC(year, month, 1, UTC_OFFSET_HOURS))
}

export function colombiaMonthName(now: Date = new Date()): string {
  return now.toLocaleString("es-CO", { month: "long", timeZone: TIME_ZONE })
}
