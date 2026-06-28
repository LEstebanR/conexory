import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre completo es obligatorio."),
    email: z.email("Ingresa un correo electrónico válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    terms: z.literal("on", { message: "Debes aceptar los términos para continuar." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido."),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  confirmPassword: z.string().min(1, "Confirma tu contraseña."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
})

export type LoginErrors = Partial<Record<"email" | "password", string>>
export type RegisterErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword" | "terms", string>>
export type ForgotPasswordErrors = Partial<Record<"email", string>>
export type ResetPasswordErrors = Partial<Record<"password" | "confirmPassword", string>>
