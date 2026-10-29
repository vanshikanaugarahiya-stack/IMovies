/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#0a0a0f',
          card: '#13131c',
          cardHover: '#1c1c2b',
          red: '#e50914',
          redHover: '#f40612',
          gold: '#f5c518',
          muted: '#8c8d99',
          border: 'rgba(255, 255, 255, 0.08)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Bebas Neue"', 'cursive', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
