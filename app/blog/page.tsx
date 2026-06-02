import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ArrowLeft, Clock, Tag } from "lucide-react"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog — MiAgente",
  description: "Consejos, guías y estrategias para agentes inmobiliarios en Colombia. Aprende a compartir propiedades por WhatsApp, mejorar tus fichas y cerrar más negocios.",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-black text-slate-950 tracking-tight">MiAgente</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="bg-slate-950 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">Blog</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Consejos para agentes inmobiliarios
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Guías prácticas para compartir propiedades, mejorar tus fichas y cerrar más negocios en Colombia.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        {posts.length === 0 ? (
          <p className="text-slate-400 text-center py-20">No hay artículos todavía.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <article key={post.slug} className="py-8 first:pt-0 group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} min de lectura
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-950 tracking-tight leading-snug mb-2 group-hover:text-brand-500 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{post.description}</p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 py-8 text-center">
        <p className="text-xs text-slate-400">© 2026 MiAgente · Hecho con 🇨🇴 en Colombia</p>
      </footer>
    </div>
  )
}
