/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        surface: "#1A1A1A",
        surfaceHighlight: "#262626",
        primary: "#F9D16B", // Neon Yellow
        accentPurple: "#C09FF8",
        accentGreen: "#57BF9C",
        muted: "#838383",
        gain: "#00e57a", // Neon tech green (kept for specific highlights if needed)
        expense: "#ff4d4d", // Alert red (kept for specific alerts if needed)
        border: "#262626",
      },
      fontFamily: {
        sans: ["Inter_400Regular", "sans-serif"],
        sansBold: ["Inter_600SemiBold", "sans-serif"],
        mono: ["JetBrainsMono_400Regular", "monospace"],
        monoBold: ["JetBrainsMono_700Bold", "monospace"],
      },
    },
  },
  plugins: [],
};
