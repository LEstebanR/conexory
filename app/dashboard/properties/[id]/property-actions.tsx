"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Eye, EyeOff, Loader2, Trash2, UserCheck, UserX, Pin, PinOff, AlertTriangle } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { togglePublished, toggleShowContact, togglePinned, deleteProperty } from "./actions"

export default function PropertyActions({
  propertyId,
  initialPublished,
  initialShowContact,
  initialPinned,
  disableActivateReason,
  disablePinReason,
}: {
  propertyId: string
  initialPublished: boolean
  initialShowContact: boolean
  initialPinned: boolean
  disableActivateReason?: string
  disablePinReason?: string
}) {
  const [published, setPublished] = useState(initialPublished)
  const [showContact, setShowContact] = useState(initialShowContact)
  const [pinned, setPinned] = useState(initialPinned)
  const [loading, setLoading] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    try {
      const result = await togglePublished(propertyId, !published)
      if (!result.success) {
        toast.error(result.error)
        return
      }
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

  async function handleTogglePin() {
    setPinLoading(true)
    try {
      const result = await togglePinned(propertyId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setPinned((p) => !p)
      router.refresh()
    } finally {
      setPinLoading(false)
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

  const busy = loading || contactLoading || pinLoading || deleting

  return (
    <>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="secondary" size="chip" asChild>
          <Link href={`/dashboard/properties/${propertyId}/edit`}>
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </Link>
        </Button>

        <div className="relative group flex-shrink-0">
          <Button
            onClick={handleTogglePin}
            disabled={busy || (!pinned && !!disablePinReason)}
            variant={pinned ? "default" : "secondary"}
            size="chip"
          >
            {pinLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : pinned ? (
              <Pin className="w-3.5 h-3.5" />
            ) : (
              <PinOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{pinned ? "Fijada" : "Fijar"}</span>
          </Button>
          {!pinned && disablePinReason && (
            <div className="pointer-events-none absolute top-full right-0 mt-2 w-56 px-3 py-2 bg-ink text-white text-xs font-medium leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
              <div className="absolute bottom-full right-2.5 border-[4px] border-transparent border-b-ink" />
              {disablePinReason}
            </div>
          )}
        </div>

        <Button
          onClick={handleToggleContact}
          disabled={busy}
          title={showContact ? "Ocultar datos de contacto en el link público" : "Mostrar datos de contacto en el link público"}
          variant={showContact ? "default" : "secondary"}
          size="chip"
        >
          {contactLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : showContact ? (
            <UserCheck className="w-3.5 h-3.5" />
          ) : (
            <UserX className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{showContact ? "Contacto visible" : "Sin contacto"}</span>
        </Button>

        <div className="relative group flex-shrink-0">
          <Button
            onClick={handleToggle}
            disabled={busy || (!published && !!disableActivateReason)}
            variant={published ? "warning" : "subtle"}
            size="chip"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : published ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{published ? "Desactivar" : "Activar"}</span>
          </Button>
          {!published && disableActivateReason && (
            <div className="pointer-events-none absolute top-full right-0 mt-2 w-56 px-3 py-2 bg-ink text-white text-xs font-medium leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
              <div className="absolute bottom-full right-2.5 border-[4px] border-transparent border-b-ink" />
              {disableActivateReason}
            </div>
          )}
        </div>

        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
          variant="destructive-soft"
          size="chip"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Eliminar</span>
        </Button>
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
                  <Button variant="secondary" className="flex-1">
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
