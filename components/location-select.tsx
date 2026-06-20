"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { DEPARTAMENTOS, getCitiesForDepartamento } from "@/lib/colombia"

const selectClass =
  "w-full h-11 px-3.5 rounded-xl border border-hairline-strong bg-white text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

type Props = {
  initialState?: string
  initialCity?: string
  onStateChange: (value: string) => void
  onCityChange: (value: string) => void
  required?: boolean
  className?: string
}

export default function LocationSelect({
  initialState = "",
  initialCity = "",
  onStateChange,
  onCityChange,
  required,
  className,
}: Props) {
  const [selectedState, setSelectedState] = useState(initialState)
  const [selectedCity, setSelectedCity] = useState(initialCity)

  const cities = getCitiesForDepartamento(selectedState)

  // When department changes, clear city unless it's still valid
  function handleStateChange(value: string) {
    setSelectedState(value)
    onStateChange(value)
    const newCities = getCitiesForDepartamento(value)
    const cityStillValid = newCities.includes(selectedCity)
    if (!cityStillValid) {
      setSelectedCity("")
      onCityChange("")
    }
  }

  function handleCityChange(value: string) {
    setSelectedCity(value)
    onCityChange(value)
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {/* Departamento */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">
          Departamento
        </label>
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className={selectClass}
            required={required}
          >
            <option value="">Selecciona…</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
      </div>

      {/* Ciudad */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">
          Ciudad
        </label>
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className={selectClass}
            disabled={cities.length === 0}
            required={required}
          >
            <option value="">
              {selectedState ? "Selecciona…" : "— Elige un departamento —"}
            </option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
      </div>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
