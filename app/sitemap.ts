import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog"
import { prisma } from "@/lib/prisma"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://inmobiliaria-link-app.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE_URL}/precios`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/roadmap`, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE_URL}/contacto`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/cookies`, priority: 0.3, changeFrequency: "yearly" },
  ]

  const blogPosts = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }))

  const properties = await prisma.property.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${BASE_URL}/p/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.6,
    changeFrequency: "weekly" as const,
  }))

  return [...staticRoutes, ...blogPosts, ...propertyRoutes]
}
