"use client"

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
  // En el navegador usamos el origen actual para que el login funcione en
  // cualquier preview deploy de Vercel (URLs dinámicas). En SSR caemos al env.
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
