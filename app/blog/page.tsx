import type { Metadata } from "next"
import Link from "next/link"
import { Clock, Tag, ArrowUpRight } from "lucide-react"
import { getAllPosts } from "@/lib/blog"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Reveal from "@/components/reveal"

export const metadata: Metadata = {
  title: "Blog — Conexory",
  description: "Consejos, guías y estrategias para asesores inmobiliarios en Colombia. Aprende a compartir propiedades por WhatsApp, mejorar tus fichas y cerrar más negocios.",
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
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-10 lg:pt-40 lg:pb-14 text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-5 animate-fade-up">
            Blog
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black text-ink tracking-tighter leading-[1.05] animate-fade-up text-balance"
            style={{ animationDelay: "80ms" }}
          >
            Consejos para
            <br />
            <span className="text-mute">asesores inmobiliarios.</span>
          </h1>
          <p
            className="text-lg text-body leading-relaxed mt-6 max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Guías prácticas para compartir propiedades, mejorar tus fichas y cerrar más negocios en Colombia.
          </p>
        </div>
      </section>

      <section className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <p className="text-mute text-center py-20">No hay artículos todavía.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 60}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block p-6 sm:p-7 rounded-2xl border border-hairline hover:border-ink transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3 text-xs text-mute">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} min de lectura
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-black text-ink tracking-tight leading-snug mb-2">
                      {post.title}
                    </h2>
                    <ArrowUpRight className="w-5 h-5 text-mute group-hover:text-ink transition-colors flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-body leading-relaxed mb-4">{post.description}</p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-canvas-soft text-body px-2.5 py-1 rounded-full">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
