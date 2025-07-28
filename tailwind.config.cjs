// D:\expert-club-ai\expert-club-ai\tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
  'bg-main': '#23272b',        // Графитовый, чуть холоднее
  'bg-surface': '#31353b',     // Светло-графитовый, для карточек и блоков
  'accent-primary': '#42a5f5', // Мягкий синий, очень технологичный
  'accent-secondary': '#ddc705ff', // Пастельный фиолетовый
  'accent-success': '#5bac5fff', // Приглушённый зеленый
  'accent-danger': '#e57373',  // Спокойный красный (не кислотный)
  'text-main': '#e0e6ed',
  'text-secondary': '#8e99a7',
},
      fontFamily: {
      'pixel': ['var(--font-pixel)'], // Указываем новую переменную
      'sans': ['var(--font-inter)'],
    },
    },
  },
  plugins: [],
};