export const colors = {
  bg: {
    canvas: '#0a0a0a',
    panel: '#111',
    topbar: '#141414',
    card: '#1a1a1a',
    cardAlt: '#1c1c1c',
  },
  border: {
    panel: '#222',
    card: '#333',
    input: '#2a2a2a',
    subtle: '#1e1e1e',
  },
  accent: {
    primary: '#6366f1',
    primaryHover: '#818cf8',
    primaryBg: '#1e1e2e',
    primaryBorder: '#3b3b6e',
  },
  semantic: {
    success: '#4ade80',
    successBg: '#1a2a1a',
    successBorder: '#2d4a2d',
    danger: '#ef4444',
    dangerBg: '#2a1a1a',
    dangerBorder: '#4a2d2d',
    warning: '#fbbf24',
  },
  text: {
    primary: '#fff',
    body: '#ccc',
    secondary: '#888',
    muted: '#555',
    label: '#444',
  },
} as const

export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '600ms',
    intro: '2000ms',
    ahaMoment: '1000ms',
  },
  easing: {
    default: 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

// Use as inline style value on elements needing focus rings
// e.g. style={{ outline: focusRing }} — not a Tailwind class
export const focusRing = `2px solid ${colors.accent.primary}`
export const focusRingOffset = '2px'
