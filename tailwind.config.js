/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        '#080812',
        surface:   '#0f0f23',
        raised:    '#161630',
        ink:       '#f8fafc',
        secondary: '#94a3b8',
        muted:     '#475569',
        dim:       '#1e293b',
        rule:      'rgba(255,255,255,0.08)',
        purple:    '#a855f7',
        pink:      '#ec4899',
        cyan:      '#06b6d4',
        emerald:   '#10b981',
        amber:     '#f59e0b',
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        'section': '120px',
        'section-mobile': '80px',
      },
    },
  },
  plugins: [],
}
