import "dotenv/config"; // Load environment variables from .env

// Typescript support in static.config.js is not yet supported, but is coming in a future update!

export default {
  entry: "index.tsx", // Relative to paths.src
  plugins: [
    ["react-static-plugin-typescript", { typeCheck: false }], // Lint separately
    ["react-static-plugin-source-filesystem", { location: "./src/pages" }],
    "react-static-plugin-reach-router",
    "react-static-plugin-sitemap",
    "react-static-plugin-styled-components",
  ],

  // Dynamic configuration
  devServer: {
    port: Number(process.env.FRONTEND_DEVSERVER_PORT) || 5000,
  },
  siteRoot: process.env.FRONTEND_PROD_SITE_ROOT,
  basePath: process.env.FRONTEND_PROD_BASE_PATH,
};
