import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Stats from "@/components/stats"
import HowItWorks from "@/components/how-it-works"
import Features from "@/components/features"
import PropertyPreview from "@/components/property-preview"
import SignupCTA from "@/components/signup-cta"
import Footer from "@/components/footer"

export default function Home() {
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
