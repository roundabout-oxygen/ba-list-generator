/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      colors: {
        ba: {
          sky: '#e8f5fe',
          light: '#f4faff',
          cyan: '#00a8ff',
          blue: '#1289f8',
          navy: '#1e3a5f',
          dark: '#0f2537',
          striker: '#ef4444',
          special: '#0284c7',
        },
        explosive: "#e53e3e",
        piercing: "#d69e2e",
        mystic: "#3182ce",
        sonic: "#805ad5",
        lightArmor: "#e53e3e",
        heavyArmor: "#d69e2e",
        specialArmor: "#3182ce",
        elasticArmor: "#805ad5",
      }
    },
  },
  plugins: [],
}
