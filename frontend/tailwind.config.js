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
          DEFAULT: '#ee9624',
          50: '#fff8ed',
          100: '#ffefd3',
          200: '#ffdca5',
          300: '#ffc26d',
          400: '#fe9d32',
          500: '#ee9624',
          600: '#df7510',
          700: '#b95510',
          800: '#934215',
          900: '#783815',
        },
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#252525',
          600: '#333333',
          500: '#444444',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
