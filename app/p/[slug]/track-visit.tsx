"use client"

import { useEffect, useRef } from "react"
import { trackPropertyEvent } from "@/lib/track-property-event"

// Fired from the browser rather than during render so crawlers and link
// previewers (which don't run JS) neither count as visits nor force the
// page's data out of cache.
export default function TrackVisit({ propertyId }: { propertyId: string }) {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    trackPropertyEvent(propertyId, "visit")
  }, [propertyId])

  return null
}
