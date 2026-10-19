/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexo: {
          ink: "#18372d",
          forest: "#145c43",
          leaf: "#2a8c5b",
          lime: "#d9ed8a",
          paper: "#f5f7f1",
          gold: "#e6b94f",
        },
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}

