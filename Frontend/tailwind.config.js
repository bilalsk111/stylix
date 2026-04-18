export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        stylix: {
          dark: "#1A1A1A",
          light: "#F9F9F7",      // Main Background
          muted: "#E5E2E1",      // Secondary surfaces
          accent: "#000000",     // Main Text/Buttons
          border: "#EEEEEE",     // Lines
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};