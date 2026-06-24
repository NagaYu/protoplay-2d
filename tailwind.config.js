/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0b0e16',
          raised: '#121724',
          border: '#1f2738',
        },
        accent: {
          DEFAULT: '#5b8cff',
          soft: '#8aa9ff',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -6px rgba(91, 140, 255, 0.45)',
      },
    },
  },
  plugins: [],
};
