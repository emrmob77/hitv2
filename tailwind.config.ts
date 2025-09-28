import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./data/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
