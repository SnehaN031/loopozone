/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8ec5aa',
          DEFAULT: '#6FA98D',
          dark: '#588b72',
        },
        darkText: '#243B53',
        lightBg: '#F5F7F6',
        borderBg: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
