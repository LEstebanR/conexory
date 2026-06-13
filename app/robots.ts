import type { MetadataRoute } from "next"
import { getAppUrl } from "@/lib/urls"

const BASE_URL = getAppUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/", "/login", "/register"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
