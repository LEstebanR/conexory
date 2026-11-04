"use client"

import "leaflet/dist/leaflet.css"
import { useState } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"

type Props = {
  latitude: number
  longitude: number
  label?: string
  directionsLabel?: string
}

export default function PropertyMap({ latitude, longitude, label, directionsLabel }: Props) {
  // One-finger drags must scroll the page on touch screens, not pan the map.
  const [isTouch] = useState(() => window.matchMedia("(pointer: coarse)").matches)
  const [pinIcon] = useState<L.DivIcon>(() =>
    L.divIcon({
      className: "",
      html: `<div style="
        width:28px;height:28px;
        background:#000;border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg) translate(-4px,-4px);
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20],
    })
  )

  return (
    <div className="relative isolate rounded-2xl border border-hairline overflow-hidden">
      <div style={{ height: 280 }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          dragging={!isTouch}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pinIcon && (
            <Marker position={[latitude, longitude]} icon={pinIcon} />
          )}
        </MapContainer>
      </div>
      {(label || directionsLabel) && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-hairline bg-canvas-softer">
          {label && <p className="min-w-0 text-sm text-body">{label}</p>}
          {directionsLabel && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-white border border-hairline-strong px-4 py-2 text-sm font-medium text-ink hover:border-ink transition-colors"
            >
              {directionsLabel}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
