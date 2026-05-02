import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 50px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        brand: {
          50: '#f7f4ff',
          100: '#ece6ff',
          200: '#d8c9ff',
          300: '#b79bff',
          400: '#8f6bff',
          500: '#6b4bff',
          600: '#5636d9',
          700: '#4229a8',
          800: '#37237e',
          900: '#2c1d63',
        },
      },
    },
  },
  plugins: [],
};

export default config;
