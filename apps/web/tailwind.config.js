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
        // Core Studio Palette (Reference B & Elite Specification)
        canvas: {
          DEFAULT: '#F7F8F4',
          subtle: '#EEF0EB',
          muted: '#E4E7DF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F4F6F1',
          active: '#EAECE6',
          dark: '#171C19',
        },
        ink: {
          DEFAULT: '#202522',
          pure: '#111413',
          subtle: '#363D39',
          surface: '#292F2B',
          border: 'rgba(32, 37, 34, 0.12)',
        },
        // Brand Primary: Coral / Vermilion
        coral: {
          DEFAULT: '#F27660',
          hover: '#E5624B',
          active: '#D44E36',
          soft: 'rgba(242, 118, 96, 0.12)',
          border: 'rgba(242, 118, 96, 0.35)',
          contrast: '#FFFFFF',
        },
        vermilion: {
          DEFAULT: '#F27660',
          hover: '#E5624B',
          active: '#D44E36',
          soft: 'rgba(242, 118, 96, 0.12)',
          border: 'rgba(242, 118, 96, 0.35)',
          contrast: '#FFFFFF',
        },
        // Soft Visual Emphasis: Mint
        mint: {
          DEFAULT: '#CDEBDD',
          light: '#E2F4EB',
          dark: '#93CFB4',
          soft: 'rgba(205, 235, 221, 0.35)',
        },
        // Secondary Brand Accent: Forest Green / Moss
        green: {
          DEFAULT: '#32755B',
          dark: '#245944',
          light: '#4B9475',
          soft: 'rgba(50, 117, 91, 0.14)',
        },
        moss: {
          DEFAULT: '#32755B',
          dark: '#245944',
          light: '#4B9475',
          soft: 'rgba(50, 117, 91, 0.14)',
        },
        // Supporting Accent: Butter / Marigold
        butter: {
          DEFAULT: '#F0D783',
          hover: '#E6C96C',
          soft: 'rgba(240, 215, 131, 0.22)',
          contrast: '#202522',
        },
        marigold: {
          DEFAULT: '#F0D783',
          hover: '#E6C96C',
          soft: 'rgba(240, 215, 131, 0.22)',
          contrast: '#202522',
        },
        // Neutral Muted Text: Muted / Stone
        muted: {
          DEFAULT: '#737B75',
          muted: '#8E9690',
          subtle: '#A8B0AA',
          border: '#E3E7E0',
        },
        stone: {
          DEFAULT: '#737B75',
          muted: '#8E9690',
          subtle: '#A8B0AA',
          border: '#E3E7E0',
        },
        border: {
          DEFAULT: '#E3E7E0',
          strong: '#D1D7CD',
          focus: '#F27660',
        },
        'dark-surface': {
          DEFAULT: '#171C19',
          hover: '#1F2522',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        text: {
          primary: '#202522',
          secondary: '#737B75',
          muted: '#8E9690',
          inverse: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F27660',
          hover: '#E5624B',
          soft: 'rgba(242, 118, 96, 0.12)',
          contrast: '#FFFFFF',
        },
        success: {
          DEFAULT: '#32755B',
          soft: 'rgba(50, 117, 91, 0.14)',
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
        'xs': '0 1px 2px 0 rgba(32, 37, 34, 0.04)',
        'sm': '0 1px 3px 0 rgba(32, 37, 34, 0.06), 0 1px 2px -1px rgba(32, 37, 34, 0.04)',
        DEFAULT: '0 2px 6px 0 rgba(32, 37, 34, 0.06), 0 1px 3px -1px rgba(32, 37, 34, 0.04)',
        'md': '0 4px 14px -2px rgba(32, 37, 34, 0.08), 0 2px 6px -2px rgba(32, 37, 34, 0.04)',
        'lg': '0 12px 28px -4px rgba(32, 37, 34, 0.08), 0 4px 12px -2px rgba(32, 37, 34, 0.04)',
        'xl': '0 24px 48px -8px rgba(32, 37, 34, 0.12), 0 8px 16px -4px rgba(32, 37, 34, 0.04)',
      },
    },
  },
  plugins: [],
}
