import type { Metadata } from "next"
import { Building2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { prisma } from "@/lib/prisma"
import AgentProperties, { type AgentProperty } from "@/app/agente/[slug]/agent-properties"

export const metadata: Metadata = {
  title: "Propiedades — Conexory",
  description: "Explora todas las propiedades publicadas por agentes inmobiliarios en Conexory.",
}

// Safety net on top of the on-demand revalidatePath("/propiedades") calls in
// the property actions (create/update/delete/toggle publish/pin) — bounds
// staleness even if a future mutation path forgets to revalidate.
export const revalidate = 3600

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    where: { published: true },
    orderBy: [
      { pinnedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      price: true,
      city: true,
      state: true,
      neighborhood: true,
      images: true,
      area: true,
      bedrooms: true,
      bathrooms: true,
      parking: true,
      shares: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      pinnedAt: true,
    },
  })

  const items: AgentProperty[] = properties.map((p) => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.getTime(),
    pinnedAt: p.pinnedAt ? p.pinnedAt.getTime() : null,
  }))

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-4">
              Propiedades
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-ink tracking-tighter leading-none">
              Explora todas las propiedades.
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <span className="inline-flex w-12 h-12 rounded-2xl bg-canvas-soft items-center justify-center">
                <Building2 className="w-5 h-5 text-mute" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Todavía no hay propiedades publicadas</p>
                <p className="text-xs text-mute mt-0.5">Vuelve pronto — nuestros agentes están cargando sus fichas.</p>
              </div>
            </div>
          ) : (
            <AgentProperties properties={items} showHeader={false} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
