/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#000000',
          charcoal: '#1C1C1C',
          forest: '#2F332E',
          sage: '#76886C',
          cream: '#F1EFEA',
          'sage-light': '#EDF0EB',
          'sage-mid': '#C8D4C4',
          border: '#E2E4E0',
        }
      }
    },
  },
  plugins: [],
}
