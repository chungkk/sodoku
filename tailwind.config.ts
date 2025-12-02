import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        success: {
          500: "#22c55e",
          600: "#16a34a",
        },
        error: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "bounce-subtle": "bounce-subtle 0.3s ease-in-out",
        "pulse-success": "pulse-success 0.5s ease-in-out",
      },
      keyframes: {
        "bounce-subtle": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "pulse-success": {
          "0%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)" },
          "100%": { boxShadow: "0 0 0 10px rgba(34, 197, 94, 0)" },
        },
      },
    },
  },
  plugins: [forms],
};
export default config;
