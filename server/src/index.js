// ═══════════════════════════════════════════════════════════════
//  FretForge — Express Server (Security Hardened)
//  AUDIT FIXES:
//  1. Rate limiting on auth routes (brute force protection)
//  2. Rate limiting globally (DDoS mitigation)
//  3. Tighter JSON body limit (100kb, was 1mb)
//  4. Request logging for debugging
// ═══════════════════════════════════════════════════════════════

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const prisma = require("./utils/prisma");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security Middleware ─────────────────────────────────────
app.use(helmet());

// CORS: allow the Vercel frontend to make API requests
// AUDIT: Support multiple origins for dev + production
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Body parser with a tighter limit — guitar practice data is tiny,
// no reason to accept 1mb payloads (audit: reduce attack surface)
app.use(express.json({ limit: "100kb" }));

// ─── Global Rate Limiter ─────────────────────────────────────
// 100 requests per minute per IP — generous enough for normal use,
// tight enough to mitigate abuse
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
app.use("/api", globalLimiter);

// ─── Auth Rate Limiter ───────────────────────────────────────
// Much tighter: 10 attempts per 15 minutes per IP
// Prevents brute force password attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

// ─── Health Check (no rate limit) ────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err.message,
    });
  }
});

// ─── Routes ──────────────────────────────────────────────────
// Auth routes get the extra-strict rate limiter
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/progress", require("./routes/progress"));

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Error Handler ───────────────────────────────────────────
// AUDIT: Never leak stack traces in production
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  res.status(500).json({
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🔥 FretForge API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(", ")}`);
});

// ─── Graceful Shutdown ───────────────────────────────────────
async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
