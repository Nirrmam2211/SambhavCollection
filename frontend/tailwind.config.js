/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: '#0a0a0a', light: '#1a1a1a' },
        ivory:  { DEFAULT: '#f7f2eb', warm: '#ede5d8' },
        gold:   { DEFAULT: '#b8922a', light: '#d4aa50', dark: '#8a6b1e' },
        muted:  { DEFAULT: '#6e665c', light: '#9a9189' },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['"Jost"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.6s ease forwards',
        'slide-up':    'slideUp 0.5s ease forwards',
        'marquee':     'marquee 20s linear infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};
