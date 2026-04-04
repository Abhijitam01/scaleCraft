export const colors = {
  bg: {
    app:    '#0a0a0a',
    panel:  '#111111',
    topbar: '#141414',
    node:   '#1c1c1c',
    card:   '#1a1a1a',
    inset:  '#161616',
  },
  border: {
    default: '#222222',
    card:    '#2a2a2a',
    node:    '#333333',
    panel:   '#1e1e1e',
    faint:   '#1a1a1a',
  },
  accent: {
    primary: '#10b981',
    hover:   '#34d399',
    soft:    'rgba(16,185,129,0.08)',
    glow:    'rgba(16,185,129,0.20)',
  },
  text: {
    primary:   '#ffffff',
    body:      '#cccccc',
    secondary: '#888888',
    muted:     '#555555',
    label:     '#3f3f3f',
  },
  semantic: {
    success:       '#22c55e',
    successBg:     'rgba(34,197,94,0.08)',
    successBorder: 'rgba(34,197,94,0.20)',
    error:         '#ef4444',
    errorBg:       'rgba(239,68,68,0.08)',
    errorBorder:   'rgba(239,68,68,0.20)',
  },
} as const
