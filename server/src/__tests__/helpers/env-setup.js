// Sets environment variables before any test modules load
// This runs via Jest's setupFiles (before each test file)
process.env.JWT_SECRET = "test-secret-key-do-not-use-in-production";
process.env.NODE_ENV = "test";
process.env.CLIENT_URL = "http://localhost:5173";
