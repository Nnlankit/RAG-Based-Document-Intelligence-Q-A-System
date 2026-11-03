/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #5920B5 0%, #8B5CF6 100%)',
        'soft-purple-gradient': 'linear-gradient(135deg, #F8F6FC 0%, #F1ECFA 50%, #EAE2F8 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #FAF8FD 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #211A35 0%, #1A142B 100%)',
        'hero-gradient': 'linear-gradient(135deg, #5920B5 0%, #7C3AED 50%, #8B5CF6 100%)',
        'upload-gradient': 'linear-gradient(135deg, #FAF8FD 0%, #F3EEFB 100%)',
      },
      colors: {
        // Semantic CSS variables mapping
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        border: 'var(--border)',

        // Primary Brand Spec: Deep Purple (#5920B5) and Violet (#8B5CF6)
        brand: {
          50: '#F8F6FC',
          100: '#F0EBFA',
          200: '#E8E1F2',
          300: '#D5C7EA',
          400: '#B297DD',
          500: '#8B5CF6',  // Secondary Violet
          600: '#7337DA',
          700: '#5920B5',  // Primary Deep Purple
          800: '#461793',
          900: '#17152B',  // Primary Dark Navy Text
          950: '#211A35',  // Sidebar Dark Navy Purple
        },
        sidebar: {
          DEFAULT: '#211A35',
          darker: '#1A142B',
          card: '#2A2242',
          cardHover: '#332950',
          hover: '#2E2449',
          border: '#362C54',
          text: '#E2DCF0',
          muted: '#8E85A6',
          active: '#5920B5',
        },
        navy: {
          900: '#17152B',
          800: '#211A35',
          700: '#2E2449',
          600: '#3F355F',
        },
        muted: {
          DEFAULT: '#77738A',
          light: '#A39EB5',
          dark: '#58546B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1C162E',
        },
        lavender: {
          50: '#FAF8FD',
          100: '#F8F6FC',
          200: '#E8E1F2',
          300: '#DACFEA',
          400: '#C2B2DD',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark: '#15803D',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(23, 21, 43, 0.05)',
        sm: '0 1px 3px rgba(23, 21, 43, 0.08)',
        card: '0 4px 20px rgba(89, 32, 181, 0.04), 0 1px 3px rgba(23, 21, 43, 0.05)',
        'card-hover': '0 8px 30px rgba(89, 32, 181, 0.08), 0 2px 6px rgba(23, 21, 43, 0.06)',
        purple: '0 4px 20px rgba(89, 32, 181, 0.25)',
        'purple-lg': '0 8px 30px rgba(89, 32, 181, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
