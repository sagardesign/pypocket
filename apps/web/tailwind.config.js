/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hero: ["var(--font-merriweather)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        // Linear/Vercel inspired premium color maps
        background: "#F8F9FA",
        foreground: "#000000",
        mono: {
          50: "#F8F9FA",
          100: "#F1F3F5",
          200: "#E9ECEF",
          300: "#DEE2E6",
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#6C757D",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
          950: "#000000"
        },
        primary: {
          DEFAULT: "#000000",
          foreground: "#F8F9FA",
        },
        secondary: {
          DEFAULT: "#0c69c7",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#DD6B20",
          foreground: "#FFFFFF",
        },
        border: "#E9ECEF",
        input: "#E9ECEF",
      },
      boxShadow: {
        premium: "0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 4px 20px -2px rgba(0, 0, 0, 0.06)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      }
    },
  },
  plugins: [],
}
