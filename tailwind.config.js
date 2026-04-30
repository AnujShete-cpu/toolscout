/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        body: ['Epilogue', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        black: '#0a0a0a',
        black2: '#111111',
        black3: '#181818',
        black4: '#222222',
        white: '#f5f5f0',
        white2: '#a8a8a0',
        white3: '#555550',
        accent: '#c8ff00',
        accent2: '#ff4500',
        border: 'rgba(255, 255, 255, 0.08)',
        border2: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  plugins: [],
};
