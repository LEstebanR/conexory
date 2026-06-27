import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = {
  n: number
  label: string
  href: string | null
}

export default function OnboardingStepper({
  step,
  firstPropertyId,
}: {
  step: number
  firstPropertyId: string | null
}) {
  const steps: Step[] = [
    { n: 1, label: "Crear mi primera propiedad", href: "/dashboard/properties/new?tour=1" },
    {
      n: 2,
      label: "Compartir mi primera propiedad",
      href: firstPropertyId ? `/dashboard/properties/${firstPropertyId}` : null,
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-center text-xs font-bold text-ink uppercase tracking-wide">
        Primeros pasos
      </h2>
      <ol className="flex items-start">
      {steps.map((s, i) => {
        const isDone = step > s.n
        const isCurrent = step === s.n
        const isLocked = step < s.n || !s.href
        const isInteractive = isCurrent && !!s.href
        const connectorFilled = step >= s.n

        const node = (
          <>
            {i > 0 && (
              <span
                className={cn(
                  "absolute top-[19px] left-[-50%] right-1/2 h-0.5 rounded-full transition-colors",
                  connectorFilled ? "bg-ink" : "bg-hairline-strong",
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 inline-flex w-10 h-10 rounded-full items-center justify-center text-sm font-bold transition-colors",
                isDone || isCurrent
                  ? "bg-ink text-white"
                  : "bg-canvas border border-hairline-strong text-mute",
              )}
            >
              {isDone ? <Check className="w-4 h-4" strokeWidth={2.5} /> : s.n}
            </span>

            <span
              className={cn(
                "relative z-10 mt-2 text-xs sm:text-sm font-semibold leading-tight text-center text-balance px-1 transition-colors",
                isCurrent && "text-ink",
                isDone && "text-body",
                isLocked && "text-mute",
              )}
            >
              {s.label}
            </span>
          </>
        )

        return (
          <li key={s.n} className="relative flex-1 flex flex-col items-center">
            {!isInteractive ? (
              <div className="flex flex-col items-center w-full cursor-default">{node}</div>
            ) : (
              <Link
                href={s.href!}
                className="group flex flex-col items-center w-full focus-visible:outline-none"
              >
                {node}
              </Link>
            )}
          </li>
        )
      })}
      </ol>
    </div>
  )
}
