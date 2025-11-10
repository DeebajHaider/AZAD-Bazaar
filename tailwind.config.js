/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class', // enable class-based dark mode: use `dark:` utilities when <html> has .dark class
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          DEFAULT: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          DEFAULT: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b'
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0b1220'
        }
      },
      boxShadow: {
        'nav-sm': '0 -1px 6px rgba(0,0,0,0.06)'
      }
    }
  },
  plugins: []
}
