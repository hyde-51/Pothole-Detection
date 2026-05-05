/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        content: "var(--content)",
        muted: "var(--muted)",
        borderline: "var(--borderline)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};