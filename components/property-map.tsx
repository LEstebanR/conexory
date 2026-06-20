"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"

function createPinIcon() {
  return L.divIcon({
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
}

type Props = {
  latitude: number
  longitude: number
  label?: string
}

export default function PropertyMap({ latitude, longitude, label }: Props) {
  const pinIcon = useRef<L.DivIcon | null>(null)

  useEffect(() => {
    pinIcon.current = createPinIcon()
  }, [])

  return (
    <div className="rounded-2xl border border-hairline overflow-hidden">
      <div style={{ height: 280 }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pinIcon.current && (
            <Marker position={[latitude, longitude]} icon={pinIcon.current} />
          )}
        </MapContainer>
      </div>
      {label && (
        <div className="px-5 py-3 border-t border-hairline bg-canvas-softer">
          <p className="text-xs text-mute">{label}</p>
        </div>
      )}
    </div>
  )
}
