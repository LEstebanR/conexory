"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import { formatCOPCompact } from "@/lib/format"

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 14)
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 14 })
    }
  }, [map, positions])
  return null
}

// Fix Leaflet default icon paths broken by webpack
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  })
}

export interface MapProperty {
  id: string
  slug: string
  title: string
  city: string
  price: number
  images: string[]
  latitude: number
  longitude: number
}

// Hover opens the preview; a short grace period on close lets the cursor
// travel from the marker onto the popup (a separate DOM node in Leaflet's
// overlay pane) without it closing mid-move. On touch, mobile browsers fire
// a synthetic mouseover on the first tap immediately before the native click
// — with hover handlers attached, that click would toggle the popup we just
// opened closed again, so touch skips the hover handlers entirely and relies
// on Leaflet's default click-to-open behavior instead.
function PropertyMarker({ p }: { p: MapProperty }) {
  const markerRef = useRef<L.Marker>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function cancelClose() {
    if (closeTimer.current != null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = setTimeout(() => markerRef.current?.closePopup(), 150)
  }

  return (
    <Marker
      ref={markerRef}
      position={[p.latitude, p.longitude]}
      eventHandlers={L.Browser.touch ? {} : {
        mouseover: () => {
          cancelClose()
          markerRef.current?.openPopup()
        },
        mouseout: scheduleClose,
      }}
    >
      <Popup minWidth={200} maxWidth={220}>
        <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <Link href={`/p/${p.slug}`} target="_blank" className="block no-underline">
            {p.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.images[0]}
                alt={p.title}
                style={{ width: "100%", height: 120, objectFit: "cover", display: "block", borderRadius: "8px 8px 0 0", margin: 0 }}
              />
            )}
            <div style={{ padding: "10px 12px 12px" }}>
              <p style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3, margin: "0 0 4px", color: "#000" }}>{p.title}</p>
              <p style={{ fontSize: 11, color: "#afafaf", margin: "0 0 8px" }}>{p.city}</p>
              <p style={{ fontWeight: 900, fontSize: 15, margin: "0 0 10px", color: "#000" }}>{formatCOPCompact(p.price)}</p>
              <span style={{ display: "block", textAlign: "center", fontSize: 12, fontWeight: 700, background: "#000", color: "#fff", borderRadius: 999, padding: "6px 14px" }}>
                Ver propiedad
              </span>
            </div>
          </Link>
        </div>
      </Popup>
    </Marker>
  )
}

export default function AgentMap({ properties }: { properties: MapProperty[] }) {
  useEffect(() => { fixLeafletIcons() }, [])

  if (properties.length === 0) return null

  const centerLat = properties.reduce((s, p) => s + p.latitude, 0) / properties.length
  const centerLng = properties.reduce((s, p) => s + p.longitude, 0) / properties.length

  const allPositions: [number, number][] = properties.map((p) => [p.latitude, p.longitude])

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={allPositions} />
      {properties.map((p) => (
        <PropertyMarker key={p.id} p={p} />
      ))}
    </MapContainer>
  )
}
