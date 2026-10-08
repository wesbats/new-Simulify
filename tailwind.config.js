/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgb(var(--primary-rgb, 79 70 229) / 0.08)',
          100: 'rgb(var(--primary-rgb, 79 70 229) / 0.15)',
          200: 'rgb(var(--primary-rgb, 79 70 229) / 0.25)',
          300: 'rgb(var(--primary-rgb, 79 70 229) / 0.40)',
          400: 'rgb(var(--primary-rgb, 79 70 229) / 0.65)',
          500: 'var(--primary, #6366F1)',
          600: 'var(--primary, #4F46E5)',
          700: 'var(--primary-hover, #4338CA)',
          800: 'rgb(var(--primary-rgb, 79 70 229) / 0.85)',
          900: 'rgb(var(--primary-rgb, 79 70 229) / 0.95)',
          950: 'rgb(var(--primary-rgb, 79 70 229) / 0.12)',
        },
        accent: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        dark: {
          base: '#0B0F19',
          card: '#111827',
          surface: '#1E293B',
          border: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        reading: ['Inter', 'sans-serif'],
        print: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        glow: '0 0 25px -5px rgba(var(--primary-rgb, 79 70 229), 0.35)',
      }
    },
  },
  plugins: [],
}
