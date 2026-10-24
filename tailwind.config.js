/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        ink: "hsl(var(--foreground))", "ink-2": "hsl(var(--muted-foreground))", rule: "hsl(var(--border))",
        paper: "hsl(var(--background))", "paper-2": "hsl(var(--card))", "paper-3": "hsl(var(--secondary))",
        "accent-2": "hsl(var(--accent))", "bubble-1": "hsl(var(--tint-1))", "bubble-2": "hsl(var(--tint-2))", "bubble-3": "hsl(var(--tint-3))", "bubble-4": "hsl(var(--tint-4))", "tint-1": "hsl(var(--tint-1))", "tint-2": "hsl(var(--tint-2))", "tint-3": "hsl(var(--tint-3))", "tint-4": "hsl(var(--tint-4))", chip: "hsl(var(--chip) / <alpha-value>)", "chip-ink": "hsl(var(--chip-ink))", "mood-calm": "hsl(var(--mood-calm))", "mood-grow": "hsl(var(--mood-grow))", "mood-warm": "hsl(var(--mood-warm))",
      },
      borderRadius: { card: "20px", pill: "999px", input: "14px", button: "18px", chip: "8px",lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      fontFamily: {
        serif: ["Fraunces_500Medium"], "serif-semibold": ["Fraunces_600SemiBold"],
        sans: ["PlusJakartaSans_400Regular"], "sans-medium": ["PlusJakartaSans_500Medium"], "sans-semibold": ["PlusJakartaSans_600SemiBold"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
