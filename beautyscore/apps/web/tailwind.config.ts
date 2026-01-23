import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BeautyScore brand colors - aligned with globals.css
        primary: {
          50: '#E8F5EC',   // accent-green-light
          100: '#d1ebda',
          200: '#a3d7b5',
          300: '#75c390',
          400: '#47af6b',
          500: '#2D7A4F',  // accent-green (main brand color)
          600: '#246840',  // accent-green-dark
          700: '#1d5433',
          800: '#164026',
          900: '#0f2c19',
        },
        accent: {
          50: '#FDF8F4',   // accent-orange-light
          100: '#faeee3',
          200: '#f5ddc7',
          300: '#e6be9a',
          400: '#d79f6d',
          500: '#C4804D',  // accent-orange (main)
          600: '#a66a3f',
          700: '#885431',
          800: '#6a3e23',
          900: '#4c2815',
        },
        // Background colors from design system
        bg: {
          primary: '#FDFCFB',
          secondary: '#F7F5F3',
          tertiary: '#EDE9E4',
          dark: '#1A1714',
        },
        // Text colors from design system
        text: {
          primary: '#1A1714',
          secondary: '#6B6259',
          tertiary: '#8C8177',
          inverse: '#FDFCFB',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
