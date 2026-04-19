/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aranya (Forest) Theme for Light Mode
        primary: '#2e4c37',
        'primary-light': '#e8f5e9',

        // Backgrounds
        surface: '#ffffff',
        'surface-alt': '#f9fafb',
        'surface-dark': '#1c1917',
        'surface-dark-alt': '#292524',

        // Text & Icons
        main: '#111827',
        muted: '#6b7280',
        'main-dark': '#f5f5f4',
        'muted-dark': '#a8a29e',

        // Borders
        line: '#e5e7eb',
        'line-dark': '#44403c',

        // Feedback/Status
        danger: '#ef4444',
        'danger-light': '#fef2f2',
        'danger-dark': '#991b1b',
      },
      fontFamily: {
        sinhala: ['sinhala', 'sans-serif'],
        styled: ['styled', 'serif'],
      }
    },
  },
  plugins: [],
}
