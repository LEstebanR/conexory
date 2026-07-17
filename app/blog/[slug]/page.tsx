import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, Tag } from "lucide-react"
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/blog"
import { getAppUrl } from "@/lib/urls"
import { Button } from "@/components/ui/button"
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
  if (!post) return { title: "Artículo no encontrado — Conexory" }
  return {
    title: `${post.title} — Conexory`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      siteName: "Conexory",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
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
  const related = getRelatedPosts(slug)
  const appUrl = getAppUrl()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Conexory",
      url: appUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Conexory",
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/mark-white.png`,
      },
    },
    image: `${appUrl}/blog/${slug}/opengraph-image`,
    mainEntityOfPage: `${appUrl}/blog/${slug}`,
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
              <Image src="/mark-white.png" alt="Conexory" width={18} height={18} className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-black text-ink tracking-tight">Conexory</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-ink transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al blog
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center gap-3 mb-6 text-xs text-mute">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTime} min de lectura
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg text-body leading-relaxed mb-12 border-b border-hairline pb-8">
          {post.description}
        </p>

        <div
          className={[
            "prose prose-slate max-w-none",
            // headings
            "prose-headings:font-black prose-headings:tracking-tight",
            "prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-5",
            "prose-h3:text-lg prose-h3:mt-10 prose-h3:mb-3",
            // paragraphs
            "prose-p:text-[16px] prose-p:leading-[1.85] prose-p:text-body prose-p:mb-6",
            // lead paragraph
            "[&>p:first-child]:text-[17px] [&>p:first-child]:text-ink [&>p:first-child]:font-medium [&>p:first-child]:leading-[1.9]",
            // lists
            "prose-li:text-body prose-li:leading-relaxed prose-li:mb-1",
            "prose-ul:my-6 prose-ol:my-6",
            // inline
            "prose-strong:text-ink prose-strong:font-bold",
            // blockquote
            "prose-blockquote:border-l-4 prose-blockquote:border-ink",
            "prose-blockquote:bg-canvas-softer prose-blockquote:rounded-r-xl",
            "prose-blockquote:px-5 prose-blockquote:py-3",
            "prose-blockquote:not-italic prose-blockquote:text-body prose-blockquote:font-medium",
            // dividers
            "prose-hr:border-hairline prose-hr:my-10",
            // code
            "prose-code:bg-canvas-soft prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-ink",
            "prose-pre:bg-canvas-softer prose-pre:border prose-pre:border-hairline-strong prose-pre:rounded-xl",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-12 rounded-2xl bg-ink p-8 text-center">
          <h2 className="text-2xl font-black text-white tracking-tight">
            ¿Listo para compartir tus propiedades profesionalmente?
          </h2>
          <p className="text-mute mt-2 mb-6">Crea tu cuenta gratis en Conexory.</p>
          <Button variant="secondary" asChild>
            <Link href="/register">Crear cuenta gratis</Link>
          </Button>
        </div>

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-hairline">
            <h2 className="text-sm font-black text-ink uppercase tracking-[0.15em] mb-5">
              También te puede interesar
            </h2>
            <div className="space-y-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block p-5 rounded-2xl border border-hairline hover:border-ink transition-colors"
                >
                  <h3 className="text-base font-black text-ink tracking-tight leading-snug mb-1">{p.title}</h3>
                  <p className="text-sm text-body leading-relaxed line-clamp-2">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-12 pt-8 border-t border-hairline">
            {post.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-canvas-soft text-body px-2.5 py-1 rounded-full">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-hairline py-8 text-center">
        <p className="text-xs text-mute">© 2026 Conexory · Hecho en Colombia</p>
      </footer>
    </div>
  )
}
