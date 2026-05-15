/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#e2e8f0",
        card: "#111827",
        border: "#1e293b",
        accent: "#6ee7b7",
        "accent-foreground": "#0a0a0f",
        secondary: "#1e293b",
        "muted-foreground": "#64748b",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
