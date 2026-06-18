"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Eye, EyeOff, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { togglePublished, deleteProperty } from "./actions"

export default function PropertyActions({
  propertyId,
  initialPublished,
}: {
  propertyId: string
  initialPublished: boolean
}) {
  const [published, setPublished] = useState(initialPublished)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    try {
      await togglePublished(propertyId, !published)
      setPublished((p) => !p)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta propiedad? Se borrarán también todas sus fotos. Esta acción no se puede deshacer.")) return
    setDeleting(true)
    try {
      await deleteProperty(propertyId)
      router.push("/dashboard")
    } catch {
      setDeleting(false)
      alert("Error al eliminar la propiedad. Intenta de nuevo.")
    }
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Link
        href={`/dashboard/properties/${propertyId}/edit`}
        className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white border border-hairline-strong text-body text-sm font-bold hover:bg-canvas-softer transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Editar</span>
      </Link>

      <button
        onClick={handleToggle}
        disabled={loading || deleting}
        className={cn(
          "flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-bold border transition-colors disabled:opacity-60",
          published
            ? "bg-warning-50 text-warning-700 border-warning-200 hover:bg-warning-100"
            : "bg-canvas-soft text-ink border-hairline hover:bg-surface-pressed"
        )}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : published ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{published ? "Desactivar" : "Activar"}</span>
      </button>

      <button
        onClick={handleDelete}
        disabled={loading || deleting}
        className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-60"
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">Eliminar</span>
      </button>
    </div>
  )
}
