import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Stats from "@/components/stats"
import HowItWorks from "@/components/how-it-works"
import Features from "@/components/features"
import PropertyPreview from "@/components/property-preview"
import SignupCTA from "@/components/signup-cta"
import Footer from "@/components/footer"

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <PropertyPreview />
      <SignupCTA />
      <Footer />
    </main>
  )
}
