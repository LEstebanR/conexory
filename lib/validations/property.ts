import { z } from "zod"
import { PRO_PHOTO_LIMIT } from "@/lib/plans"
import { PROPERTY_TYPE_IDS, TRANSACTION_TYPE_IDS } from "@/lib/property-types"
import { isYoutubeUrl } from "@/lib/youtube"

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
  type: z.enum(PROPERTY_TYPE_IDS, {
    error: "Tipo de propiedad inválido",
  }),
  transactionType: z.enum(TRANSACTION_TYPE_IDS, {
    error: "Tipo de operación inválido",
  }),
  price: z
    .string()
    .regex(/^\d+$/, "El precio debe ser un número entero")
    .transform(Number)
    .refine((n) => n > 0, { message: "El precio debe ser mayor a 0" })
    .refine((n) => n <= 9_999_999_999_999, {
      message: "El precio es demasiado alto",
    }),
  state: optionalString(100),
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "La ciudad no puede superar 100 caracteres"),
  neighborhood: optionalString(100),
  area: optionalPositiveFloat,
  landArea: optionalPositiveFloat,
  bedrooms: optionalNonNegativeInt,
  bathrooms: optionalNonNegativeInt,
  parking: optionalNonNegativeInt,
  description: optionalString(1000),
  // Techo absoluto (plan Pro). El límite por plan (10 free / 20 pro) lo aplican las actions.
  images: z.array(z.string()).max(PRO_PHOTO_LIMIT, `Máximo ${PRO_PHOTO_LIMIT} fotos por propiedad`),
  videoUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || isYoutubeUrl(v), {
      message: "Pega un enlace válido de YouTube",
    })
    .transform((v) => (v === "" ? null : v)),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  showContact: z.boolean().optional().default(false),
  gatedCommunity: z.boolean().optional().default(false),
})

// type/transactionType accept any string in the input — Zod validates the enums server-side
export type PropertyInput = Omit<z.input<typeof PropertySchema>, "type" | "transactionType"> & {
  type: string
  transactionType: string
}
