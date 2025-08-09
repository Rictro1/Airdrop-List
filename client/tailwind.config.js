/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#0b0f14',
          800: '#0e141b',
          700: '#121a23'
        },
        accent: {
          500: '#6ae3ff',
          400: '#8cf0ff'
        }
      },
      boxShadow: {
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.6)'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
};


