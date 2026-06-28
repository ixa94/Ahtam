import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "rgb(var(--color-bg-base) / <alpha-value>)",
        surface: "rgb(var(--color-bg-surface) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          soft: "rgb(var(--color-brand-soft) / <alpha-value>)",
          dark: "rgb(var(--color-brand-dark) / <alpha-value>)"
        },
        gold: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)"
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          soft: "rgb(var(--color-ink-soft) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)"
        },
        line: "rgb(var(--color-line) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 60px -32px rgba(46, 38, 28, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
