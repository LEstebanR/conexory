"use client"

import { ErrorFallback, type ErrorBoundaryProps } from "@/components/error-fallback"

export default function RootError(props: ErrorBoundaryProps) {
  return <ErrorFallback {...props} boundary="root" className="min-h-screen" />
}
