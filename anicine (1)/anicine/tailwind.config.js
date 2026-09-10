/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0B0E1A",
        panel: "#12162A",
        panel2: "#171C33",
        line: "#23283F",
        ink: "#F2F1F8",
        muted: "#8B8FA8",
        neon: "#FF3D68",
        neondim: "#B22850",
        cyan: "#35E7C7",
        gold: "#F4B740",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 20% 20%, rgba(255,61,104,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(53,231,199,0.06), transparent 35%)",
      },
    },
  },
  plugins: [],
};
