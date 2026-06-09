'use client'

import { useEffect, useRef } from 'react'

interface P {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hue: number
  base: number
}

/**
 * Cinematic animated field for the hero — particles drift along a soft
 * flow field, glow in copper/amber tones, connect into a living
 * constellation, and scatter away from the cursor.
 *
 * A full static frame is painted immediately on mount, so the field is
 * always visible even if requestAnimationFrame is throttled (e.g. the
 * tab is in the background) — motion is a progressive enhancement.
 */
export default function ImmersiveBackground() {
  const ref = useRef<HTMLCanvasElement>(null)
  const raf = useRef(0)
  const mouse = useRef({ x: -9999, y: -9999, active: false })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: P[] = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const init = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(170, Math.floor((w * h) / 8200))
      particles = Array.from({ length: count }, () => {
        const r = 0.8 + Math.random() * 2.6
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r,
          hue: 26 + Math.random() * 18,
          base: 0.4 + Math.random() * 0.5,
        }
      })
    }

    const flow = (x: number, y: number, t: number) => {
      const a =
        Math.sin(x * 0.0016 + t * 0.0002) +
        Math.cos(y * 0.0018 - t * 0.00025) +
        Math.sin((x + y) * 0.0011 + t * 0.0003)
      return a * Math.PI
    }

    const CONNECT = 150

    const render = (t: number, animate: boolean) => {
      ctx.clearRect(0, 0, w, h)

      // Constellation lines
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < CONNECT * CONNECT) {
            const d = Math.sqrt(d2)
            const alpha = (1 - d / CONNECT) * 0.22
            ctx.strokeStyle = `rgba(214,150,82,${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Glowing particles
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        if (animate && !reduced) {
          const ang = flow(p.x, p.y, t)
          p.vx += Math.cos(ang) * 0.02
          p.vy += Math.sin(ang) * 0.02

          if (mouse.current.active) {
            const dx = p.x - mouse.current.x
            const dy = p.y - mouse.current.y
            const d2 = dx * dx + dy * dy
            const R = 160
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1
              const f = (1 - d / R) * 2.4
              p.vx += (dx / d) * f
              p.vy += (dy / d) * f
            }
          }

          p.vx *= 0.95
          p.vy *= 0.95
          p.x += p.vx
          p.y += p.vy

          if (p.x < -20) p.x = w + 20
          else if (p.x > w + 20) p.x = -20
          if (p.y < -20) p.y = h + 20
          else if (p.y > h + 20) p.y = -20
        }

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7)
        glow.addColorStop(0, `hsla(${p.hue}, 80%, 64%, ${p.base})`)
        glow.addColorStop(1, `hsla(${p.hue}, 80%, 64%, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 7, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `hsla(${p.hue}, 92%, 82%, ${Math.min(1, p.base + 0.3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (t: number) => {
      render(t, true)
      raf.current = requestAnimationFrame(loop)
    }

    init()
    render(0, false) // immediate static frame — always visible
    raf.current = requestAnimationFrame(loop)

    const onResize = () => {
      init()
      render(0, false)
    }
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const y = e.clientY - rect.top
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = y
      mouse.current.active = y >= 0 && y <= h
    }
    const onLeave = () => {
      mouse.current.active = false
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}
