export function trackPropertyEvent(propertyId: string, type: string) {
  const url = `/api/properties/${propertyId}/event`
  const body = JSON.stringify({ type })
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    fetch(url, { method: "POST", body, keepalive: true }).catch(() => {})
  }
}
