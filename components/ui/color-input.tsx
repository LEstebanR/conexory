"use client"

import { useState } from "react"
import { Input } from "./input"
import { HEX_COLOR_REGEX } from "@/lib/flyer-options"

export function ColorInput({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (hex: string) => void
  id?: string
}) {
  const [text, setText] = useState(value)

  function handleTextChange(next: string) {
    setText(next)
    if (HEX_COLOR_REGEX.test(next)) onChange(next)
  }

  function handleSwatchChange(next: string) {
    setText(next)
    onChange(next)
  }

  return (
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        aria-label="Elegir color"
        value={HEX_COLOR_REGEX.test(text) ? text : value}
        onChange={(e) => handleSwatchChange(e.target.value)}
        className="w-11 h-11 rounded-lg border border-hairline-strong cursor-pointer bg-white p-1 flex-shrink-0"
      />
      <Input
        id={id}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="#0A0A0A"
        maxLength={7}
        className="font-mono uppercase h-11 w-32"
      />
    </div>
  )
}
