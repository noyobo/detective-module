import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Test environment - equivalent to Jest's testEnvironment: 'node'
    environment: "node",

    // Clear mocks between tests - equivalent to Jest's clearMocks: true
    clearMocks: true,

    // Coverage configuration
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "test/", "*.config.js", "*.config.ts"],
    },

    // Test file patterns - equivalent to Jest's testMatch
    include: [
      "test/**/*.js",
      "test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],

    // Files to exclude from testing
    exclude: ["node_modules/", "dist/", ".git/", ".vscode/"],

    // Watch options for development
    watch: false, // Set to true in watch mode

    // Global test configuration
    globals: true, // Enable global test functions (describe, it, expect) for Jest compatibility

    // Setup files (if needed)
    // setupFiles: [],

    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
