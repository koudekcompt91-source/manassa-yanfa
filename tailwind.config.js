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
        /** Layered deep navy / indigo — restrained blue lift, no bright teal wash */
        "hero-mesh":
          "radial-gradient(ellipse 88% 58% at 50% -32%, rgba(30,58,138,0.42), transparent 56%), radial-gradient(ellipse 62% 48% at 100% -2%, rgba(49,46,129,0.26), transparent 52%), radial-gradient(ellipse 58% 44% at 0% 12%, rgba(15,23,42,0.55), transparent 50%), radial-gradient(ellipse 48% 36% at 78% 92%, rgba(23,37,84,0.38), transparent 52%)",
        /** Floor ink + corner indigo — keeps hero legible and luxurious */
        "hero-atmosphere":
          "radial-gradient(ellipse 98% 72% at 50% 110%, rgba(2,6,23,0.78), transparent 54%), radial-gradient(ellipse 58% 48% at 0% 6%, rgba(30,27,102,0.32), transparent 50%), radial-gradient(ellipse 52% 44% at 100% 10%, rgba(30,58,138,0.26), transparent 48%), radial-gradient(ellipse 42% 34% at 50% 42%, rgba(15,23,42,0.2), transparent 62%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 4px 6px rgba(15, 23, 42, 0.05), 0 20px 40px rgba(15, 23, 42, 0.08)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(15, 23, 42, 0.45), 0 0 120px rgba(47, 148, 255, 0.18)",
        "card-luxury":
          "0 2px 4px rgba(15, 23, 42, 0.03), 0 20px 48px -12px rgba(15, 23, 42, 0.09), 0 0 0 1px rgba(148, 163, 184, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.75)",
        "card-luxury-hover":
          "0 6px 12px rgba(15, 23, 42, 0.05), 0 28px 56px -16px rgba(15, 23, 42, 0.13), 0 0 0 1px rgba(99, 102, 241, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.85)",
        "portrait-halo":
          "0 0 0 1px rgba(255,255,255,0.14), 0 0 100px -20px rgba(47, 148, 255, 0.45), 0 40px 100px -30px rgba(15, 23, 42, 0.65)",
        tactile:
          "0 1px 0 0 rgba(255,255,255,0.55) inset, 0 10px 28px -8px rgba(15, 23, 42, 0.28), 0 1px 2px rgba(15, 23, 42, 0.06)",
        "tactile-ghost":
          "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 8px 24px -10px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
        "tactile-brand":
          "0 1px 0 0 rgba(255,255,255,0.22) inset, 0 12px 32px -8px rgba(24, 117, 245, 0.45), 0 4px 12px rgba(15, 23, 42, 0.2)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-glow": {
          "0%, 100%": { opacity: "0.66" },
          "50%": { opacity: "0.705" },
        },
        "ambient-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(0.18%, -0.1%) scale(1.001)" },
          "66%": { transform: "translate(-0.14%, 0.12%) scale(1)" },
        },
        "hero-aurora": {
          "0%, 100%": { opacity: "0.09", transform: "scale(1) translate3d(0, 0, 0)" },
          "50%": { opacity: "0.11", transform: "scale(1.0006) translate3d(0.03%, -0.015%, 0)" },
        },
        /** Tinted depth — indigo/navy drift only */
        "hero-veil": {
          "0%, 100%": { opacity: "0.098", transform: "translate3d(-0.15%, 0, 0)" },
          "50%": { opacity: "0.118", transform: "translate3d(0.15%, 0.04%, 0)" },
        },
        /** Very slow mesh drift — background-position only on hero utility layer */
        "hero-mesh-flow": {
          "0%, 100%": { backgroundPosition: "50% 0%, 80% 0%, 20% 20%" },
          "50%": { backgroundPosition: "49.5% 0.35%, 79.7% 0.35%, 20.2% 19.75%" },
        },
        "hero-rise": {
          "0%": { opacity: "0", transform: "translate3d(0, 0.35rem, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        /** First-paint header — minimal travel, no “bounce in” energy */
        "nav-choreo": {
          "0%": { opacity: "0", transform: "translate3d(0, 0.12rem, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "soft-glow": "soft-glow 18s ease-in-out infinite",
        "ambient-drift": "ambient-drift 52s ease-in-out infinite",
        "hero-rise": "hero-rise 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "nav-choreo": "nav-choreo 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "hero-aurora": "hero-aurora 48s ease-in-out infinite",
        "hero-veil": "hero-veil 60s ease-in-out infinite",
        "hero-mesh-flow": "hero-mesh-flow 88s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
