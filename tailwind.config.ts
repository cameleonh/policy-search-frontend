import type { Config } from "tailwindcss";

/**
 * Design tokens for Policy Search.
 *
 * The tri-state eligibility scale (eligible / possible / ineligible) is the
 * product's core mental model and is reflected as first-class semantic colors.
 * Each tri-state token exposes bg / border / text variants so the same verdict
 * can drive both a Badge and a Card surface.
 *
 * Palette finalized from the multi-agent design pipeline; values are chosen to
 * clear WCAG AA against the surfaces they're paired with.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ───────────────────────────────────────────────
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          300: "rgb(var(--brand-300) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "rgb(var(--brand-800) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
        },
        // ── Semantic: eligibility verdict ───────────────────────
        // eligible = 지원 가능 (green)
        eligible: {
          bg: "rgb(var(--eligible-bg) / <alpha-value>)",
          border: "rgb(var(--eligible-border) / <alpha-value>)",
          text: "rgb(var(--eligible-text) / <alpha-value>)",
          solid: "rgb(var(--eligible-solid) / <alpha-value>)",
        },
        // possible = 가능성 있음 (amber)
        possible: {
          bg: "rgb(var(--possible-bg) / <alpha-value>)",
          border: "rgb(var(--possible-border) / <alpha-value>)",
          text: "rgb(var(--possible-text) / <alpha-value>)",
          solid: "rgb(var(--possible-solid) / <alpha-value>)",
        },
        // ineligible = 지원 불가 (red)
        ineligible: {
          bg: "rgb(var(--ineligible-bg) / <alpha-value>)",
          border: "rgb(var(--ineligible-border) / <alpha-value>)",
          text: "rgb(var(--ineligible-text) / <alpha-value>)",
          solid: "rgb(var(--ineligible-solid) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xs: "calc(var(--radius) * 0.5)",
        sm: "calc(var(--radius) * 0.75)",
        DEFAULT: "var(--radius)",
        md: "calc(var(--radius) * 1.25)",
        lg: "calc(var(--radius) * 1.75)",
        xl: "calc(var(--radius) * 2.5)",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
        "card-hover": "0 4px 12px -2px rgb(0 0 0 / 0.12), 0 2px 6px -2px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
