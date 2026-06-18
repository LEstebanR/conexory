import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-canvas-soft text-ink",
        solid: "bg-ink text-white",
        success: "bg-green-50 text-green-700 border border-green-200",
        warning:
          "bg-warning-50 text-warning-700 border border-warning-200",
        error: "bg-red-50 text-red-700 border border-red-200",
        neutral: "bg-canvas-soft text-body",
        blue: "bg-canvas-soft text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
