// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D8382B",    // Primary Red
        accent: "#FCA605",     // Accent Yellow
        secondary: "#EADED1",  // Secondary Light
        dark: "#171717",       // Secondary Dark
      },
      fontFamily: {
        'display': ['Outfit Tokyo', 'sans-serif'],  // Primary font for H1, headlines
        'sans': ['Outfit', 'sans-serif'],           // Secondary font for body text
      },
    },
  },
  plugins: [],
}