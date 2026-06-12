import { z } from "zod"

const optionalString = (maxLength: number) =>
  z.string().max(maxLength).transform((v) => v.trim() || null)

const optionalNonNegativeInt = z
  .string()
  .refine((v) => v === "" || /^\d+$/.test(v), {
    message: "Debe ser un número entero no negativo",
  })
  .transform((v) => (v === "" ? null : parseInt(v, 10)))

const optionalPositiveFloat = z
  .string()
  .refine((v) => v === "" || /^\d+(\.\d+)?$/.test(v), {
    message: "Debe ser un número positivo",
  })
  .transform((v) => (v === "" ? null : parseFloat(v)))
  .refine((n) => n === null || n > 0, {
    message: "Debe ser un número positivo",
  })

export const PropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(120, "El título no puede superar 120 caracteres"),
  type: z.enum(["apartment", "house", "office", "commercial", "lot", "warehouse"], {
    error: "Tipo de propiedad inválido",
  }),
  price: z
    .string()
    .regex(/^\d+$/, "El precio debe ser un número entero")
    .transform(Number)
    .refine((n) => n > 0, { message: "El precio debe ser mayor a 0" })
    .refine((n) => n <= 9_999_999_999_999, {
      message: "El precio es demasiado alto",
    }),
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "La ciudad no puede superar 100 caracteres"),
  neighborhood: optionalString(100),
  area: optionalPositiveFloat,
  bedrooms: optionalNonNegativeInt,
  bathrooms: optionalNonNegativeInt,
  parking: optionalNonNegativeInt,
  description: optionalString(1000),
  images: z.array(z.string()).max(10, "Máximo 10 fotos por propiedad"),
})

// type field accepts any string — Zod validates the enum server-side
export type PropertyInput = Omit<z.input<typeof PropertySchema>, "type"> & { type: string }
