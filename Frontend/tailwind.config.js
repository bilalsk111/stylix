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
        stylixLight: {
          background: "#FAFAF9",
          surface: "#FFFFFF",
          section: "#F3F3F1",
          text: {
            primary: "#0B0B0B",
            secondary: "#6B7280",
          },
          accent: {
            primary: "#B4E300",
            hover: "#9FD000",
          },
          border: "#E5E5E5",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ["Inter", "sans-serif"],
        heading: ["'Clash Display'", "sans-serif"],
        body: ["Satoshi", "sans-serif"],
      },
    },
  },
  plugins: [],
};