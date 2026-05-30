'use client'

import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const transition = (delay: number) => ({
  duration: 0.8,
  ease: [0.4, 0, 0.2, 1] as number[],
  delay,
})


function DoubleDiamond() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      {/* Outer diamond */}
      <rect
        x="4"
        y="4"
        width="72"
        height="72"
        rx="2"
        transform="rotate(45 40 40)"
        stroke="var(--copper)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Inner diamond */}
      <rect
        x="14"
        y="14"
        width="52"
        height="52"
        rx="1"
        transform="rotate(45 40 40)"
        stroke="var(--copper)"
        strokeWidth="0.8"
        strokeOpacity="0.5"
        fill="none"
      />
    </svg>
  )
}

export default function Hero() {
  return (
    <section
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #FAF6F1 0%, #F0E8DC 60%, #E8D8C4 100%)',
        paddingTop: 72, // nav height offset
      }}
    >
      {/* Decorative: large hollow diamond top-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 80,
          right: -60,
          width: 200,
          height: 200,
          border: '1px solid rgba(200,128,58,0.15)',
          transform: 'rotate(45deg)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative: small filled copper diamond top-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 140,
          right: 80,
          width: 12,
          height: 12,
          background: 'rgba(200,128,58,0.4)',
          transform: 'rotate(45deg)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative: vertical copper line left */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: '30%',
          width: 1,
          height: '40%',
          background: 'rgba(200,128,58,0.2)',
          pointerEvents: 'none',
        }}
      />

      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60fr 40fr',
            gap: 64,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* LEFT COLUMN */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: {} }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {/* Section label */}
            <motion.div variants={fadeUp} transition={transition(0)}>
              <span className="section-label">Vous créez. On structure. C&apos;est notre expertise.</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={fadeUp}
              transition={transition(0.12)}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(48px, 7vw, 88px)',
                fontWeight: 300,
                lineHeight: 1.0,
                letterSpacing: '-2px',
                color: 'var(--text-dark)',
                margin: 0,
              }}
            >
              Votre partenaire de
              <br />
              services aux entreprises
              <br />
              au Luxembourg et
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--copper)' }}>les trois frontières</em>
            </motion.h1>

            {/* Copper line */}
            <motion.span
              variants={fadeUp}
              transition={transition(0.24)}
              className="copper-line"
            />

            {/* Paragraph */}
            <motion.p
              variants={fadeUp}
              transition={transition(0.36)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 17,
                color: 'var(--text-medium)',
                maxWidth: 480,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              INEE accompagne les entrepreneurs et PME du Luxembourg dans leur
              gestion comptable, fiscale et juridique. Une expertise locale, un
              service sur mesure.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              transition={transition(0.48)}
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 36,
                flexWrap: 'wrap',
              }}
            >
              <a href="#contact" className="btn-primary">
                Prendre rendez-vous
              </a>
              <a href="#services" className="btn-secondary">
                Nos services →
              </a>
            </motion.div>

          </motion.div>

          {/* RIGHT COLUMN — decorative credential card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            className="hero-card"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: 48,
              boxShadow: 'var(--shadow-medium)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* Double diamond logo */}
            <DoubleDiamond />

            {/* INEE wordmark */}
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 400,
                letterSpacing: 8,
                color: 'var(--copper)',
                textAlign: 'center',
              }}
            >
              INEE
            </span>

            {/* Separator */}
            <div
              style={{
                width: '100%',
                height: 1,
                background: 'rgba(200,128,58,0.3)',
              }}
            />

            {/* Credential list */}
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                width: '100%',
              }}
            >
              {[
                'Services aux entreprises',
                'Grande Région & Luxembourg',
                'Conseil & Accompagnement',
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'var(--text-medium)',
                  }}
                >
                  {/* Diamond bullet */}
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      background: 'var(--copper)',
                      transform: 'rotate(45deg)',
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>

            {/* Card background tint */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: '#FAF6F1',
                borderRadius: 4,
                opacity: 0.04,
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .hero-card {
            max-width: 380px;
            margin: 0 auto;
            width: 100%;
          }
        }
        @media (max-width: 600px) {
          .hero-grid {
            padding: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}
