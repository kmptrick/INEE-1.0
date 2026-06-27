'use client'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Skills from '@/components/Skills'
import Events from '@/components/Events'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ScrollParallax from '@/components/ScrollParallax'
import { fr } from '@/lib/fr'

export default function HomeFr() {
  return (
    <>
      <Nav content={fr.nav} />
      <main>
        <Hero content={fr.hero} />
        <ScrollParallax>
          <Services content={fr.services} />
        </ScrollParallax>
        <ScrollParallax>
          <Skills content={fr.skills} />
        </ScrollParallax>
        <ScrollParallax>
          <Events content={fr.events} />
        </ScrollParallax>
        <ScrollParallax>
          <Contact content={fr.contact} />
        </ScrollParallax>
      </main>
      <Footer content={fr.footer} />
    </>
  )
}
