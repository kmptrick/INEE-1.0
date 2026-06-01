'use client'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Skills from '@/components/Skills'
import Events from '@/components/Events'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { fr } from '@/lib/fr'

export default function HomeFr() {
  return (
    <>
      <Nav content={fr.nav} />
      <main>
        <Hero content={fr.hero} />
        <Services content={fr.services} />
        <Skills content={fr.skills} />
        <Events content={fr.events} />
        <Contact content={fr.contact} />
      </main>
      <Footer content={fr.footer} />
    </>
  )
}
