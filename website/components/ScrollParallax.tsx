'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * Wraps a section so it gently scales/fades/shifts into view as it
 * crosses the viewport — gives the page a sense of depth while scrolling.
 */
export default function ScrollParallax({
  children,
  offset = 40,
}: {
  children: ReactNode
  offset?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [offset, 0, -offset])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.97, 1, 1, 0.97])

  return (
    <motion.div ref={ref} style={{ y, opacity, scale }}>
      {children}
    </motion.div>
  )
}
