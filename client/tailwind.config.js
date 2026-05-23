/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#0A0A0F',
        'surface': '#121215',
        'surface-glass': 'rgba(10, 10, 15, 0.6)',
        'hyper-magenta': '#EA00F2',
        'electric-cyan': '#00E6F2',
        'mist-blue': '#A7C7E7',
        'muted-salmon': '#E9967A',
        'parchment': '#F2E6CE',
        'border-dark': '#1E1E24',
      },
      fontFamily: {
        'display': ['Anton', 'Impact', 'sans-serif'],
        'ui': ['Manrope', 'Nunito', 'sans-serif'],
        'editorial': ['Cabinet Grotesk', 'Inter', 'sans-serif'],
        'data': ['JetBrains Mono', 'Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}