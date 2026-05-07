import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        trail: {
          50: '#f2f7f2',
          100: '#e0ece0',
          200: '#c2dac3',
          300: '#95bf97',
          400: '#629e65',
          500: '#3f7f43',
          600: '#2e6332',
          700: '#264f2a',
          800: '#213f24',
          900: '#1b341e',
        },
        earth: {
          50: '#fdf6ef',
          100: '#faebd7',
          200: '#f4d4ae',
          300: '#ecb67a',
          400: '#e29044',
          500: '#db7420',
          600: '#cc5f17',
          700: '#a94815',
          800: '#873b18',
          900: '#6d3116',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
