/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        algae: {
          dark: '#1d3531',
          soft: '#7ba696',
          seafoam: '#a7d7c5',
          sand: '#f4f2ee',
        }
      }
    },
  },
  plugins: [],
}