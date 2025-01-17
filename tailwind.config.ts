import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      "mint-green": "#1fd698",
    },
    keyframes: {
      disappearTopBottom: {
        '0%': { transform: 'translateY(0)', opacity: '1' },
        '100%': { transform: 'translateY(100%)', opacity: '0' },
      },
    },
    animation: {
      disappearTopBottom: 'disappearTopBottom 2s ease-out forwards',
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};
export default config;
