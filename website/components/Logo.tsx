import React from 'react'

interface LogoProps {
  size?: number
  textSize?: number
  dark?: boolean
}

export default function Logo({ size = 36, textSize = 22, dark = false }: LogoProps) {
  const textColor = dark ? '#FAF6F1' : '#2A1508'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <img src="/logo.svg" width={size} height={size} alt="INEE logo" style={{ display: 'block' }} />
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: textSize,
        fontWeight: 500,
        letterSpacing: '0.45em',
        color: textColor,
        lineHeight: 1,
      }}>
        IN<span style={{ color: '#C8803A' }}>E</span>E
      </span>
    </div>
  )
}

export function LogoInline({ size = 32, textSize = 20, dark = false }: LogoProps) {
  const textColor = dark ? '#FAF6F1' : '#2A1508'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="/logo.svg" width={size} height={size} alt="INEE logo" style={{ display: 'block' }} />
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: textSize,
        fontWeight: 500,
        letterSpacing: '0.45em',
        color: textColor,
        lineHeight: 1,
      }}>
        IN<span style={{ color: '#C8803A' }}>E</span>E
      </span>
    </div>
  )
}
