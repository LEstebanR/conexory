"use client"

import { useEffect } from "react"
import { trackPropertyEvent } from "@/lib/track-property-event"

// Fired from the browser rather than during render so crawlers and link
// previewers (which don't run JS) neither count as visits nor force the
// page's data out of cache.
export default function TrackVisit({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    trackPropertyEvent(propertyId, "visit")
  }, [propertyId])

  return null
}
