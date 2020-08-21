// Some configuration insipration from:
// https://github.com/iamturns/create-exposed-app/blob/master/.eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2020, // Modern syntax features (doesn't include new globals)
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },

  extends: [
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react",
  ],

  plugins: ["@typescript-eslint"],

  settings: {
    "import/resolver": {
      typescript: {}, // Use <root>/tsconfig.json
    },
    react: {
      version: "detect",
    },
  },

  rules: {
    // Don't use extensions when importing modules
    // https://github.com/benmosher/eslint-plugin-import/issues/1615
    "import/extensions": [
      "error",
      "ignorePackages",
      { js: "never", ts: "never", tsx: "never" },
    ],

    // Allow importing devDependencies in buid and test files
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["static.config.js"] },
    ],

    // Allow JSX syntax in .tsx files
    "react/jsx-filename-extension": ["error", { extensions: [".tsx", ".js"] }],
  },

  overrides: [
    {
      // We can't define types with TS syntax in JS files to satisfy this rule
      files: ["*.js"],
      rules: { "@typescript-eslint/explicit-module-boundary-types": "off" },
    },
  ],
};
