module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        brand: {
          orange: '#FFA726',
          violet: '#7C4DFF',
          teal: '#26A69A',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 