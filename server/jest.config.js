// ═══════════════════════════════════════════════════════════════
//  FretForge — Server Jest Configuration
//  Runs API integration tests with mocked Prisma
//  Usage: cd server && npm test
// ═══════════════════════════════════════════════════════════════

module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  // Set test environment variables so JWT and other config works
  setupFiles: ["./src/__tests__/helpers/env-setup.js"],
  // Reset mocks between tests to prevent state leaking
  clearMocks: true,
  // Timeout for async operations (Prisma mocks should be instant)
  testTimeout: 10000,
};
