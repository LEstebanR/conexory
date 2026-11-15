"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Check, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { setFeedbackResolved } from "../actions"

export default function ResolveToggle({
  feedbackId,
  resolved,
  className,
}: {
  feedbackId: string
  resolved: boolean
  className?: string
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await setFeedbackResolved(feedbackId, !resolved)
      if (!result.success) toast.error(result.error)
    })
  }

  const Icon = pending ? Loader2 : resolved ? RotateCcw : Check

  return (
    <Button
      type="button"
      size="sm"
      variant={resolved ? "outline" : "default"}
      onClick={handleClick}
      disabled={pending}
      className={cn("h-11 sm:h-9", className)}
    >
      <Icon className={cn("w-3.5 h-3.5", pending && "animate-spin")} strokeWidth={2} />
      {resolved ? "Marcar pendiente" : "Marcar resuelto"}
    </Button>
  )
}
