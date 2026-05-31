import React from 'react'

interface LogoProps {
  size?: number
  textSize?: number
  dark?: boolean
}

export default function Logo({ size = 36, textSize = 22, dark = false }: LogoProps) {
  const textColor = dark ? '#FAF6F1' : '#2A1508'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
      <img src="/logo.svg" width={size} height={size} alt="INEE logo" style={{ display: 'block', margin: '0 auto' }} />
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: textSize,
        fontWeight: 500,
        letterSpacing: '0.5em',
        paddingLeft: '0.5em', /* compense le letter-spacing du dernier char */
        color: textColor,
        lineHeight: 1,
        display: 'block',
        textAlign: 'center',
      }}>
        IN<span style={{ color: '#C8803A' }}>E</span>E
      </span>
    </div>
  )
}

export function LogoInline({ size = 32, textSize = 20, dark = false }: LogoProps) {
  const textColor = dark ? '#FAF6F1' : '#2A1508'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img src="/logo.svg" width={size} height={size} alt="INEE logo" style={{ display: 'block', flexShrink: 0 }} />
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: textSize,
        fontWeight: 500,
        letterSpacing: '0.45em',
        paddingLeft: '0.45em',
        color: textColor,
        lineHeight: 1,
      }}>
        IN<span style={{ color: '#C8803A' }}>E</span>E
      </span>
    </div>
  )
}
