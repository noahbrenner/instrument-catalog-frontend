/* eslint-disable no-console */
import "dotenv/config"; // Load environment variables from .env

// Typescript support in static.config.js is not yet supported, but is coming in a future update!

(function checkForRequiredEnvironmentVariables() {
  const alwaysRequiredEnvVars = ["API_ROOT"];
  const oauthEnvVars = [
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_BACKEND_API_IDENTIFIER",
  ];

  const requiredEnvVars =
    process.env.NODE_ENV === "production"
      ? [...alwaysRequiredEnvVars, ...oauthEnvVars, "FRONTEND_PROD_SITE_ROOT"]
      : [...alwaysRequiredEnvVars];

  const optionalEnvVars =
    process.env.NODE_ENV === "production"
      ? ["FRONTEND_PROD_BASE_PATH"]
      : [...oauthEnvVars, "FRONTEND_MOCK_API_SERVER"];

  const isUnsetEnvVar = (key) => [undefined, ""].includes(process.env[key]);

  const missingEnvVars = requiredEnvVars.filter(isUnsetEnvVar);
  const missingOptionalEnvVars = optionalEnvVars.filter(isUnsetEnvVar);

  if (missingEnvVars.length > 0) {
    const lines = [
      "The following environment variables are required:",
      ...missingEnvVars.map((str) => `- ${str}`),
      "",
    ];
    console.error(lines.join("\n"));
    process.exit(1);
  }

  if (missingOptionalEnvVars.length > 0) {
    const lines = [
      "Optional environment variables that you can set:",
      ...missingOptionalEnvVars.map((str) => `- ${str}`),
      "",
    ];
    console.warn(lines.join("\n"));
  }
})();

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
