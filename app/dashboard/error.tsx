"use client"

import { ErrorFallback, type ErrorBoundaryProps } from "@/components/error-fallback"

export default function DashboardError(props: ErrorBoundaryProps) {
  return <ErrorFallback {...props} boundary="dashboard" className="flex-1" />
}
