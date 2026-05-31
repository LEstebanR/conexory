import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Stats from "@/components/stats"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import PricingPreview from "@/components/pricing-preview"
import WaitlistCTA from "@/components/waitlist-cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <PricingPreview />
      <WaitlistCTA />
      <Footer />
    </main>
  )
}
