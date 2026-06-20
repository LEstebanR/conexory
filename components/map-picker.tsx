"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { Search, X, MapPin } from "lucide-react"

const COLOMBIA_CENTER: [number, number] = [4.711, -74.0721]
const DEFAULT_ZOOM = 5
const PICKED_ZOOM = 14
const SUGGESTED_ZOOM = 12

function createPinIcon(suggested = false) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;
      background:${suggested ? "#888" : "#000"};
      border:3px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg) translate(-4px,-4px);
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      ${suggested ? "opacity:0.6;" : ""}
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  })
}

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

async function geocode(query: string): Promise<NominatimResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=co&limit=1`,
      { headers: { "Accept-Language": "es" } }
    )
    const data: NominatimResult[] = await res.json()
    return data[0] ?? null
  } catch {
    return null
  }
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } })
  return null
}

function FlyTo({ coords, zoom }: { coords: [number, number] | null; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, zoom, { duration: 0.8 })
  }, [coords, zoom, map])
  return null
}

type Props = {
  latitude?: number | null
  longitude?: number | null
  suggestedCity?: string  // e.g. "Medellín, Antioquia" — flies there if no pin set
  onChange: (lat: number | null, lng: number | null) => void
}

function parseDisplayName(raw: string): { main: string; context: string } {
  const parts = raw.split(", ")
  const main = parts[0] ?? raw
  const context = parts
    .slice(1)
    .filter((p) => p.toLowerCase() !== "colombia")
    .join(", ")
  return { main, context }
}

export default function MapPicker({ latitude, longitude, suggestedCity, onChange }: Props) {
  const hasInitial = latitude != null && longitude != null
  const [position, setPosition] = useState<[number, number] | null>(
    hasInitial ? [latitude!, longitude!] : null
  )
  // Suggested location (no pin, just center the map)
  const [suggestedPos, setSuggestedPos] = useState<[number, number] | null>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinIconRef = useRef<L.DivIcon | null>(null)
  const suggestedIconRef = useRef<L.DivIcon | null>(null)
  const prevCityRef = useRef<string | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setResults([])
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  useEffect(() => {
    pinIconRef.current = createPinIcon(false)
    suggestedIconRef.current = createPinIcon(true)
  }, [])

  // Auto-suggest when city changes and no pin is placed
  useEffect(() => {
    if (!suggestedCity || suggestedCity === prevCityRef.current || position) return
    prevCityRef.current = suggestedCity
    geocode(`${suggestedCity}, Colombia`).then((result) => {
      if (result) {
        setSuggestedPos([parseFloat(result.lat), parseFloat(result.lon)])
      }
    })
  }, [suggestedCity, position])

  function handlePick(lat: number, lng: number) {
    const pos: [number, number] = [lat, lng]
    setPosition(pos)
    setSuggestedPos(null)
    onChange(lat, lng)
    setResults([])
  }

  function handleClear() {
    setPosition(null)
    onChange(null, null)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&countrycodes=co&limit=5&addressdetails=0`,
          { headers: { "Accept-Language": "es" } }
        )
        const data: NominatimResult[] = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  function selectResult(r: NominatimResult) {
    setQuery(r.display_name.split(",")[0])
    setResults([])
    handlePick(parseFloat(r.lat), parseFloat(r.lon))
  }

  const flyTarget = position ?? suggestedPos
  const flyZoom = position ? PICKED_ZOOM : SUGGESTED_ZOOM

  return (
    <div className="space-y-2">
      {/* Search */}
      <div ref={containerRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar dirección o lugar en Colombia…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query && results.length === 0 && handleQueryChange(query)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-hairline-strong text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-mute border-t-ink rounded-full animate-spin" />
        )}
        {results.length > 0 && (
          <ul className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-hairline-strong shadow-xl overflow-hidden">
            {results.map((r, i) => {
              const { main, context } = parseDisplayName(r.display_name)
              return (
                <li key={r.place_id} className={i > 0 ? "border-t border-hairline" : ""}>
                  <button
                    type="button"
                    onClick={() => selectResult(r)}
                    className="w-full text-left px-4 py-3 hover:bg-canvas-soft transition-colors group"
                  >
                    <p className="text-sm font-semibold text-ink group-hover:text-ink leading-tight truncate">
                      {main}
                    </p>
                    {context && (
                      <p className="text-xs text-mute mt-0.5 truncate">{context}</p>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-hairline-strong" style={{ height: 300 }}>
        <MapContainer
          center={flyTarget ?? COLOMBIA_CENTER}
          zoom={flyTarget ? flyZoom : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler onPick={handlePick} />
          <FlyTo coords={flyTarget} zoom={flyZoom} />
          {position && pinIconRef.current && (
            <Marker position={position} icon={pinIconRef.current} />
          )}
          {!position && suggestedPos && suggestedIconRef.current && (
            <Marker position={suggestedPos} icon={suggestedIconRef.current} />
          )}
        </MapContainer>

        {/* Hint overlay */}
        {!position && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4 z-[500]">
            <div className="bg-ink/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              {suggestedPos
                ? `Sugerencia: ${suggestedCity}. Toca para confirmar la ubicación exacta`
                : "Toca el mapa para fijar la ubicación"}
            </div>
          </div>
        )}
      </div>

      {/* Coordinates + clear */}
      {position && (
        <div className="flex items-center justify-between px-3 py-2 bg-canvas-softer rounded-xl">
          <div className="flex items-center gap-2 text-xs text-body">
            <MapPin className="w-3.5 h-3.5 text-mute flex-shrink-0" />
            <span>{position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-mute hover:text-ink transition-colors"
          >
            <X className="w-3 h-3" />
            Quitar
          </button>
        </div>
      )}
    </div>
  )
}
