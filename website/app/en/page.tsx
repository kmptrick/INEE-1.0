'use client'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Skills from '@/components/Skills'
import Events from '@/components/Events'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ScrollParallax from '@/components/ScrollParallax'
import { en } from '@/lib/en'

export default function HomeEN() {
  return (
    <>
      <Nav content={en.nav} />
      <main>
        <Hero content={en.hero} />
        <ScrollParallax>
          <Services content={en.services} />
        </ScrollParallax>
        <ScrollParallax>
          <Skills content={en.skills} />
        </ScrollParallax>
        <ScrollParallax>
          <Events content={en.events} />
        </ScrollParallax>
        <ScrollParallax>
          <Contact content={en.contact} />
        </ScrollParallax>
      </main>
      <Footer content={en.footer} />
    </>
  )
}
