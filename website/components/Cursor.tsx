'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Sophisticated dual-element cursor:
 * - Small 8px dot that follows the mouse instantly
 * - 40px ring that follows with spring lag (stiffness:120, damping:18)
 * - Ring morphs to elongated rectangle on [data-cursor] / a / button hover
 * - Ring hides on inputs / textareas
 * - mix-blend-mode: multiply on ring for color blending
 * - Hidden on coarse-pointer (mobile/touch) devices
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [hoverState, setHoverState] = useState<'default' | 'link' | 'input'>('default')

  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)

  const ringX = useSpring(dotX, { stiffness: 120, damping: 18 })
  const ringY = useSpring(dotY, { stiffness: 120, damping: 18 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)

    const move = (e: MouseEvent) => {
      dotX.set(e.clientX)
      dotY.set(e.clientY)

      const el = e.target as HTMLElement | null
      if (el?.closest('input, textarea, select')) {
        setHoverState('input')
      } else if (el?.closest('a, button, [data-cursor]')) {
        setHoverState('link')
      } else {
        setHoverState('default')
      }
    }

    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [dotX, dotY])

  if (!enabled) return null

  const ringAnimate = {
    default: {
      width: 40,
      height: 40,
      borderRadius: 20,
      background: 'rgba(200,128,58,0)',
      opacity: 1,
      marginLeft: -20,
      marginTop: -20,
    },
    link: {
      width: 80,
      height: 24,
      borderRadius: 4,
      background: 'rgba(200,128,58,0.15)',
      opacity: 1,
      marginLeft: -40,
      marginTop: -12,
    },
    input: {
      width: 40,
      height: 40,
      borderRadius: 20,
      background: 'rgba(200,128,58,0)',
      opacity: 0,
      marginLeft: -20,
      marginTop: -20,
    },
  }

  return (
    <>
      {/* Precise dot — instant tracking */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          borderRadius: '50%',
          background: 'var(--copper)',
          pointerEvents: 'none',
          zIndex: 10001,
        }}
      />

      {/* Lagging ring */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          border: '1.5px solid var(--copper)',
          pointerEvents: 'none',
          zIndex: 10000,
          mixBlendMode: 'multiply',
        }}
        animate={ringAnimate[hoverState]}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
    </>
  )
}
