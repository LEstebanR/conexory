"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 cursor-pointer select-none rounded-full",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-white hover:bg-elevated active:scale-[0.98]",
        secondary:
          "bg-white text-ink border border-hairline-strong hover:bg-canvas-soft active:scale-[0.98]",
        subtle:
          "bg-canvas-soft text-ink border border-hairline hover:bg-surface-pressed active:scale-[0.98]",
        outline:
          "border border-hairline-strong bg-white text-ink hover:bg-canvas-soft",
        ghost: "text-body hover:bg-canvas-soft hover:text-ink",
        link: "text-ink underline underline-offset-4 hover:opacity-70 p-0 h-auto rounded-none",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
        "destructive-soft":
          "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-[0.98]",
        warning:
          "bg-warning-50 text-warning-700 border border-warning-200 hover:bg-warning-100 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-base",
        icon: "h-10 w-10",
        chip: "h-9 px-3 text-sm font-bold gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
