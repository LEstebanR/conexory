import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Marquee from "@/components/marquee"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Stats from "@/components/stats"
import SignupCTA from "@/components/signup-cta"
import Footer from "@/components/footer"

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <Stats />
      <SignupCTA />
      <Footer />
    </main>
  )
}
