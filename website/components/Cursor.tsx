'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [hoverState, setHoverState] = useState<'default' | 'link' | 'input'>('default')

  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)

  const ringX = useSpring(dotX, { stiffness: 150, damping: 20 })
  const ringY = useSpring(dotY, { stiffness: 150, damping: 20 })

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
      width: 36,
      height: 36,
      borderRadius: 18,
      opacity: 1,
      marginLeft: -18,
      marginTop: -18,
      scale: 1,
    },
    link: {
      width: 56,
      height: 56,
      borderRadius: 28,
      opacity: 0.85,
      marginLeft: -28,
      marginTop: -28,
      scale: 1,
    },
    input: {
      width: 36,
      height: 36,
      borderRadius: 18,
      opacity: 0,
      marginLeft: -18,
      marginTop: -18,
      scale: 0.5,
    },
  }

  return (
    <>
      {/* Dot central — suit instantanément */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          borderRadius: '50%',
          background: 'var(--copper)',
          pointerEvents: 'none',
          zIndex: 10001,
          boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
        }}
      />

      {/* Ring externe — suit avec lag */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          border: '2px solid var(--copper)',
          background: 'rgba(200,128,58,0.08)',
          pointerEvents: 'none',
          zIndex: 10000,
          boxShadow: '0 0 12px rgba(200,128,58,0.25)',
        }}
        animate={ringAnimate[hoverState]}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
    </>
  )
}
