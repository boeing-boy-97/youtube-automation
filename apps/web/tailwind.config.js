/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Studio Palette
        canvas: {
          DEFAULT: '#FAF6EE',
          subtle: '#F4EEE2',
          muted: '#ECE4D4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F8F5EE',
          active: '#F0EAD8',
        },
        ink: {
          DEFAULT: '#25211F',
          pure: '#171413',
          subtle: '#3A3431',
          surface: '#2E2927',
          border: 'rgba(37, 33, 31, 0.12)',
        },
        vermilion: {
          DEFAULT: '#EC5A3A',
          hover: '#DB4B2B',
          active: '#C73F20',
          soft: 'rgba(236, 90, 58, 0.12)',
          border: 'rgba(236, 90, 58, 0.35)',
          contrast: '#FFFFFF',
        },
        marigold: {
          DEFAULT: '#F0CF73',
          hover: '#E4BF5A',
          soft: 'rgba(240, 207, 115, 0.18)',
          contrast: '#25211F',
        },
        moss: {
          DEFAULT: '#789181',
          dark: '#587362',
          light: '#96AB9E',
          soft: 'rgba(120, 145, 129, 0.15)',
        },
        stone: {
          DEFAULT: '#706B64',
          muted: '#8C867D',
          subtle: '#A8A298',
          border: '#E5DDD1',
        },
        border: {
          DEFAULT: '#E5DDD1',
          strong: '#D4C9BC',
          focus: '#EC5A3A',
        },
        text: {
          primary: '#25211F',
          secondary: '#706B64',
          muted: '#8C867D',
          inverse: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#EC5A3A',
          hover: '#DB4B2B',
          soft: 'rgba(236, 90, 58, 0.12)',
          contrast: '#FFFFFF',
        },
        success: {
          DEFAULT: '#2E7654',
          soft: 'rgba(46, 118, 84, 0.12)',
        },
        warning: {
          DEFAULT: '#D9822B',
          soft: 'rgba(217, 130, 43, 0.12)',
        },
        danger: {
          DEFAULT: '#B93832',
          soft: 'rgba(185, 56, 50, 0.12)',
        },
        error: {
          DEFAULT: '#B93832',
          soft: 'rgba(185, 56, 50, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['2.75rem', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
        'page-title': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'section-title': ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'card-title': ['1.0625rem', { lineHeight: '1.35', fontWeight: '600' }],
        body: ['0.9375rem', { lineHeight: '1.55', fontWeight: '400' }],
        caption: ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        metadata: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(37, 33, 31, 0.04)',
        'sm': '0 1px 3px 0 rgba(37, 33, 31, 0.06), 0 1px 2px -1px rgba(37, 33, 31, 0.04)',
        DEFAULT: '0 2px 6px 0 rgba(37, 33, 31, 0.06), 0 1px 3px -1px rgba(37, 33, 31, 0.04)',
        'md': '0 4px 12px -2px rgba(37, 33, 31, 0.08), 0 2px 6px -2px rgba(37, 33, 31, 0.04)',
        'lg': '0 12px 24px -4px rgba(37, 33, 31, 0.08), 0 4px 12px -2px rgba(37, 33, 31, 0.04)',
        'xl': '0 20px 40px -6px rgba(37, 33, 31, 0.1), 0 8px 16px -4px rgba(37, 33, 31, 0.04)',
      },
    },
  },
  plugins: [],
}
