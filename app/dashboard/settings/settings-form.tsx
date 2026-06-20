"use client"

import { useActionState, useRef, useState } from "react"
import { toast } from "sonner"
import { useEffect } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProfile, type ProfileState } from "./actions"

interface Props {
  name: string
  email: string
  image: string | null
}

export default function SettingsForm({ name, email, image }: Props) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(updateProfile, {})
  const [avatarUrl, setAvatarUrl] = useState(image ?? "")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.success) toast.success("Perfil actualizado.")
    if (state.error) toast.error(state.error)
  }, [state])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const { url } = await res.json()
      setAvatarUrl(url)
    } catch {
      toast.error("No se pudo subir la imagen.")
    } finally {
      setUploading(false)
    }
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="image" value={avatarUrl} />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-ink flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-hairline-strong flex items-center justify-center hover:bg-canvas-soft transition-colors disabled:opacity-60"
          >
            <Camera className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-sm font-bold text-ink">{name}</p>
          <p className="text-xs text-mute mt-0.5">{email}</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs text-body hover:text-ink transition-colors mt-1.5 disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : "Cambiar foto"}
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-semibold text-ink">
          Nombre completo
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          required
          maxLength={80}
          className="h-11"
        />
      </div>

      <Button type="submit" disabled={isPending || uploading} className="w-full sm:w-auto">
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  )
}
