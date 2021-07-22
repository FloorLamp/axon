const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      xs: "475px",
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        sans: ["Source Sans Pro", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {
      dropShadow: ["hover", "focus"],
      translate: ["group-hover"],
      borderWidth: ["hover", "focus"],
      display: ["group-hover", "hover", "focus"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
