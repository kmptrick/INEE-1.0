'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: 1,
        margin: '-1px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Horizontal line */}
      <motion.div
        initial={{ width: '0%' }}
        animate={inView ? { width: '100%' } : { width: '0%' }}
        transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 1,
          background: 'linear-gradient(to right, transparent, var(--copper), transparent)',
        }}
      />
      {/* Center diamond */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.4, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <svg
          width={10}
          height={10}
          viewBox="0 0 10 10"
          style={{ display: 'block', transform: 'rotate(45deg)' }}
        >
          <rect x={0} y={0} width={10} height={10} fill="var(--copper)" />
        </svg>
      </motion.div>
    </div>
  )
}
