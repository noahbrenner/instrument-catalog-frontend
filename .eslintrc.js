// Some configuration inspiration from:
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
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react",
  ],

  plugins: ["@typescript-eslint", "jest-dom", "testing-library"],

  settings: {
    "import/resolver": {
      typescript: {}, // Use <root>/tsconfig.json
    },
    react: {
      version: "detect",
    },
  },

  rules: {
    // Be explicit when an import is only used as a type
    "@typescript-eslint/consistent-type-imports": ["error"],

    // Allow unused function parameters if they start with an underscore
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

    // Use TypeScript-aware implementation of this built-in rule
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],

    // Don't use file extensions when importing modules
    // https://github.com/benmosher/eslint-plugin-import/issues/1615
    "import/extensions": [
      "error",
      "ignorePackages",
      { js: "never", ts: "never", tsx: "never" },
    ],

    // Allow importing devDependencies in buid and test files
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "static.config.js",
          "jest.config.js",
          "**/*.test.ts?(x)",
          "tests/**",
        ],
      },
    ],

    // Use named exports: explicit, consistent, and easier for tooling
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",

    // Allow JSX syntax in .tsx files
    "react/jsx-filename-extension": ["error", { extensions: [".tsx", ".js"] }],
  },

  overrides: [
    {
      files: ["*.js"],
      rules: {
        // We can't define types with TS syntax in JS files to satisfy this rule
        "@typescript-eslint/explicit-module-boundary-types": "off",
        // We're not transpiling JS, so we're using native require()
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      // react-static requires certain files to have default exports
      files: [
        "./static.config.js",
        "./src/index.tsx",
        "./src/containers/**/*.tsx",
        "./src/pages/**/*.tsx",
      ],
      rules: {
        "import/no-default-export": "off",
        "import/prefer-default-export": "error",
      },
    },
  ],
};
