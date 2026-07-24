/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'review-dark': '#050816',
        'review-navy': '#0b0f21',
        'review-purple': '#9333ea',
      }
    },
  },
  plugins: [],
}
