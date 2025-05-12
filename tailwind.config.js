// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          'theme-pink': '#ec4899',        // ピンク（bg, button）
          'theme-pink-dark': '#db2777',   // ホバー用ピンク
          'theme-gray': '#f9fafb',        // 背景用ライトグレー
          'theme-border': '#e5e7eb',      // 境界線（グレー200）
        },
        boxShadow: {
          soft: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
    plugins: [],
  };