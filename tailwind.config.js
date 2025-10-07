/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        light: '#f5f5f5',
        dark: '#1b1b1b',
        primary: '#E53935',
        primaryDark: '#00BCD4',
      },
      fontFamily: {
        mont: ['var(--font-mont)', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
      boxShadow: {
        'dark': '0 30px 90px -15px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'circular-light': 'repeating-radial-gradient(rgba(0, 0, 0, 0.4) 2px, #f5f5f5 5px, #f5f5f5 100px)',
        'circular-dark': 'repeating-radial-gradient(rgba(255, 255, 255, 0.5) 2px, #1b1b1b 8px, #1b1b1b 100px)',
        'circular-light-lg': 'repeating-radial-gradient(rgba(0, 0, 0, 0.4) 2px, #f5f5f5 5px, #f5f5f5 80px)',
        'circular-dark-lg': 'repeating-radial-gradient(rgba(255, 255, 255, 0.5) 2px, #1b1b1b 8px, #1b1b1b 80px)',
        'circular-light-md': 'repeating-radial-gradient(rgba(0, 0, 0, 0.4) 2px, #f5f5f5 5px, #f5f5f5 60px)',
        'circular-dark-md': 'repeating-radial-gradient(rgba(255, 255, 255, 0.5) 2px, #1b1b1b 6px, #1b1b1b 60px)',
        'circular-light-sm': 'repeating-radial-gradient(rgba(0, 0, 0, 0.4) 2px, #f5f5f5 5px, #f5f5f5 40px)',
        'circular-dark-sm': 'repeating-radial-gradient(rgba(255, 255, 255, 0.5) 2px, #1b1b1b 4px, #1b1b1b 40px)',
      },
    },
  },
  plugins: [],
};