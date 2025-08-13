/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        figma: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d4ff',
          300: '#a3b8ff',
          400: '#7b91ff',
          500: '#5b6bff',
          600: '#4a4bff',
          700: '#3f3fe8',
          800: '#3535c4',
          900: '#2f2f9e',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
