'use client'

import { useRef, ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  distance?: number
  duration?: number
  threshold?: number
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 48,
  duration = 0.8,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: threshold })

  const getInitial = () => {
    switch (direction) {
      case 'up':    return { opacity: 0, y: distance,  x: 0 }
      case 'left':  return { opacity: 0, x: -distance, y: 0 }
      case 'right': return { opacity: 0, x: distance,  y: 0 }
      case 'none':  return { opacity: 0, x: 0,         y: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={getInitial()}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : getInitial()}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
