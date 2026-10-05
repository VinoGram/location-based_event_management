const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0,0,0,0.1)",
        hover: "0 2px 8px rgba(0,0,0,0.12)",
        glow: "0 0 20px rgba(251,139,36,0.35)",
        "glow-sm": "0 0 10px rgba(251,139,36,0.2)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      colors: {
        primary: {
          DEFAULT: "#FB8B24",
          hover: "#e07d1f",
        },
        secondary: {
          DEFAULT: "#DDAA52",
          hover: "#c99940",
        },
        accent: {
          DEFAULT: "#A31818",
          hover: "#8a1414",
        },
        surface: {
          DEFAULT: "#111111",
          raised: "#161616",
          overlay: "#1c1c1c",
        },
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        snappy: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "350ms",
        page: "400ms",
      },
      keyframes: {
        "fade-up": {
          "0%":  { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":  { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%":  { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%":  { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":  { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "press": {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(0.94)" },
        },
        "ripple": {
          "0%":   { transform: "scale(0)",   opacity: "0.5" },
          "100%": { transform: "scale(4)",   opacity: "0" },
        },
        "tab-pop": {
          "0%":   { transform: "scale(1)" },
          "40%":  { transform: "scale(1.22) translateY(-3px)" },
          "100%": { transform: "scale(1)   translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(251,139,36,0.3)" },
          "50%":      { boxShadow: "0 0 22px rgba(251,139,36,0.7)" },
        },
        "bounce-in": {
          "0%":   { opacity: "0", transform: "scale(0.3)" },
          "50%":  { opacity: "1", transform: "scale(1.05)" },
          "70%":  {               transform: "scale(0.95)" },
          "100%": {               transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        "fade-in":    "fade-in 0.2s ease both",
        "slide-up":   "slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-down": "slide-down 0.25s cubic-bezier(0.4,0,0.2,1) both",
        "scale-in":   "scale-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
        "press":      "press 0.15s ease both",
        "ripple":     "ripple 0.55s ease-out forwards",
        "tab-pop":    "tab-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
        "shimmer":    "shimmer 1.6s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "bounce-in":  "bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
      scale:     ["active"],
      opacity:   ["active"],
    },
  },
};
