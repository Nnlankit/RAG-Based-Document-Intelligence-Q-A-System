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
        'warm-gradient': 'linear-gradient(135deg, #FFF9E8 0%, #FFFDF5 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #202124 0%, #17181A 100%)',
        'welcome-gradient': 'linear-gradient(135deg, #FFF9E8 0%, #FFF1CC 50%, #FFE89A 100%)',
        'accent-gradient': 'linear-gradient(135deg, #FFE89A 0%, #DDF2C1 100%)',
      },
      colors: {
        // Semantic CSS variables mapping
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        border: 'var(--border)',

        // Primary Brand Spec: Charcoal (#202124), Warm Light Yellow (#FFF9E8), Soft Green (#DDF2C1 / #4D9B45)
        charcoal: {
          50: '#F5F5F6',
          100: '#E6E7E8',
          200: '#C7C9CD',
          300: '#A4A7AD',
          400: '#757880',
          500: '#4D5057',
          600: '#3D4046',
          700: '#303238', // Secondary Charcoal
          800: '#26282B',
          900: '#202124', // Primary Deep Charcoal
          950: '#17181A',
        },
        'warm-yellow': {
          50: '#FFFDF5', // Pale Cream
          100: '#FFF9E8', // Main Background
          200: '#FFF1CC', // Warning Background / Light Highlight
          300: '#FFE89A', // Primary Accent (Soft Yellow)
          400: '#F5D670',
          500: '#E8BD42', // Golden Yellow (Charts & Badges)
          600: '#D99A24', // Warning Text
          700: '#B07B18',
          800: '#875C0F',
          900: '#5E3E08',
        },
        'soft-green': {
          50: '#F4FAEE',
          100: '#E5F4DC', // Success Background
          200: '#DDF2C1', // Secondary Accent (Light Green)
          300: '#C2E599',
          400: '#82C358',
          500: '#4D9B45', // Primary Green / Success
          600: '#3D8036',
          700: '#245B32', // Dark Green / Forest Green
          800: '#1B4526',
          900: '#122E1A',
        },
        beige: {
          50: '#FAF8F2',
          100: '#F3EFE4',
          200: '#E9E1CC', // Border
          300: '#D8CEA7',
          400: '#A99F87',
          500: '#77746B', // Secondary Text
          600: '#5F5C54',
          700: '#48453F',
          800: '#302E2A',
          900: '#181715',
        },
        sidebar: {
          DEFAULT: '#202124', // Deep Charcoal
          darker: '#17181A',
          card: '#2A2B2E',
          cardHover: '#33353A',
          hover: '#303238',
          border: '#303238',
          text: '#FFFFFF',
          muted: '#A4A7AD',
          active: '#FFE89A', // Light Yellow active indicator
          activeText: '#202124',
        },
        brand: {
          50: '#FFFDF5',
          100: '#FFF9E8',
          200: '#FFF1CC',
          300: '#FFE89A',
          400: '#F5D670',
          500: '#FFE89A',  // Primary Accent Soft Yellow
          600: '#4D9B45',  // Natural Green
          700: '#202124',  // Primary Charcoal
          800: '#303238',
          900: '#202124',
          950: '#17181A',
        },
        success: {
          DEFAULT: '#4D9B45',
          light: '#E5F4DC',
          dark: '#245B32',
        },
        warning: {
          DEFAULT: '#D99A24',
          light: '#FFF1CC',
          dark: '#B07B18',
        },
        danger: {
          DEFAULT: '#C94B4B',
          light: '#FCE8E8',
          dark: '#A63838',
        },
        info: {
          DEFAULT: '#536C88',
          light: '#EAF0F6',
          dark: '#384C62',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#202124',
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
        xs: '0 1px 2px rgba(32, 33, 36, 0.04)',
        sm: '0 1px 3px rgba(32, 33, 36, 0.06)',
        card: '0 2px 8px rgba(32, 33, 36, 0.04), 0 1px 2px rgba(32, 33, 36, 0.03)',
        'card-hover': '0 6px 16px rgba(32, 33, 36, 0.08), 0 2px 4px rgba(32, 33, 36, 0.04)',
        subtle: '0 4px 14px rgba(32, 33, 36, 0.08)',
        dropdown: '0 8px 24px rgba(32, 33, 36, 0.12)',
        // Backward compatibility mappings
        purple: '0 2px 8px rgba(32, 33, 36, 0.08)',
        'purple-lg': '0 8px 24px rgba(32, 33, 36, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
