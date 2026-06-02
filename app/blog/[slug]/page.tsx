import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Building2, ArrowLeft, Clock, Tag } from "lucide-react"
import { getAllPosts, getPost } from "@/lib/blog"
import { marked } from "marked"

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: "Artículo no encontrado — MiAgente" }
  return {
    title: `${post.title} — MiAgente`,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      siteName: "MiAgente",
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const html = await marked(post.content)

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
          <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al blog
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center gap-3 mb-6 text-xs text-slate-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTime} min de lectura
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg text-slate-500 leading-relaxed mb-8 border-b border-slate-100 pb-8">
          {post.description}
        </p>

        <div
          className="prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-800 prose-li:text-slate-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-slate-700 prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:rounded-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-12 pt-8 border-t border-slate-100">
            {post.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
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
