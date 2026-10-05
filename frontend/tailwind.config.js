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
        'sand-gradient': 'linear-gradient(135deg, #E8DCC8 0%, #F2E9D8 45%, #DCC9AA 100%)',
        'sand-dark-gradient': 'linear-gradient(135deg, #1C1713 0%, #211B16 45%, #2B231D 100%)',
        'upload-gradient': 'linear-gradient(135deg, #F7F0E3 0%, #E8DCC8 100%)',
        'upload-dark-gradient': 'linear-gradient(135deg, #2B231D 0%, #211B16 100%)',
        'hero-gradient': 'linear-gradient(135deg, #4A3827 0%, #5A4634 50%, #3D2D1E 100%)',
        'hero-dark-gradient': 'linear-gradient(135deg, #2D2218 0%, #3D2E21 50%, #231B13 100%)',
      },
      colors: {
        // Semantic CSS variables mapping
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        border: 'var(--border)',

        // Exact Sand Palette from Spec
        sand: {
          50: '#F7F0E3',   // Surface / Card
          100: '#F2E9D8',  // Secondary background
          200: '#E8DCC8',  // Primary background
          250: '#E2D3BB',  // Sidebar background
          300: '#D4C3A5',  // Border
          350: '#CDBB9D',  // Secondary border
          400: '#CDB795',  // Active navigation / Citation hover
          450: '#D8C6A7',  // User message bubble
          500: '#9A8B78',  // Muted
          600: '#786B5C',  // Secondary text
          700: '#8B6F52',  // Secondary brown / icon
          800: '#5A4634',  // Primary brown
          850: '#463526',  // Primary hover
          900: '#30261E',  // Primary text
          950: '#211B16',  // Dark mode background
        },
        // Primary Sandstone Brand (Dark Brown Primary #5A4634, Terracotta Accent #B87952)
        brand: {
          50: '#F7F0E3',
          100: '#F2E9D8',
          200: '#E8DCC8',
          300: '#CDB795',
          400: '#B87952',  // Accent terracotta
          500: '#8B6F52',  // Secondary camel
          600: '#5A4634',  // Primary button & headers
          700: '#463526',  // Hover
          800: '#3D2D1E',
          900: '#30261E',  // Primary text
          950: '#211B16',  // Dark mode canvas
        },
        // Gray alias mapped to high-contrast sand values so standard utility classes remain legible
        gray: {
          50: '#F7F0E3',   // Surface / Card
          100: '#F2E9D8',  // Secondary bg
          200: '#E8DCC8',  // Canvas
          300: '#D4C3A5',  // Border
          400: '#6B5C4D',  // Readable muted text & icons (contrast >4.5:1)
          500: '#5A4634',  // Primary secondary brown text
          600: '#463526',  // Dark tone
          700: '#3D2D1E',  // Deep tone
          800: '#2A2017',  // Charcoal tone
          900: '#1E1712',  // Primary dark text
          950: '#140E0A',  // Darkest background
        },
        // Accent terracotta
        terracotta: {
          DEFAULT: '#B87952',
          hover: '#A26844',
          light: '#D99873',
          dark: '#915331',
        },
        // Muted Sage Success
        sage: {
          DEFAULT: '#657A58',
          light: '#EAF0E6',
          dark: '#4A5B40',
        },
        // Warm Amber Warning
        amber: {
          DEFAULT: '#B38A4A',
          light: '#FAF2E4',
          dark: '#8C672B',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Manrope',
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
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(90, 70, 52, 0.05)',
        'card': '0 4px 20px rgba(90, 70, 52, 0.08)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'elevated': '0 10px 30px -5px rgba(90, 70, 52, 0.12)',
        'modal': '0 20px 60px rgba(90, 70, 52, 0.18)',
      },
    },
  },
  plugins: [],
}
