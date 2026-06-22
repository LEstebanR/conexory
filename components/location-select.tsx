"use client"

import { useEffect, useRef, useState } from "react"
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

function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CityCombobox({
  cities,
  value,
  onChange,
  disabled,
  required,
}: {
  cities: string[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  required?: boolean
}) {
  const [inputValue, setInputValue] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        // If the text doesn't match a valid city, clear it
        if (!cities.includes(inputValue)) {
          setInputValue(value)
        }
      }
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [open, cities, inputValue, value])

  const filtered = inputValue.trim()
    ? cities.filter((c) => c.toLowerCase().includes(inputValue.toLowerCase()))
    : cities

  function select(city: string) {
    setInputValue(city)
    onChange(city)
    setOpen(false)
  }

  function handleInput(raw: string) {
    setInputValue(raw)
    setOpen(true)
    if (!raw) onChange("")
  }

  function handleBlur() {
    // Small delay so click on option fires first
    setTimeout(() => {
      if (!cities.includes(inputValue)) {
        setInputValue(value)
      }
    }, 150)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder={disabled ? "— Elige un departamento —" : "Buscar ciudad…"}
        disabled={disabled}
        required={required}
        autoComplete="off"
        className={cn(
          "w-full h-11 px-3.5 rounded-xl border border-hairline-strong bg-white text-sm text-ink placeholder:text-mute",
          "focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
      {/* Indicate it's a combobox */}
      <ChevronDown />

      {open && !disabled && filtered.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 top-[calc(100%+4px)] bg-white border border-hairline rounded-xl shadow-lg shadow-black/10 max-h-56 overflow-y-auto py-1">
          {filtered.map((city) => (
            <li key={city}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(city) }}
                className={cn(
                  "w-full text-left px-3.5 py-2 text-sm transition-colors",
                  city === value
                    ? "font-semibold text-ink bg-canvas-soft"
                    : "text-body hover:bg-canvas-soft"
                )}
              >
                {city}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3.5 py-2 text-sm text-mute">Sin resultados</li>
          )}
        </ul>
      )}
    </div>
  )
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

  function handleStateChange(value: string) {
    setSelectedState(value)
    onStateChange(value)
    const newCities = getCitiesForDepartamento(value)
    if (!newCities.includes(selectedCity)) {
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
      {/* Departamento — plain select, only 32 options */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">Departamento</label>
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className={selectClass}
            required={required}
          >
            <option value="">Selecciona…</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
          <ChevronDown />
        </div>
      </div>

      {/* Ciudad — combobox with filtering */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">Ciudad</label>
        <CityCombobox
          key={selectedState}
          cities={cities}
          value={selectedCity}
          onChange={handleCityChange}
          disabled={cities.length === 0}
          required={required}
        />
      </div>
    </div>
  )
}
