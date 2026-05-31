import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Plus, Building2, LinkIcon, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours()
  const saludo =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"
  const firstName = name.split(" ")[0]
  return (
    <span>
      {saludo}, {firstName} 👋
    </span>
  )
}

const stats = [
  { label: "Propiedades activas", value: "0", icon: Building2, color: "text-brand-500", bg: "bg-brand-50" },
  { label: "Links generados", value: "0", icon: LinkIcon, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Veces compartida", value: "0", icon: Share2, color: "text-violet-500", bg: "bg-violet-50" },
]

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/login")

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-1">
            <Greeting name={session.user.name} />
          </h1>
          <p className="text-slate-500 text-sm">
            Administra y comparte tus propiedades desde un solo lugar.
          </p>
        </div>
        <Button size="lg" className="hidden sm:flex font-bold shadow-sm shadow-brand-400/20 flex-shrink-0" asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="w-4 h-4" />
            Nueva propiedad
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-950 tracking-tighter leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Properties section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-950 tracking-tight">
          Mis propiedades
        </h2>
        <Button size="sm" variant="ghost" className="text-brand-500 font-bold hover:text-brand-600 hover:bg-brand-50 sm:hidden" asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="w-4 h-4" />
            Nueva
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-3xl border border-slate-100 border-dashed flex flex-col items-center justify-center py-20 px-6 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-brand-50 border-2 border-brand-100 flex items-center justify-center">
            <Building2 className="w-9 h-9 text-brand-300" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-400 rounded-full flex items-center justify-center shadow-md">
            <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-950 tracking-tight mb-2">
          Todavía no tienes propiedades
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
          Crea tu primera propiedad, obtén tu link único y compártelo por
          WhatsApp en menos de 60 segundos.
        </p>

        <Button size="lg" className="font-bold shadow-sm shadow-brand-400/20" asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="w-4 h-4" />
            Crear primera propiedad
          </Link>
        </Button>

        <div className="flex items-center gap-6 mt-8">
          {[
            { icon: "📸", label: "Sube las fotos" },
            { icon: "💰", label: "Escribe el precio" },
            { icon: "🔗", label: "Obtén tu link" },
          ].map((step) => (
            <div key={step.label} className="flex flex-col items-center gap-1.5">
              <span className="text-2xl">{step.icon}</span>
              <span className="text-xs text-slate-400 font-medium">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// inline cn to avoid adding another import
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
