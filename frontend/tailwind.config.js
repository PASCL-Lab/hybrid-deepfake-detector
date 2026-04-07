/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Model accent colors
        sbi: {
          DEFAULT: '#E65100',
          light: '#FFF3E0',
        },
        distildire: {
          DEFAULT: '#6A1B9A',
          light: '#F3E5F5',
        },
        gpt: {
          DEFAULT: '#00695C',
          light: '#E0F2F1',
        },
        // Verdict colors
        fake: {
          DEFAULT: '#E53935',
          light: '#FFEBEE',
          dark: '#B71C1C',
        },
        real: {
          DEFAULT: '#43A047',
          light: '#E8F5E9',
          dark: '#1B5E20',
        },
      },
    },
  },
  plugins: [],
}
