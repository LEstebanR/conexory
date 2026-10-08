import type { Metadata } from "next"

type PageMeta = {
  title: string
  description: string
  path: string
  absoluteTitle?: boolean
  type?: "website" | "article"
  noindex?: boolean
}

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
  noindex = false,
}: PageMeta): Metadata {
  const documentTitle = absoluteTitle ? { absolute: title } : title
  const socialTitle = absoluteTitle ? title : `${title} — Conexory`
  const image = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Conexory",
  }
  return {
    title: documentTitle,
    description,
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    ...(noindex ? {} : { alternates: { canonical: path } }),
    openGraph: {
      title: { absolute: socialTitle },
      description,
      url: path,
      locale: "es_CO",
      siteName: "Conexory",
      type,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: { absolute: socialTitle },
      description,
      images: [image],
    },
  }
}
