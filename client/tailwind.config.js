// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Certifique-se de que o nome é 'primary' e não 'seduc-primary'
        primary: '#049605', 
        'primary-dark': '#037a04',
      },
    },
  },
  plugins: [],
}