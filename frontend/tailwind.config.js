/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d1b16",
        sand: "#f8f1e7",
        cream: "#fff6ec",
        ember: "#c56b2c",
        emberDark: "#9f4f1f",
        olive: "#4a5a3f"
      }
    }
  },
  plugins: []
};
