/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Here we tell Tailwind to use our CSS variables for its colors!
      colors: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        content: 'var(--text-primary)',
        muted: 'var(--text-secondary)',
        borderline: 'var(--border-color)',
        accent: 'var(--accent)',
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
      }
    },
  },
  plugins: [],
}