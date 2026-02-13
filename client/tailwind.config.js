/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#049605',
          dark: '#037a04',
          light: '#e6f4e6',
        }
      },
    },
  },
  plugins: [],
}