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
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-soft": "var(--ink-soft)",
        mint: "var(--mint)",
        "mint-deep": "var(--mint-deep)",
        "mint-pale": "var(--mint-pale)",
        milk: "var(--milk)",
        cherry: "var(--cherry)",
        "cherry-pale": "var(--cherry-pale)",
        lemon: "var(--lemon)",
        "lemon-pale": "var(--lemon-pale)",
        gum: "var(--gum)",
        teal: "var(--teal)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      borderWidth: { 3: "3px", 5: "5px" },
    },
  },
  plugins: [forms],
};
export default config;
