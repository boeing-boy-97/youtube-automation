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
        // Proposed Color System (Dribbble & Creative Direction)
        canvas: {
          DEFAULT: '#FAF7F0',
          subtle: '#F2EEE5',
          muted: '#EAE4D8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F8F5EE',
          active: '#EFEAE0',
          dark: '#1D211E',
        },
        ink: {
          DEFAULT: '#222520',
          pure: '#141713',
          subtle: '#393E37',
          surface: '#2C312A',
          border: 'rgba(34, 37, 32, 0.12)',
        },
        // Brand Coral
        coral: {
          DEFAULT: '#E96D50',
          hover: '#DA5C3E',
          active: '#C74A2D',
          soft: 'rgba(233, 109, 80, 0.12)',
          border: 'rgba(233, 109, 80, 0.35)',
          contrast: '#FFFFFF',
        },
        vermilion: {
          DEFAULT: '#E96D50',
          hover: '#DA5C3E',
          active: '#C74A2D',
          soft: 'rgba(233, 109, 80, 0.12)',
          border: 'rgba(233, 109, 80, 0.35)',
          contrast: '#FFFFFF',
        },
        // Deep Green
        green: {
          DEFAULT: '#376B53',
          dark: '#27523F',
          light: '#4C856A',
          soft: 'rgba(55, 107, 83, 0.14)',
        },
        moss: {
          DEFAULT: '#376B53',
          dark: '#27523F',
          light: '#4C856A',
          soft: 'rgba(55, 107, 83, 0.14)',
        },
        // Soft Mint
        mint: {
          DEFAULT: '#D8EDE0',
          light: '#EAF7EF',
          dark: '#B0DBC0',
          soft: 'rgba(216, 237, 224, 0.4)',
        },
        // Warm Yellow
        yellow: {
          DEFAULT: '#F2D78B',
          hover: '#E5C775',
          soft: 'rgba(242, 215, 139, 0.22)',
          contrast: '#222520',
        },
        marigold: {
          DEFAULT: '#F2D78B',
          hover: '#E5C775',
          soft: 'rgba(242, 215, 139, 0.22)',
          contrast: '#222520',
        },
        butter: {
          DEFAULT: '#F2D78B',
          hover: '#E5C775',
          soft: 'rgba(242, 215, 139, 0.22)',
          contrast: '#222520',
        },
        // Secondary Text
        secondary: {
          DEFAULT: '#70746D',
          muted: '#8B8F88',
          subtle: '#A6AAA2',
        },
        stone: {
          DEFAULT: '#70746D',
          muted: '#8B8F88',
          subtle: '#A6AAA2',
          border: '#E5E1D7',
        },
        muted: {
          DEFAULT: '#70746D',
          muted: '#8B8F88',
          subtle: '#A6AAA2',
          border: '#E5E1D7',
        },
        // Border
        border: {
          DEFAULT: '#E5E1D7',
          strong: '#D5D0C4',
          focus: '#E96D50',
        },
        'dark-surface': {
          DEFAULT: '#1D211E',
          hover: '#262B27',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        text: {
          primary: '#222520',
          secondary: '#70746D',
          muted: '#8B8F88',
          inverse: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#E96D50',
          hover: '#DA5C3E',
          soft: 'rgba(233, 109, 80, 0.12)',
          contrast: '#FFFFFF',
        },
        success: {
          DEFAULT: '#376B53',
          soft: 'rgba(55, 107, 83, 0.14)',
        },
        warning: {
          DEFAULT: '#D9822B',
          soft: 'rgba(217, 130, 43, 0.14)',
        },
        danger: {
          DEFAULT: '#B93832',
          soft: 'rgba(185, 56, 50, 0.14)',
        },
        error: {
          DEFAULT: '#B93832',
          soft: 'rgba(185, 56, 50, 0.14)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['2.85rem', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
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
        'xs': '0 1px 2px 0 rgba(34, 37, 32, 0.04)',
        'sm': '0 1px 3px 0 rgba(34, 37, 32, 0.06), 0 1px 2px -1px rgba(34, 37, 32, 0.04)',
        DEFAULT: '0 2px 6px 0 rgba(34, 37, 32, 0.06), 0 1px 3px -1px rgba(34, 37, 32, 0.04)',
        'md': '0 4px 14px -2px rgba(34, 37, 32, 0.08), 0 2px 6px -2px rgba(34, 37, 32, 0.04)',
        'lg': '0 12px 28px -4px rgba(34, 37, 32, 0.08), 0 4px 12px -2px rgba(34, 37, 32, 0.04)',
        'xl': '0 24px 48px -8px rgba(34, 37, 32, 0.12), 0 8px 16px -4px rgba(34, 37, 32, 0.04)',
      },
    },
  },
  plugins: [],
}
