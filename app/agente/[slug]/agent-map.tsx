"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import { formatCOP as formatCOPFull, formatCOPMillions } from "@/lib/format"

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

const CITY_COORDS: Record<string, [number, number]> = {
  "bogota": [4.7110, -74.0721],
  "medellin": [6.2442, -75.5812],
  "cali": [3.4516, -76.5320],
  "barranquilla": [10.9685, -74.7813],
  "cartagena": [10.3910, -75.4794],
  "bucaramanga": [7.1193, -73.1227],
  "pereira": [4.8133, -75.6961],
  "santa marta": [11.2408, -74.1990],
  "manizales": [5.0703, -75.5138],
  "cucuta": [7.8939, -72.5078],
  "ibague": [4.4389, -75.2322],
  "pasto": [1.2136, -77.2811],
  "villavicencio": [4.1420, -73.6266],
  "armenia": [4.5339, -75.6811],
  "monteria": [8.7575, -75.8869],
  "sincelejo": [9.3047, -75.3978],
  "valledupar": [10.4631, -73.2532],
  "riohacha": [11.5444, -72.9072],
  "popayan": [2.4448, -76.6147],
  "neiva": [2.9273, -75.2819],
  "tunja": [5.5353, -73.3678],
  "palmira": [3.5396, -76.3042],
  "bello": [6.3368, -75.5573],
  "soledad": [10.9176, -74.7691],
  "itagui": [6.1849, -75.5990],
  "buenaventura": [3.8801, -77.0311],
  "soacha": [4.5793, -74.2177],
}

// Coordinates of each department's capital — fallback for properties whose
// city isn't in CITY_COORDS (a small list of major cities only). Covers all
// 33 Colombian departamentos so a property is only ever dropped from the map
// if it also lacks a recognized `state`.
const DEPARTAMENTO_COORDS: Record<string, [number, number]> = {
  "amazonas": [-4.2153, -69.9406],
  "antioquia": [6.2442, -75.5812],
  "arauca": [7.0847, -70.7591],
  "atlantico": [10.9685, -74.7813],
  "bolivar": [10.3910, -75.4794],
  "boyaca": [5.5353, -73.3678],
  "caldas": [5.0703, -75.5138],
  "caqueta": [1.6144, -75.6062],
  "casanare": [5.3378, -72.3959],
  "cauca": [2.4448, -76.6147],
  "cesar": [10.4631, -73.2532],
  "choco": [5.6947, -76.6611],
  "cordoba": [8.7575, -75.8869],
  "cundinamarca": [4.7110, -74.0721],
  "guainia": [3.8653, -67.9239],
  "guaviare": [2.5729, -72.6459],
  "huila": [2.9273, -75.2819],
  "la guajira": [11.5444, -72.9072],
  "magdalena": [11.2408, -74.1990],
  "meta": [4.1420, -73.6266],
  "narino": [1.2136, -77.2811],
  "norte de santander": [7.8939, -72.5078],
  "putumayo": [1.1487, -76.6486],
  "quindio": [4.5339, -75.6811],
  "risaralda": [4.8133, -75.6961],
  "san andres y providencia": [12.5847, -81.7006],
  "santander": [7.1193, -73.1227],
  "sucre": [9.3047, -75.3978],
  "tolima": [4.4389, -75.2322],
  "valle del cauca": [3.4516, -76.5320],
  "vaupes": [1.2531, -70.2339],
  "vichada": [6.1891, -67.4859],
}

function normalize(s: string): string {
  return s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

// Deterministic jitter so clustered markers don't stack — `scale` widens the
// spread for the coarser department-level fallback vs. city-level.
function jitter(id: string, scale = 1): [number, number] {
  const n = parseInt(id.slice(-6), 16) || 0
  return [((n % 200) - 100) / 20000 * scale, (((n >> 8) % 200) - 100) / 20000 * scale]
}

export interface MapProperty {
  id: string
  slug: string
  title: string
  city: string
  state: string | null
  price: number
  images: string[]
  latitude: number | null
  longitude: number | null
}

function formatCOP(n: number): string {
  return n >= 1_000_000 ? formatCOPMillions(n) : formatCOPFull(n)
}

type PositionedProperty = MapProperty & { lat: number; lng: number }

// Hover opens the preview; a short grace period on close lets the cursor
// travel from the marker onto the popup (a separate DOM node in Leaflet's
// overlay pane) without it closing mid-move. On touch, mobile browsers fire
// a synthetic mouseover on the first tap immediately before the native click
// — with hover handlers attached, that click would toggle the popup we just
// opened closed again, so touch skips the hover handlers entirely and relies
// on Leaflet's default click-to-open behavior instead.
function PropertyMarker({ p }: { p: PositionedProperty }) {
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
      position={[p.lat, p.lng]}
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
              <p style={{ fontWeight: 900, fontSize: 15, margin: "0 0 10px", color: "#000" }}>{formatCOP(p.price)}</p>
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

  const positioned = properties.flatMap((p) => {
    let lat: number
    let lng: number
    if (p.latitude != null && p.longitude != null) {
      lat = p.latitude
      lng = p.longitude
    } else {
      const cityCoords = CITY_COORDS[normalize(p.city)]
      const departamentoCoords = p.state ? DEPARTAMENTO_COORDS[normalize(p.state)] : undefined
      const coords = cityCoords ?? departamentoCoords
      if (!coords) return []
      const [jLat, jLng] = jitter(p.id, cityCoords ? 1 : 100)
      lat = coords[0] + jLat
      lng = coords[1] + jLng
    }
    return [{ ...p, lat, lng }]
  })

  if (positioned.length === 0) return null

  const centerLat = positioned.reduce((s, p) => s + p.lat, 0) / positioned.length
  const centerLng = positioned.reduce((s, p) => s + p.lng, 0) / positioned.length

  const allPositions: [number, number][] = positioned.map((p) => [p.lat, p.lng])

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
      {positioned.map((p) => (
        <PropertyMarker key={p.id} p={p} />
      ))}
    </MapContainer>
  )
}
