import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#1C1C1C',
        'bg-surface': '#2A2A2A',
        'bg-elevated': '#383838',
        'accent-primary': '#D4C8B5',
        'accent-secondary': '#6E85B7',
        'accent-success': '#5A8B73',
        'accent-warning': '#E0A83F',
        'accent-danger':  '#B85C5C',
        'accent-ink': '#6E85B7',
        'accent-maroon': '#8B5E83',
        'text-main': '#E0E2E5',
        'text-secondary': '#A0A0A0',
        'text-muted': '#6C6C6C',
        'text-on-accent': '#1C1C1C',
        'border-main': '#383838',
        'border-active': '#D4C8B5',
      },
      fontFamily: {
        'pixel': ['var(--font-pixel)'],
        'sans': ['var(--font-inter)'],
        'mono': ['var(--font-jetbrains-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;