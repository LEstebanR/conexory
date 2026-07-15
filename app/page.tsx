import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getAppUrl } from "@/lib/urls"
import { faqs } from "@/lib/faq-data"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Marquee from "@/components/marquee"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Stats from "@/components/stats"
import FAQ from "@/components/faq"
import PricingTeaser from "@/components/pricing-teaser"
import SignupCTA from "@/components/signup-cta"
import Footer from "@/components/footer"

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/dashboard")

  const appUrl = getAppUrl()

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Conexory",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Herramienta para asesores inmobiliarios en Colombia. Crea fichas de propiedades y compártelas por WhatsApp en menos de 60 segundos.",
    url: appUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "COP",
      name: "Plan Gratuito",
    },
    featureList: [
      "Fichas de propiedad con link único",
      "Preview enriquecida al compartir por WhatsApp",
      "Perfil público del agente",
      "Subida de fotos desde el celular",
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <Stats />
      <FAQ />
      <PricingTeaser />
      <SignupCTA />
      <Footer />
    </main>
  )
}
