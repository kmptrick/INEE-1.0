'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  value: number
  suffix?: string
  duration?: number
}

export default function CountUp({ value, suffix = '', duration = 2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return

    const startTime = performance.now()
    const totalMs = duration * 1000

    const easeOutExpo = (t: number) => 1 - Math.pow(2, -10 * t)

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / totalMs, 1)
      const eased = easeOutExpo(progress)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [inView, value, duration])

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  )
}
