/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#bce3ff",
          300: "#8ed0ff",
          400: "#58b4ff",
          500: "#2f94ff",
          600: "#1875f5",
          700: "#135ee1",
          800: "#174cb6",
          900: "#19428f",
        },
        ink: {
          50: "#f8fafc",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 80% 60% at 50% -30%, rgba(47,148,255,0.35), transparent), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(99,102,241,0.2), transparent), radial-gradient(ellipse 50% 40% at 0% 20%, rgba(20,184,166,0.15), transparent)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 4px 6px rgba(15, 23, 42, 0.05), 0 20px 40px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
