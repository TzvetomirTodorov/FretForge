// ═══════════════════════════════════════════════════════════════
//  FretForge — Test App Factory
//  Creates a configured Express app for supertest without starting
//  a listener. Uses the same middleware and routes as production.
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const cors = require("cors");

function createTestApp() {
  const app = express();

  // Minimal middleware — no helmet (not needed in tests), no rate limiting
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  // Mount routes exactly as the real server does
  app.use("/api/auth", require("../../routes/auth"));
  app.use("/api/sessions", require("../../routes/sessions"));
  app.use("/api/progress", require("../../routes/progress"));

  // Health check
  const prisma = require("../../utils/prisma");
  app.get("/api/health", async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "healthy", database: "connected" });
    } catch (err) {
      res.status(500).json({ status: "unhealthy", database: "disconnected" });
    }
  });

  // Error handler
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });

  return app;
}

// Helper: generate a valid JWT for testing authenticated routes
const jwt = require("jsonwebtoken");
function generateTestToken(userId = "test-user-id") {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

module.exports = { createTestApp, generateTestToken };
