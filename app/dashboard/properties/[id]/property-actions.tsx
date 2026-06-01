"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { togglePublished } from "./actions"

export default function PropertyActions({
  propertyId,
  initialPublished,
}: {
  propertyId: string
  initialPublished: boolean
}) {
  const [published, setPublished] = useState(initialPublished)
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Link
        href={`/dashboard/properties/${propertyId}/edit`}
        className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Editar
      </Link>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-bold border transition-colors disabled:opacity-60",
          published
            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            : "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100"
        )}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : published ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        {published ? "Desactivar" : "Activar"}
      </button>
    </div>
  )
}
