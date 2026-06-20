"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Eye, EyeOff, Loader2, Trash2, UserCheck, UserX, AlertTriangle } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { togglePublished, toggleShowContact, deleteProperty } from "./actions"

export default function PropertyActions({
  propertyId,
  initialPublished,
  initialShowContact,
}: {
  propertyId: string
  initialPublished: boolean
  initialShowContact: boolean
}) {
  const [published, setPublished] = useState(initialPublished)
  const [showContact, setShowContact] = useState(initialShowContact)
  const [loading, setLoading] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
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

  async function handleToggleContact() {
    setContactLoading(true)
    try {
      await toggleShowContact(propertyId, !showContact)
      setShowContact((c) => !c)
      router.refresh()
    } finally {
      setContactLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setConfirmOpen(false)
    try {
      await deleteProperty(propertyId)
      router.push("/dashboard")
    } catch {
      setDeleting(false)
      toast.error("No se pudo eliminar la propiedad. Intenta de nuevo.")
    }
  }

  const busy = loading || contactLoading || deleting

  return (
    <>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/dashboard/properties/${propertyId}/edit`}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white border border-hairline-strong text-body text-sm font-bold hover:bg-canvas-softer transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editar</span>
        </Link>

        <button
          onClick={handleToggleContact}
          disabled={busy}
          title={showContact ? "Ocultar datos de contacto en el link público" : "Mostrar datos de contacto en el link público"}
          className={cn(
            "flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-bold border transition-colors disabled:opacity-60",
            showContact
              ? "bg-ink text-white border-ink hover:bg-elevated"
              : "bg-white text-body border-hairline-strong hover:bg-canvas-softer"
          )}
        >
          {contactLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : showContact ? (
            <UserCheck className="w-3.5 h-3.5" />
          ) : (
            <UserX className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{showContact ? "Contacto visible" : "Sin contacto"}</span>
        </button>

        <button
          onClick={handleToggle}
          disabled={busy}
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
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
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

      {/* Delete confirmation modal */}
      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl shadow-black/10 p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={2} />
              </div>
              <div>
                <Dialog.Title className="text-base font-black text-ink tracking-tight">
                  ¿Eliminar esta propiedad?
                </Dialog.Title>
                <Dialog.Description className="text-sm text-body mt-1.5 leading-relaxed">
                  Se borrarán también todas las fotos. Esta acción no se puede deshacer.
                </Dialog.Description>
              </div>
              <div className="flex gap-2 w-full pt-1">
                <Dialog.Close asChild>
                  <button className="flex-1 h-10 rounded-full border border-hairline-strong text-sm font-semibold text-ink hover:bg-canvas-soft transition-colors">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDelete}
                  className="flex-1 h-10 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
