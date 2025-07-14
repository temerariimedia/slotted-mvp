import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563eb',
          secondary: '#3b82f6',
          accent: '#10b981',
        }
      }
    },
  },
  plugins: [],
} satisfies Config;