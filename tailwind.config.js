/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#e8c547',
        'accent-dark': '#c9a73a',
        primary: '#1a1f2e',
        surface: '#14171f',
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui'],
        mono: ['DM Mono', 'ui-monospace'],
      },
    },
  },
  plugins: [],
}
