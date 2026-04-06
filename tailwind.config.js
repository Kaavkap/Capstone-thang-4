/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8ff",
          100: "#dfe9ff",
          500: "#3662ff",
          600: "#204ff5",
          700: "#173cca"
        }
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 35px -25px rgba(32, 79, 245, 0.85)"
      }
    }
  },
  plugins: []
};

