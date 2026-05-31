import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-brand-50 text-brand-700 border border-brand-200",
        success:
          "bg-green-50 text-green-700 border border-green-200",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
        error: "bg-red-50 text-red-700 border border-red-200",
        neutral:
          "bg-slate-100 text-slate-600 border border-slate-200",
        blue: "bg-blue-50 text-blue-700 border border-blue-200",
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
