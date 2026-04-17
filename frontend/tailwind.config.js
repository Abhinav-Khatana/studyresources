/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── New Brand: Electric Indigo → Cyan (modern SaaS palette) ──
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // ── Accent: Emerald for success/highlights ──
        accent: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        // ── Surface: Ultra-dark charcoal ──
        surface: {
          DEFAULT: "#09090b",
          card:    "#111115",
          border:  "#1e1e24",
          hover:   "#16161c",
          muted:   "#27272a",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease-out",
        "slide-up":  "slideUp 0.4s ease-out",
        "slide-in":  "slideIn 0.3s ease-out",
        "pulse-slow":"pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideIn: { from: { opacity: 0, transform: "translateX(-12px)" }, to: { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
