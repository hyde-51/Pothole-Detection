/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scan: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' },
        }
      },
      animation: {
        scan: 'scan 3s ease-in-out infinite',
      },
      // Here we tell Tailwind to use our CSS variables for its colors!
      colors: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        content: 'var(--text-primary)',
        muted: 'var(--text-secondary)',
        borderline: 'var(--border-color)',
        accent: 'var(--accent)',
        cta: 'var(--bg-cta)',
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
      }
    },
  },
  plugins: [],
}