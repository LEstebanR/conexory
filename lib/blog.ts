import fs from "fs"
import path from "path"
import matter from "gray-matter"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: number
}

export type Post = PostMeta & {
  content: string
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "")
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8")
      const { data, content } = matter(raw)
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        description: data.description ?? "",
        tags: data.tags ?? [],
        readingTime: estimateReadingTime(content),
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const all = getAllPosts()
  const current = all.find((p) => p.slug === slug)
  if (!current) return []

  const others = all.filter((p) => p.slug !== slug)
  const scored = others
    .map((p) => ({
      post: p,
      shared: p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.shared - a.shared)

  const related = scored.filter((s) => s.shared > 0).map((s) => s.post)
  if (related.length >= limit) return related.slice(0, limit)

  const fill = others.filter((p) => !related.includes(p))
  return [...related, ...fill].slice(0, limit)
}

export function getPost(slug: string): Post | null {
  const filepath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filepath)) return null

  const raw = fs.readFileSync(filepath, "utf-8")
  const { data, content } = matter(raw)

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    description: data.description ?? "",
    tags: data.tags ?? [],
    readingTime: estimateReadingTime(content),
    content,
  }
}
