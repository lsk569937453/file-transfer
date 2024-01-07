// const { nextui } = require("@nextui-org/react");
const konstaConfig = require('konsta/config');

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"

//   ],
//   theme: {
//     extend: {},
//   },
//   darkMode: "class",
//   plugins: [nextui()]
// }

module.exports = konstaConfig({
  // rest of your usual Tailwind CSS config here
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"

  ],
  theme: {
    extend: {},
  },
});