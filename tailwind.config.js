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
        'rosegold': {
          50: '#FDFBF9',
          100: '#FBF5EE',
          200: '#F5E6D5',
          300: '#EECDAB',
          400: '#E0A96D', // Brand primary rose gold
          500: '#D2924F',
          600: '#B87431',
          700: '#945823',
        },
        'blush': {
          50: '#FDF9FB',
          100: '#F8E8EE', // Soft blush pink
          200: '#F2D3DF',
          300: '#E7B5C7',
          400: '#D78DA6',
          500: '#C76A88',
        },
        'lavender': {
          50: '#F7F6FE',
          100: '#EEEAFD',
          200: '#DDD5FC',
          300: '#C1B2F9',
          400: '#9E85F4',
          500: '#6C5CE7', // Lavender purple
          600: '#5A45DE',
          700: '#4833CB',
        },
        'pearl': '#FFFFFF',
        'slate-dark': '#0B1120',
        'navy-card': '#1E293B',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-rosegold': '0 0 25px -5px rgba(224, 169, 109, 0.35)',
        'glow-lavender': '0 0 25px -5px rgba(108, 92, 231, 0.35)',
        'glow-blush': '0 0 25px -5px rgba(248, 232, 238, 0.45)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
