/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E8E5A",
        secondary: "#F4F6F8",
        warning: "#F2C94C",
        danger: "#EB5757",
        text: "#1F2937",
      },
    },
  },
  plugins: [],
};
