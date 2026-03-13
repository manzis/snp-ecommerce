import type { Config } from "tailwindcss";

const config: Config = {
  // This flag prevents hover states from sticking on mobile touch screens
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
    fontFamily: {
      titillium: ["var(--font-titillium)", "sans-serif"],
      inter: ["var(--font-inter)", "sans-serif"],
      custom: ["var(--font-custom)", "sans-serif"],
    },
    },
  },
  plugins: [],
};

export default config;