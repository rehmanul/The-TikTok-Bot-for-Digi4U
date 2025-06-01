/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border-grey)",
        input: "var(--border-grey)",
        ring: "var(--primary-blue)",
        background: "var(--bg-main)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--primary-blue)",
          foreground: "var(--text-light)",
        },
        secondary: {
          DEFAULT: "var(--medium-grey)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--text-light)",
        },
        muted: {
          DEFAULT: "var(--medium-grey)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--light-grey)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        'ocean-gradient': 'var(--ocean-gradient)',
        'ocean-gradient-light': 'var(--ocean-gradient-light)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
