/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EF4637",
        secondary: "#FDEDEB",
        white: "#FFFFFF",
        black: "#000000",
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
