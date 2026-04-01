import type { Config } from 'tailwindcss'
import { colors } from './src/styles/tokens'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background
        'bg-canvas': colors.bg.canvas,
        'bg-panel': colors.bg.panel,
        'bg-topbar': colors.bg.topbar,
        'bg-card': colors.bg.card,
        'bg-card-alt': colors.bg.cardAlt,
        // Border
        'border-panel': colors.border.panel,
        'border-card': colors.border.card,
        'border-input': colors.border.input,
        'border-subtle': colors.border.subtle,
        // Accent
        'accent-primary': colors.accent.primary,
        'accent-hover': colors.accent.primaryHover,
        'accent-bg': colors.accent.primaryBg,
        'accent-border': colors.accent.primaryBorder,
        // Semantic
        'success': colors.semantic.success,
        'success-bg': colors.semantic.successBg,
        'danger': colors.semantic.danger,
        'danger-bg': colors.semantic.dangerBg,
        'warning': colors.semantic.warning,
        // Text
        'text-primary': colors.text.primary,
        'text-body': colors.text.body,
        'text-secondary': colors.text.secondary,
        'text-muted': colors.text.muted,
        'text-label': colors.text.label,
      },
    },
  },
  plugins: [],
}

export default config
