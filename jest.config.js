require("dotenv/config"); // Load environment variables from .env
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

// Disable the browser-run mock, we'll add test env mocks when needed
process.env.FRONTEND_MOCK_API_SERVER = "false";

module.exports = {
  preset: "ts-jest",

  moduleNameMapper: {
    // Use import paths as defined in tsconfig.json
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),

    // Mock imports for non-script files
    "\\.css$": "<rootDir>/tests/mocks/style.mock.ts",
  },

  // Clear mock calls/counters/instances before each test
  clearMocks: true,

  // Only look for test files in these directories
  roots: ["<rootDir>/src/", "<rootDir>/tests/"],

  setupFilesAfterEnv: [
    "@testing-library/jest-dom",
    "<rootDir>/tests/jest.setup.ts",
  ],
};
