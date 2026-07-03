import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Single source of truth for the brand accent.
        // Spec asks for a blue/purple style; swap these tokens to change the
        // whole app (e.g. to your usual green #16a34a) in one place.
        brand: {
          50: "#f3f0fe",
          100: "#e9e3fd",
          200: "#d4c8fb",
          300: "#b3a1f6",
          400: "#8f72ef",
          500: "#6d4fe6",
          600: "#5b3ce0",
          700: "#4f46e5",
          800: "#4338ca",
          900: "#312e81",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.1rem",
      },
    },
  },
  plugins: [],
};
export default config;
